import { type FetchOptions, ofetch } from "ofetch";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

const apiFetch = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  retry: 0,
});

type ApiRequestOptions = FetchOptions<"json">;
let refreshInFlight: Promise<unknown> | null = null;

function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = apiFetch("/auth/refresh-token", {
      method: "POST",
    }).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function apiClient<T = unknown>(
  request: string,
  options?: ApiRequestOptions,
): Promise<T> {
  try {
    return await apiFetch<T>(request, options);
  } catch (error) {
    const method = options?.method?.toUpperCase() ?? "GET";
    const isAuthRequest = request.includes("/auth/");
    const status =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "status" in error.response
        ? error.response.status
        : undefined;

    if (status !== 401 || isAuthRequest || method === "OPTIONS") throw error;

    await refreshAccessToken();
    return apiFetch<T>(request, options);
  }
}

export default apiClient;

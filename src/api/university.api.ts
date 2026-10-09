import apiClient from "@/lib/apiClient";
import type { User } from "@/types";

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type Resource = Record<string, unknown>;
export type ListQuery = Record<string, string | number | undefined>;

function queryString(query?: ListQuery) {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export const universityApi = {
  me: () => apiClient<ApiEnvelope<Resource>>("/user/me"),
  updateProfile: (body: Resource) =>
    apiClient<ApiEnvelope<Resource>>("/user/me", { method: "PATCH", body }),
  uploadProfileImage: (file: File) => {
    const body = new FormData();
    body.append("profileImage", file);
    return apiClient<ApiEnvelope<User>>("/user/profile-image", {
      method: "PATCH",
      body,
    });
  },
  adminStats: () => apiClient<ApiEnvelope<Resource>>("/admin/dashboard/stats"),

  list: (resource: string, query?: ListQuery) =>
    apiClient<ApiEnvelope<unknown>>(`/${resource}${queryString(query)}`),
  get: (resource: string, id: string) =>
    apiClient<ApiEnvelope<Resource>>(`/${resource}/${encodeURIComponent(id)}`),
  create: (resource: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(`/${resource}`, {
      method: "POST",
      body,
    }),
  update: (resource: string, id: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(`/${resource}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),
  remove: (resource: string, id: string) =>
    apiClient<ApiEnvelope<null>>(`/${resource}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  registerSection: (sectionId: string) =>
    apiClient<ApiEnvelope<Resource>>("/enrollments", {
      method: "POST",
      body: { sectionId },
    }),
  dropEnrollment: (id: string) =>
    apiClient<ApiEnvelope<null>>(`/enrollments/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  attendanceBySection: (sectionId: string) =>
    apiClient<ApiEnvelope<unknown>>(
      `/attendance/section/${encodeURIComponent(sectionId)}`,
    ),
  recordAttendance: (sectionId: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(
      `/attendance/section/${encodeURIComponent(sectionId)}`,
      { method: "POST", body },
    ),
  createExam: (body: Resource) =>
    apiClient<ApiEnvelope<Resource>>("/exams", { method: "POST", body }),
  createResult: (body: Resource) =>
    apiClient<ApiEnvelope<Resource>>("/results", { method: "POST", body }),
  publishExam: (id: string) =>
    apiClient<ApiEnvelope<Resource>>(
      `/exams/${encodeURIComponent(id)}/publish`,
      {
        method: "POST",
      },
    ),
  publishResult: (id: string) =>
    apiClient<ApiEnvelope<Resource>>(
      `/results/${encodeURIComponent(id)}/publish`,
      { method: "POST" },
    ),
  markNotificationRead: (id: string) =>
    apiClient<ApiEnvelope<Resource>>(
      `/notifications/${encodeURIComponent(id)}/read`,
      { method: "PATCH" },
    ),
  removeCoursePrerequisite: (courseId: string, prerequisiteId: string) =>
    apiClient<ApiEnvelope<null>>(
      `/course-prerequisites/${encodeURIComponent(courseId)}/${encodeURIComponent(prerequisiteId)}`,
      { method: "DELETE" },
    ),
  startPayment: (
    invoiceId: string,
    gateway: "STRIPE" | "BKASH" | "SSLCOMMERZ",
  ) =>
    apiClient<ApiEnvelope<Resource>>("/payments/initiate", {
      method: "POST",
      body: { invoiceId, gateway },
    }),
};

export function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    if ("data" in error && isRecord(error.data)) {
      if (typeof error.data.message === "string") {
        return error.data.message;
      }
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return "The request could not be completed. Please try again.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

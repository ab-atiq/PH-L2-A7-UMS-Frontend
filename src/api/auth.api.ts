import apiClient from "@/lib/apiClient";
import type {
  LoginPayload,
  RegistrationPayload,
  User,
  VerifyAccountPayload,
} from "@/types";
import type { ApiEnvelope } from "./university.api";

export function userLogin(payload: LoginPayload) {
  return apiClient<ApiEnvelope<unknown>>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function verifyAccount(payload: VerifyAccountPayload) {
  return apiClient<ApiEnvelope<unknown>>("/auth/verify-email", {
    method: "POST",
    body: payload,
  });
}

export function userRegistration(payload: RegistrationPayload) {
  return apiClient<ApiEnvelope<unknown>>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function requestPasswordReset(payload: { email: string }) {
  return apiClient<ApiEnvelope<unknown>>("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export function resetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  return apiClient<ApiEnvelope<unknown>>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

export function userLogout() {
  return apiClient<ApiEnvelope<unknown>>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiClient<ApiEnvelope<User>>("/user/me");
}

export function googleOAuth(payload: { idToken: string }) {
  return apiClient<ApiEnvelope<unknown>>("/auth/google", {
    method: "POST",
    body: payload,
  });
}

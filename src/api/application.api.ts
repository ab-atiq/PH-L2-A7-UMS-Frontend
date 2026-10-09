import type { ApiEnvelope } from "@/api/university.api";
import apiClient from "@/lib/apiClient";
import type { RoleApplication } from "@/types";

export type CreateRoleApplicationPayload =
  | {
      requestedRole: "STUDENT";
      programInterest: string;
      statement: string;
    }
  | {
      requestedRole: "FACULTY";
      departmentInterest: string;
      highestQualification: string;
      specialization?: string;
      statement: string;
    };

export function getMyRoleApplication() {
  return apiClient<ApiEnvelope<RoleApplication | null>>("/applications/me");
}

export function listRoleApplications(query: {
  page?: number;
  limit?: number;
  search?: string;
  requestedRole?: "STUDENT" | "FACULTY";
  status?: "PENDING" | "APPROVED" | "REJECTED";
}) {
  return apiClient<
    ApiEnvelope<
      (RoleApplication & {
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          phone: string | null;
          avatarUrl: string | null;
          role: string;
          status: string;
        };
      })[]
    >
  >("/applications", { params: query });
}

export function updateRoleApplicationStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
) {
  return apiClient<ApiEnvelope<RoleApplication>>(
    `/applications/${encodeURIComponent(id)}/status`,
    { method: "PATCH", body: { status } },
  );
}

export function createRoleApplication(payload: CreateRoleApplicationPayload) {
  return apiClient<ApiEnvelope<RoleApplication>>("/applications", {
    method: "POST",
    body: payload,
  });
}

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

export function createRoleApplication(payload: CreateRoleApplicationPayload) {
  return apiClient<ApiEnvelope<RoleApplication>>("/applications", {
    method: "POST",
    body: payload,
  });
}

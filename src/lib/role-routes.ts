import type { UserRole } from "@/types";

const roleSegments: Record<UserRole, string> = {
  ADMIN: "admin",
  FACULTY: "faculty",
  STUDENT: "student",
  USER: "user",
};

export function getRoleDashboardPath(role: UserRole) {
  return `/${roleSegments[role]}/dashboard`;
}

export function getRoleWorkspacePath(role: UserRole, resource: string) {
  return `/${roleSegments[role]}/workspace/${encodeURIComponent(resource)}`;
}

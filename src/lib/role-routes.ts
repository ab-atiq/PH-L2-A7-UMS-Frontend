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

export function getRoleProfilePath(role: UserRole) {
  return `/${roleSegments[role]}/profile`;
}

export function getRoleWorkspacePath(role: UserRole, resource: string) {
  if (role === "ADMIN" && resource === "faculty") return "/admin/faculty";
  return `/${roleSegments[role]}/workspace/${encodeURIComponent(resource)}`;
}

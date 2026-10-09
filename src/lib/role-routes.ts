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
  if (role === "ADMIN" && ["faculty", "users", "students"].includes(resource))
    return `/admin/${resource}`;
  return `/${roleSegments[role]}/workspace/${encodeURIComponent(resource)}`;
}

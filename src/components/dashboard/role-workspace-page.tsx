"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthLoading from "@/components/auth/auth-loading";
import WorkspacePage from "@/components/dashboard/workspace-page";
import {
  getRoleDashboardPath,
  getRoleProfilePath,
  getRoleWorkspacePath,
} from "@/lib/role-routes";
import type { UserRole } from "@/types";

const roleResources: Record<UserRole, readonly string[]> = {
  ADMIN: [
    "profile",
    "notifications",
    "users",
    "students",
    "faculty",
    "departments",
    "programs",
    "courses",
    "enrollments",
    "invoices",
    "payments",
    "audit-logs",
    "settings",
  ],
  FACULTY: [
    "profile",
    "attendance",
    "exams",
    "results",
    "notifications",
    "settings",
  ],
  STUDENT: [
    "profile",
    "enrollments",
    "attendance",
    "exams",
    "results",
    "transcript",
    "invoices",
    "notifications",
    "settings",
  ],
  USER: ["profile"],
};

export default function RoleWorkspacePage({
  userRole,
}: {
  userRole: UserRole;
}) {
  const { resource } = useParams<{ resource: string }>();
  const router = useRouter();
  const isAllowed = roleResources[userRole].includes(resource);

  useEffect(() => {
    if (resource === "profile") {
      router.replace(getRoleProfilePath(userRole));
    } else if (
      userRole === "ADMIN" &&
      ["faculty", "users", "students"].includes(resource)
    ) {
      router.replace(getRoleWorkspacePath(userRole, resource));
    } else if (!isAllowed) {
      router.replace(getRoleDashboardPath(userRole));
    }
  }, [isAllowed, resource, router, userRole]);

  if (
    resource === "profile" ||
    !isAllowed ||
    (userRole === "ADMIN" &&
      ["faculty", "users", "students"].includes(resource))
  ) {
    return <AuthLoading label="Opening your profile..." />;
  }
  return <WorkspacePage resource={resource} />;
}

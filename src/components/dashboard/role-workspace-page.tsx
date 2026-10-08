"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthLoading from "@/components/auth/auth-loading";
import WorkspacePage from "@/components/dashboard/workspace-page";
import { getRoleDashboardPath } from "@/lib/role-routes";
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
    "semesters",
    "sections",
    "course-prerequisites",
    "enrollments",
    "invoices",
    "payments",
    "audit-logs",
    "settings",
  ],
  FACULTY: [
    "profile",
    "sections",
    "attendance",
    "exams",
    "results",
    "notifications",
    "settings",
  ],
  STUDENT: [
    "profile",
    "courses",
    "course-registration",
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
    if (!isAllowed) router.replace(getRoleDashboardPath(userRole));
  }, [isAllowed, router, userRole]);

  if (!isAllowed) return <AuthLoading label="Opening your dashboard..." />;
  return <WorkspacePage resource={resource} />;
}

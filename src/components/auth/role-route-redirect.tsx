"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthLoading from "@/components/auth/auth-loading";
import { useGetMe } from "@/hooks";
import { getRoleDashboardPath, getRoleWorkspacePath } from "@/lib/role-routes";

export default function RoleRouteRedirect({ resource }: { resource?: string }) {
  const router = useRouter();
  const { data, isPending, isError } = useGetMe();
  const role = data?.data?.role;

  useEffect(() => {
    if (isPending) return;
    if (isError || !role) {
      router.replace("/login");
      return;
    }
    router.replace(
      resource
        ? getRoleWorkspacePath(role, resource)
        : getRoleDashboardPath(role),
    );
  }, [isError, isPending, resource, role, router]);

  return <AuthLoading label="Opening your dashboard..." />;
}

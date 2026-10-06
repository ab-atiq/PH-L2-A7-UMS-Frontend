"use client";

import type { ReactNode } from "react";
import AuthLoading from "@/components/auth/auth-loading";
import { useGetMe } from "@/hooks";
import DashboardShell from "./dashboard-shell";

export default function RoleDashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const { data, isPending, isError } = useGetMe();
  const role = data?.data?.role;

  if (isPending) return <AuthLoading />;
  if (isError || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-muted-foreground">
        Unable to load your account. Please sign in again.
      </div>
    );
  }

  return <DashboardShell userRole={role}>{children}</DashboardShell>;
}

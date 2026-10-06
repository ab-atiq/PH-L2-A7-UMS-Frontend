import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["FACULTY"]}>
      <DashboardShell userRole="FACULTY">{children}</DashboardShell>
    </RoleGuard>
  );
}

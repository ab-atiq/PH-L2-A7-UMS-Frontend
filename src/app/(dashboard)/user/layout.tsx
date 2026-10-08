import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["USER"]}>
      <DashboardShell userRole="USER">{children}</DashboardShell>
    </RoleGuard>
  );
}

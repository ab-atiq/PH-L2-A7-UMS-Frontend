import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import RoleDashboardShell from "@/components/dashboard/role-dashboard-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["STUDENT", "FACULTY", "ADMIN"]}>
      <RoleDashboardShell>{children}</RoleDashboardShell>
    </RoleGuard>
  );
}

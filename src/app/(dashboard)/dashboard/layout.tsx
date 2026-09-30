import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { ReactNode } from "react";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["PATIENT"]}>
      <DashboardShell role="PATIENT">{children}</DashboardShell>
    </RoleGuard>
  );
}

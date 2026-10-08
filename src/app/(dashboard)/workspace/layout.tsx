import type { ReactNode } from "react";
import RoleDashboardShell from "@/components/dashboard/role-dashboard-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <RoleDashboardShell>{children}</RoleDashboardShell>;
}

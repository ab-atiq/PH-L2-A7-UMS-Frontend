import { Bell, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/types";
import { DashboardSidebar } from "./dashboard-sidebar";

export default function DashboardShell({
  children,
  userRole,
}: {
  children: ReactNode;
  userRole: UserRole;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar userRole={userRole} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden items-center gap-2 sm:flex">
              <Search className="size-4" />
              University Management
            </span>
            <span className="hidden rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase sm:inline">
              {userRole}
            </span>
            <Link href="/workspace/profile" className="hover:text-foreground">
              Profile
            </Link>
            <Link
              href="/workspace/notifications"
              aria-label="Notifications"
              className="rounded-md p-1 hover:bg-muted hover:text-foreground"
            >
              <Bell className="size-4" />
            </Link>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import { getApiErrorMessage } from "@/api";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import { useLogout } from "@/hooks";
import { getRoleProfilePath, getRoleWorkspacePath } from "@/lib/role-routes";
import type { UserRole } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";

export default function DashboardShell({
  children,
  userRole,
}: {
  children: ReactNode;
  userRole: UserRole;
}) {
  const queryClient = useQueryClient();
  const { mutate: logout } = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Tata",
          description: "Logged out successfully",
          type: "success",
        });
        queryClient.removeQueries({ queryKey: ["user"] });
        router.push("/");
      },
      onError: (error) => {
        toast.add({
          title: "Logout failed",
          description: getApiErrorMessage(error),
          type: "error",
        });
      },
    });
  };

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

            <Link
              href={getRoleProfilePath(userRole)}
              className="hover:text-foreground"
            >
              Profile
            </Link>
            {userRole !== "USER" && (
              <Link
                href={getRoleWorkspacePath(userRole, "notifications")}
                aria-label="Notifications"
                className="rounded-md p-1 hover:bg-muted hover:text-foreground"
              >
                <Bell className="size-4" />
              </Link>
            )}
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

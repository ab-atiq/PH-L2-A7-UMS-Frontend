"use client";

import Logo from "@/assets/svg/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  adminRoutes,
  facultyRoutes,
  studentRoutes,
  userRoutes,
} from "@/routes";
import type { UserRole } from "@/types";
import type { SidebarItems } from "@/types/sidebar.type";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarRoutes: Partial<Record<UserRole, SidebarItems>> = {
  ADMIN: adminRoutes,
  FACULTY: facultyRoutes,
  STUDENT: studentRoutes,
  USER: userRoutes,
};

export function DashboardSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();
  const routes: SidebarItems = sidebarRoutes[userRole] || [];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/">
          <div className="flex items-center gap-3">
            <div>
              <Logo />
            </div>
            <div>
              <p className="font-semibold">University Portal</p>
              <p className="hidden rounded bg-orange-300 px-2.5 py-1 text-xs font-small uppercase sm:inline">
                {userRole}
              </p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {routes.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={
                        pathname === item.url ||
                        (item.url.includes("/workspace/") &&
                          pathname.startsWith(`${item.url}/`))
                      }
                    >
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

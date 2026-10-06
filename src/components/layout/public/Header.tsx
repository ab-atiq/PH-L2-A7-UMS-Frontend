"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getApiErrorMessage } from "@/api";
import Logo from "@/assets/svg/Logo";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hooks";
import type { UserRole } from "@/types";

export default function Header() {
  const routes = [
    { name: "Home", url: "/" },
    { name: "Academics", url: "/#academics" },
    { name: "About", url: "/#about" },
  ];

  const dashboardRoute: Record<UserRole, string> = {
    ADMIN: "/dashboard",
    FACULTY: "/dashboard",
    STUDENT: "/dashboard",
  };

  const { data, isLoading } = useGetMe();
  const { mutate: logout } = useLogout();
  const queryClient = useQueryClient();

  const role = data?.data?.role;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Tata",
          description: "Logged out successfully",
          type: "success",
        });
        queryClient.removeQueries({ queryKey: ["user"] });
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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span>University Portal</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {routes.map((route) => (
            <Link key={route.url} href={route.url}>
              {route.name}
            </Link>
          ))}

          {role && <Link href={dashboardRoute[role]}>Dashboard</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {!isLoading && !data?.data && (
            <>
              <Button
                variant="ghost"
                render={<Link href="/login" />}
                nativeButton={false}
              >
                Sign in
              </Button>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                className="hidden sm:inline-flex"
              >
                Apply
              </Button>
            </>
          )}
          {!isLoading && data?.data && (
            <Button onClick={handleLogout} variant="outline">
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

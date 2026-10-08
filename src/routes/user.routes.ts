import { getRoleDashboardPath, getRoleWorkspacePath } from "@/lib/role-routes";

export const userRoutes = [
  {
    title: "Getting started",
    items: [
      {
        title: "Dashboard",
        url: getRoleDashboardPath("USER"),
      },
      {
        title: "My profile",
        url: getRoleWorkspacePath("USER", "profile"),
      },
    ],
  },
];

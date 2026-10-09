import { getRoleDashboardPath, getRoleProfilePath } from "@/lib/role-routes";

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
        url: getRoleProfilePath("USER"),
      },
    ],
  },
];

import {
  getRoleDashboardPath,
  getRoleProfilePath,
  getRoleWorkspacePath,
} from "@/lib/role-routes";

export const adminRoutes = [
  {
    title: "Workspace",
    items: [
      {
        title: "Dashboard",
        url: getRoleDashboardPath("ADMIN"),
      },
      {
        title: "My profile",
        url: getRoleProfilePath("ADMIN"),
      },
      {
        title: "Notifications",
        url: getRoleWorkspacePath("ADMIN", "notifications"),
      },
      {
        title: "Users",
        url: getRoleWorkspacePath("ADMIN", "users"),
      },
      {
        title: "Students",
        url: getRoleWorkspacePath("ADMIN", "students"),
      },
      {
        title: "Faculty",
        url: getRoleWorkspacePath("ADMIN", "faculty"),
      },
      {
        title: "Role applications",
        url: "/admin/role-applications",
      },
      {
        title: "Departments",
        url: getRoleWorkspacePath("ADMIN", "departments"),
      },
      {
        title: "Programs",
        url: getRoleWorkspacePath("ADMIN", "programs"),
      },
      {
        title: "Courses",
        url: getRoleWorkspacePath("ADMIN", "courses"),
      },
      {
        title: "Curriculum",
        url: "/admin/curriculum",
      },
      {
        title: "Enrollments",
        url: getRoleWorkspacePath("ADMIN", "enrollments"),
      },
      {
        title: "Invoices",
        url: getRoleWorkspacePath("ADMIN", "invoices"),
      },
      {
        title: "Payments",
        url: getRoleWorkspacePath("ADMIN", "payments"),
      },
      {
        title: "Audit logs",
        url: getRoleWorkspacePath("ADMIN", "audit-logs"),
      },
      {
        title: "Settings",
        url: getRoleWorkspacePath("ADMIN", "settings"),
      },
    ],
  },
];

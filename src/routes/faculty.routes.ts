import { getRoleDashboardPath, getRoleWorkspacePath } from "@/lib/role-routes";

export const facultyRoutes = [
  {
    title: "Teaching",
    items: [
      {
        title: "Dashboard",
        url: getRoleDashboardPath("FACULTY"),
      },
      {
        title: "My profile",
        url: getRoleWorkspacePath("FACULTY", "profile"),
      },
      {
        title: "My courses",
        url: getRoleWorkspacePath("FACULTY", "sections"),
      },
      {
        title: "Schedule",
        url: getRoleWorkspacePath("FACULTY", "sections"),
      },
      {
        title: "Attendance",
        url: getRoleWorkspacePath("FACULTY", "attendance"),
      },
      {
        title: "Exams",
        url: getRoleWorkspacePath("FACULTY", "exams"),
      },
      {
        title: "Results",
        url: getRoleWorkspacePath("FACULTY", "results"),
      },
      {
        title: "Notifications",
        url: getRoleWorkspacePath("FACULTY", "notifications"),
      },
      {
        title: "Settings",
        url: getRoleWorkspacePath("FACULTY", "settings"),
      },
    ],
  },
];

import {
  getRoleDashboardPath,
  getRoleProfilePath,
  getRoleWorkspacePath,
} from "@/lib/role-routes";

export const studentRoutes = [
  {
    title: "Academics",
    items: [
      {
        title: "Dashboard",
        url: getRoleDashboardPath("STUDENT"),
      },
      {
        title: "My profile",
        url: getRoleProfilePath("STUDENT"),
      },
      {
        title: "Student record",
        url: "/student/student-profile",
      },
      {
        title: "Program & semesters",
        url: "/student/academics",
      },
      {
        title: "My courses",
        url: getRoleWorkspacePath("STUDENT", "enrollments"),
      },
      {
        title: "Attendance",
        url: getRoleWorkspacePath("STUDENT", "attendance"),
      },
      {
        title: "Exams",
        url: getRoleWorkspacePath("STUDENT", "exams"),
      },
      {
        title: "Results",
        url: getRoleWorkspacePath("STUDENT", "results"),
      },
      {
        title: "Transcript",
        url: getRoleWorkspacePath("STUDENT", "transcript"),
      },
      {
        title: "Fees & payments",
        url: getRoleWorkspacePath("STUDENT", "invoices"),
      },
      {
        title: "Notifications",
        url: getRoleWorkspacePath("STUDENT", "notifications"),
      },
      {
        title: "Settings",
        url: getRoleWorkspacePath("STUDENT", "settings"),
      },
    ],
  },
];

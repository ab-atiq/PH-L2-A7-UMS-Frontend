"use client";

import { useParams } from "next/navigation";
import FacultyDetailsPage from "@/components/dashboard/admin/faculty-details-page";

export default function AdminFacultyDetailsRoute() {
  const { employeeId } = useParams<{ employeeId: string }>();
  return <FacultyDetailsPage employeeId={employeeId} />;
}

"use client";

import { useParams } from "next/navigation";
import WorkspacePage from "@/components/dashboard/workspace-page";

export default function WorkspaceRoute() {
  const params = useParams<{ resource: string }>();
  return <WorkspacePage resource={params.resource} />;
}

"use client";

import { useParams } from "next/navigation";
import RoleRouteRedirect from "@/components/auth/role-route-redirect";

export default function WorkspaceRoute() {
  const params = useParams<{ resource: string }>();
  return <RoleRouteRedirect resource={params.resource} />;
}

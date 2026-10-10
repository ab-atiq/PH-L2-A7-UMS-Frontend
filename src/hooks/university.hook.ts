import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateRoleApplicationPayload,
  createRoleApplication,
  getMyRoleApplication,
  type ListQuery,
  type Resource,
  universityApi,
} from "@/api";

export function useAdminStats(enabled = true) {
  return useQuery({
    queryKey: ["university", "admin-stats"],
    queryFn: universityApi.adminStats,
    enabled,
  });
}

export function useUniversityList(
  resource: string,
  query?: ListQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: ["university", resource, query],
    queryFn: () => universityApi.list(resource, query),
    enabled,
  });
}

export function useUniversityCreate(resource: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Resource) => universityApi.create(resource, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["university"] }),
  });
}

export function useUniversityUpdate(resource: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Resource) => universityApi.update(resource, id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["university"] }),
  });
}

export function useUniversityDelete(resource: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => universityApi.remove(resource, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["university"] }),
  });
}

export function useMyRoleApplication(enabled = true) {
  return useQuery({
    queryKey: ["role-application", "me"],
    queryFn: getMyRoleApplication,
    enabled,
    retry: false,
  });
}

export function useCreateRoleApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoleApplicationPayload) =>
      createRoleApplication(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["role-application"] }),
  });
}

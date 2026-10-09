"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { getApiErrorMessage, universityApi } from "@/api";
import type { FacultyProfilePayload } from "@/api/university.api";
import type {
  AvailableFacultyUser,
  FacultyProfile,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useUniversityList } from "@/hooks";

type Department = { id: string; name: string; code: string };

function recordsFrom(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry),
    );
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return [];
  const record = value as Record<string, unknown>;
  for (const key of ["items", "results", "records"]) {
    if (Array.isArray(record[key])) return recordsFrom(record[key]);
  }
  if (Array.isArray(record.data)) return recordsFrom(record.data);
  return [];
}

function isDepartment(value: Record<string, unknown>): value is Department {
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.code === "string"
  );
}

function accountName(user: AvailableFacultyUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function FacultyEditor({
  faculty,
  availableUsers,
  departments,
  saving,
  onClose,
  onSubmit,
}: {
  faculty: FacultyProfile | null;
  availableUsers: AvailableFacultyUser[];
  departments: Department[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: FacultyProfilePayload) => void;
}) {
  const [userId, setUserId] = useState(faculty?.userId ?? "");
  const [employeeId, setEmployeeId] = useState(faculty?.employeeId ?? "");
  const [designation, setDesignation] = useState(faculty?.designation ?? "");
  const [specialization, setSpecialization] = useState(
    faculty?.specialization ?? "",
  );
  const [departmentId, setDepartmentId] = useState(
    faculty?.departmentId ?? "",
  );
  const [joinDate, setJoinDate] = useState(
    faculty?.joinDate?.slice(0, 10) ?? "",
  );
  const [firstName, setFirstName] = useState(faculty?.user.firstName ?? "");
  const [lastName, setLastName] = useState(faculty?.user.lastName ?? "");
  const [phone, setPhone] = useState(faculty?.user.phone ?? "");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      employeeId: employeeId.trim(),
      designation: designation.trim(),
      specialization: specialization.trim() || null,
      departmentId: departmentId || null,
      joinDate: joinDate || null,
      ...(faculty
        ? {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim() || null,
          }
        : { userId }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="faculty-editor-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="faculty-editor-title" className="text-lg font-semibold">
              {faculty ? "Update faculty member" : "Add faculty member"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {faculty
                ? "Update the faculty account and appointment details."
                : "Create a faculty profile for an existing faculty account."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            onClick={onClose}
            aria-label="Close editor"
          >
            <X className="size-4" />
          </Button>
        </div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {!faculty ? (
            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              Faculty account
              <select
                required
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 font-normal"
              >
                <option value="">Select a faculty account</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {accountName(user)} · {user.email}
                  </option>
                ))}
              </select>
              {availableUsers.length === 0 && (
                <span className="block text-xs font-normal text-muted-foreground">
                  There are no unassigned faculty accounts available.
                </span>
              )}
            </label>
          ) : (
            <>
              <label className="space-y-2 text-sm font-medium">
                First name
                <Input
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Last name
                <Input
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-medium sm:col-span-2">
                Phone number
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                />
              </label>
            </>
          )}
          <label className="space-y-2 text-sm font-medium">
            Employee ID
            <Input
              required
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Designation
            <Input
              required
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
              placeholder="Assistant Professor"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Specialization
            <Input
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Department
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 font-normal"
            >
              <option value="">No department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Join date
            <Input
              value={joinDate}
              onChange={(event) => setJoinDate(event.target.value)}
              type="date"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || (!faculty && availableUsers.length === 0)}
            >
              {saving && <LoaderCircle className="size-4 animate-spin" />}
              {saving ? "Saving…" : faculty ? "Save changes" : "Create profile"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function FacultyManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designation, setDesignation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [editorFaculty, setEditorFaculty] = useState<FacultyProfile | null>(
    null,
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacultyProfile | null>(null);
  const advancedFilters = {
    ...(departmentId ? { departmentId } : {}),
    ...(designation.trim() ? { designation: designation.trim() } : {}),
    ...(specialization.trim()
      ? { specialization: specialization.trim() }
      : {}),
  };
  const hasAdvancedFilters = Object.keys(advancedFilters).length > 0;
  const facultyQuery = useQuery({
    queryKey: ["faculty", hasAdvancedFilters ? advancedFilters : search],
    queryFn: () =>
      hasAdvancedFilters
        ? universityApi.filterFaculty(advancedFilters)
        : universityApi.listFaculty(search.trim() || undefined),
  });
  const departmentsQuery = useUniversityList(
    "departments",
    { limit: 100 },
    true,
  );
  const usersQuery = useQuery({
    queryKey: ["faculty", "available-users"],
    queryFn: universityApi.availableFacultyUsers,
    enabled: editorOpen && !editorFaculty,
  });

  const departments = useMemo(
    () => recordsFrom(departmentsQuery.data?.data).filter(isDepartment),
    [departmentsQuery.data],
  );
  const faculty = useMemo(() => {
    const list = facultyQuery.data?.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle || !hasAdvancedFilters) return list;
    return list.filter((member) =>
      [
        member.employeeId,
        member.designation,
        member.specialization,
        member.user.firstName,
        member.user.lastName,
        member.user.email,
        member.department?.name,
        member.department?.code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [facultyQuery.data, hasAdvancedFilters, search]);

  const refreshFaculty = async () => {
    await queryClient.invalidateQueries({ queryKey: ["faculty"] });
    await queryClient.invalidateQueries({ queryKey: ["university", "faculty"] });
  };
  const createMutation = useMutation({
    mutationFn: universityApi.createFaculty,
    onSuccess: async () => {
      await refreshFaculty();
      setEditorOpen(false);
      toast.add({
        title: "Faculty profile created",
        description: "The faculty member is now in the faculty directory.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not create faculty profile",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const updateMutation = useMutation({
    mutationFn: (payload: FacultyProfilePayload) => {
      if (!editorFaculty)
        throw new Error("Select a faculty member before saving changes.");
      return universityApi.updateFaculty(editorFaculty.employeeId, payload);
    },
    onSuccess: async () => {
      await refreshFaculty();
      setEditorOpen(false);
      setEditorFaculty(null);
      toast.add({
        title: "Faculty profile updated",
        description: "The faculty member’s details have been saved.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not update faculty profile",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const deleteMutation = useMutation({
    mutationFn: (employeeId: string) => universityApi.deleteFaculty(employeeId),
    onSuccess: async () => {
      await refreshFaculty();
      setDeleteTarget(null);
      toast.add({
        title: "Faculty profile deleted",
        description: "The faculty profile was removed from active records.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not delete faculty profile",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  const submitEditor = (payload: FacultyProfilePayload) => {
    if (editorFaculty) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };
  const openCreateEditor = () => {
    setEditorFaculty(null);
    setEditorOpen(true);
  };
  const openUpdateEditor = (member: FacultyProfile) => {
    setEditorFaculty(member);
    setEditorOpen(true);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">
              Administration
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Faculty members
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create, search, filter, review, update, and remove faculty profiles.
            </p>
          </div>
          <Button type="button" onClick={openCreateEditor}>
            <Plus className="size-4" />
            Add faculty member
          </Button>
        </header>

        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-4">
            <label className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, employee ID…"
                aria-label="Search faculty"
              />
            </label>
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <Input
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
              placeholder="Filter designation"
              aria-label="Filter by designation"
            />
            <Input
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              placeholder="Filter specialization"
              aria-label="Filter by specialization"
            />
            <Button
              type="button"
              variant="outline"
              className="md:col-span-1"
              onClick={() => {
                setSearch("");
                setDepartmentId("");
                setDesignation("");
                setSpecialization("");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>

        {facultyQuery.isPending ? (
          <Card>
            <CardContent className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading faculty…
            </CardContent>
          </Card>
        ) : facultyQuery.isError ? (
          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <p className="text-destructive">
                Could not load faculty:{" "}
                {getApiErrorMessage(facultyQuery.error)}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void facultyQuery.refetch()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : faculty.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
              <UserRound className="size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No faculty members found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Change the search or filters, or add a faculty profile.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {faculty.map((member) => {
              const fullName =
                `${member.user.firstName} ${member.user.lastName}`.trim();
              const initials =
                `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`.toUpperCase();
              return (
                <Card key={member.id}>
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
                    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
                      {member.user.avatarUrl ? (
                        <Image
                          src={member.user.avatarUrl}
                          alt={`${fullName} profile`}
                          fill
                          sizes="64px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        initials || "F"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-semibold">{fullName}</h2>
                          <p className="break-all text-sm text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {member.user.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Employee ID
                          </dt>
                          <dd className="font-medium">{member.employeeId}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Designation
                          </dt>
                          <dd className="font-medium">
                            {member.designation ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Department
                          </dt>
                          <dd className="font-medium">
                            {member.department?.name ?? "Unassigned"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Specialization
                          </dt>
                          <dd className="font-medium">
                            {member.specialization ?? "—"}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-5 flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          render={
                            <Link
                              href={`/admin/faculty/${encodeURIComponent(member.employeeId)}`}
                            />
                          }
                          nativeButton={false}
                        >
                          View full profile
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateEditor(member)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(member)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {editorOpen && (
        <FacultyEditor
          key={editorFaculty?.id ?? "create"}
          faculty={editorFaculty}
          availableUsers={usersQuery.data?.data ?? []}
          departments={departments}
          saving={createMutation.isPending || updateMutation.isPending}
          onClose={() => setEditorOpen(false)}
          onSubmit={submitEditor}
        />
      )}
      {usersQuery.isError && editorOpen && !editorFaculty && (
        <div className="fixed inset-x-4 bottom-4 z-[60] rounded-lg border bg-background p-4 text-sm text-destructive shadow-lg">
          Could not load available faculty accounts:{" "}
          {getApiErrorMessage(usersQuery.error)}
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-faculty-title"
            className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
          >
            <h2 id="delete-faculty-title" className="text-lg font-semibold">
              Delete faculty profile?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will archive {deleteTarget.user.firstName}{" "}
              {deleteTarget.user.lastName}&apos;s faculty profile. Their login
              account and academic history will remain.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() =>
                  deleteMutation.mutate(deleteTarget.employeeId)
                }
              >
                {deleteMutation.isPending && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                Confirm delete
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

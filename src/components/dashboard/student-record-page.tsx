"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { getApiErrorMessage, universityApi } from "@/api";
import type { Resource } from "@/api/university.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

type StudentRecord = Resource;

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getRelatedName(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return "Not assigned";
  const related = value as Resource;
  for (const key of ["name", "title", "code"]) {
    if (typeof related[key] === "string") return related[key] as string;
  }
  return "Not assigned";
}

function getNestedRecord(value: unknown): Resource | null {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  return value as Resource;
}

function getHttpStatus(error: unknown) {
  const errorRecord = getNestedRecord(error);
  if (!errorRecord) return undefined;
  const response = getNestedRecord(errorRecord.response);
  return typeof response?.status === "number" ? response.status : undefined;
}

function SelfStudentProfileForm({
  student,
  saving,
  onCancel,
  onSubmit,
}: {
  student: StudentRecord | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (payload: Resource) => void;
}) {
  const [gender, setGender] = useState(getString(student?.gender));
  const [dateOfBirth, setDateOfBirth] = useState(
    getString(student?.dateOfBirth).slice(0, 10),
  );
  const [address, setAddress] = useState(getString(student?.address));
  const [guardianName, setGuardianName] = useState(
    getString(student?.guardianName),
  );
  const [guardianPhone, setGuardianPhone] = useState(
    getString(student?.guardianPhone),
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      address: address.trim() || null,
      guardianName: guardianName.trim() || null,
      guardianPhone: guardianPhone.trim() || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {student ? "Update student profile" : "Create your student profile"}
        </CardTitle>
        <CardDescription>
          You can edit personal and guardian details. Your student ID,
          department, program, and semester are assigned by the university.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Gender
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 font-normal"
            >
              <option value="">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Date of birth
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium sm:col-span-2">
            Address
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              maxLength={500}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Guardian name
            <Input
              value={guardianName}
              onChange={(event) => setGuardianName(event.target.value)}
              maxLength={120}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Guardian phone
            <Input
              type="tel"
              value={guardianPhone}
              onChange={(event) => setGuardianPhone(event.target.value)}
              maxLength={30}
            />
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            {student && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : student ? (
                <Save className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {saving
                ? "Saving…"
                : student
                  ? "Save changes"
                  : "Create profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b py-3 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value || "Not provided"}</dd>
    </div>
  );
}

export default function StudentRecordPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const profileQuery = useQuery({
    queryKey: ["student-profile", "me"],
    queryFn: universityApi.myStudentProfile,
    retry: false,
  });
  const student = profileQuery.data?.data ?? null;
  const notFound = profileQuery.isError && getHttpStatus(profileQuery.error) === 404;

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["student-profile", "me"] });
  const createMutation = useMutation({
    mutationFn: universityApi.createMyStudentProfile,
    onSuccess: async () => {
      await refresh();
      toast.add({
        title: "Student profile created",
        description: "Your student profile is ready.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not create profile",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const updateMutation = useMutation({
    mutationFn: universityApi.updateMyStudentProfile,
    onSuccess: async () => {
      await refresh();
      setEditing(false);
      toast.add({
        title: "Student profile updated",
        description: "Your changes have been saved.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not update profile",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const deleteMutation = useMutation({
    mutationFn: universityApi.deleteMyStudentProfile,
    onSuccess: async () => {
      await refresh();
      setConfirmDelete(false);
      toast.add({
        title: "Student profile deleted",
        description:
          "Your student profile was archived. Your university login and academic history are preserved.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not delete profile",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  const submit = (payload: Resource) => {
    if (student) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (profileQuery.isPending) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading your student record…
      </main>
    );
  }

  if (profileQuery.isError && !notFound) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Could not load your student profile</CardTitle>
            <CardDescription>
              {getApiErrorMessage(profileQuery.error)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={() => void profileQuery.refetch()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!student || notFound) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <header>
            <p className="text-sm font-medium text-primary">Student portal</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Student record
            </h1>
          </header>
          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
              <div>
                <p className="font-medium">No active student profile</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your profile to add your personal and guardian
                  information. Academic identifiers are assigned by the
                  university.
                </p>
              </div>
            </CardContent>
          </Card>
          <SelfStudentProfileForm
            student={null}
            saving={createMutation.isPending}
            onCancel={() => setEditing(false)}
            onSubmit={submit}
          />
        </div>
      </main>
    );
  }

  const user = getNestedRecord(student.user);
  const details = [
    { label: "Student ID", value: getString(student.studentId) },
    { label: "University account", value: user ? getString(user.email) : "" },
    { label: "Department", value: getRelatedName(student.department) },
    { label: "Program", value: getRelatedName(student.program) },
    {
      label: "Current semester",
      value: getRelatedName(student.currentProgramSemester),
    },
    { label: "Batch year", value: getString(student.batchYear) },
    { label: "Gender", value: getString(student.gender) },
    {
      label: "Date of birth",
      value: getString(student.dateOfBirth).slice(0, 10),
    },
    { label: "Address", value: getString(student.address) },
    { label: "Guardian", value: getString(student.guardianName) },
    { label: "Guardian phone", value: getString(student.guardianPhone) },
    {
      label: "Admission date",
      value: getString(student.admissionDate).slice(0, 10),
    },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Student portal</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Student record
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              View your university record and manage personal details.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing((current) => !current)}
            >
              {editing ? "Close editor" : "Edit profile"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Delete profile
            </Button>
          </div>
        </header>

        {editing ? (
          <SelfStudentProfileForm
            key={getString(student.id)}
            student={student}
            saving={updateMutation.isPending}
            onCancel={() => setEditing(false)}
            onSubmit={submit}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Student profile</CardTitle>
              <CardDescription>
                Academic identifiers and placements are managed by the
                university. You can update personal details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {details.map(({ label, value }) => (
                  <Detail key={label} label={label} value={value} />
                ))}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-student-profile-title"
            className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
          >
            <h2
              id="delete-student-profile-title"
              className="text-lg font-semibold"
            >
              Delete your student profile?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your profile will be archived. Your login account and academic
              history will be preserved.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
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

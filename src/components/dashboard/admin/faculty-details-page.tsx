"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getApiErrorMessage, universityApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="border-b py-3 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export default function FacultyDetailsPage({
  employeeId,
}: {
  employeeId: string;
}) {
  const query = useQuery({
    queryKey: ["faculty", "details", employeeId],
    queryFn: () => universityApi.facultyByEmployeeId(employeeId),
    enabled: Boolean(employeeId),
  });
  const faculty = query.data?.data;

  if (query.isPending) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading faculty details…
      </main>
    );
  }

  if (query.isError || !faculty) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 p-6">
        <Button
          variant="outline"
          render={<Link href="/admin/faculty" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Back to faculty
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Faculty profile unavailable</CardTitle>
            <CardDescription>
              {getApiErrorMessage(query.error)}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const fullName =
    `${faculty.user.firstName} ${faculty.user.lastName}`.trim();
  const initials =
    `${faculty.user.firstName.charAt(0)}${faculty.user.lastName.charAt(0)}`.toUpperCase();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button
          variant="outline"
          render={<Link href="/admin/faculty" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Back to faculty
        </Button>
        <Card>
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {faculty.user.avatarUrl ? (
                <Image
                  src={faculty.user.avatarUrl}
                  alt={`${fullName} profile`}
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                initials || "F"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">
                Faculty member
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {fullName}
              </h1>
              <p className="mt-1 break-all text-muted-foreground">
                {faculty.user.email}
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Employment details</CardTitle>
              <CardDescription>
                Faculty member’s academic appointment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl>
                <Detail label="Employee ID" value={faculty.employeeId} />
                <Detail label="Designation" value={faculty.designation} />
                <Detail
                  label="Specialization"
                  value={faculty.specialization}
                />
                <Detail
                  label="Department"
                  value={
                    faculty.department
                      ? `${faculty.department.name} (${faculty.department.code})`
                      : null
                  }
                />
                <Detail
                  label="Join date"
                  value={
                    faculty.joinDate
                      ? new Date(faculty.joinDate).toLocaleDateString()
                      : null
                  }
                />
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
              <CardDescription>
                Contact and account information linked to this profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl>
                <Detail label="First name" value={faculty.user.firstName} />
                <Detail label="Last name" value={faculty.user.lastName} />
                <Detail label="Email" value={faculty.user.email} />
                <Detail label="Phone" value={faculty.user.phone} />
                <Detail
                  label="Account status"
                  value={faculty.user.status.replaceAll("_", " ")}
                />
                <Detail label="Linked account ID" value={faculty.userId} />
                <Detail
                  label="Faculty record created"
                  value={new Date(faculty.createdAt).toLocaleString()}
                />
                <Detail
                  label="Last profile update"
                  value={new Date(faculty.updatedAt).toLocaleString()}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

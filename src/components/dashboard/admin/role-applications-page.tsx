"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Search, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  getApiErrorMessage,
  listRoleApplications,
  updateRoleApplicationStatus,
} from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import type {
  ApplicationRole,
  ApplicationStatus,
  RoleApplication,
} from "@/types";

type AdminApplication = RoleApplication & {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    status: string;
  };
};

const statuses: ApplicationStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const requestedRoles: ApplicationRole[] = ["STUDENT", "FACULTY"];

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(date),
  );
}

export default function RoleApplicationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [requestedRole, setRequestedRole] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminApplication | null>(null);
  const queryParams = {
    page,
    limit: 12,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(status ? { status: status as ApplicationStatus } : {}),
    ...(requestedRole
      ? { requestedRole: requestedRole as ApplicationRole }
      : {}),
  };
  const applicationsQuery = useQuery({
    queryKey: ["admin", "role-applications", queryParams],
    queryFn: () => listRoleApplications(queryParams),
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status: nextStatus,
    }: {
      id: string;
      status: ApplicationStatus;
    }) => updateRoleApplicationStatus(id, nextStatus),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "role-applications"],
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.add({
        title: "Application status updated",
        description:
          variables.status === "APPROVED"
            ? "The application was approved and the applicant's account role was updated."
            : "The new status has been saved.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not update application",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  const applications = (applicationsQuery.data?.data ??
    []) as AdminApplication[];
  const setFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium text-primary">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Role applications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review student and faculty applications and update their status.
          </p>
        </header>

        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, interest"
                aria-label="Search role applications"
              />
            </div>
            <select
              aria-label="Filter by requested role"
              value={requestedRole}
              onChange={(event) =>
                setFilter(setRequestedRole)(event.target.value)
              }
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All application types</option>
              {requestedRoles.map((role) => (
                <option key={role} value={role}>
                  {role === "STUDENT" ? "Student" : "Faculty"}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setFilter(setStatus)(event.target.value)}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {applicationsQuery.isPending ? (
          <Card>
            <CardContent className="flex min-h-44 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading applications…
            </CardContent>
          </Card>
        ) : applicationsQuery.isError ? (
          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <p className="text-destructive">
                Could not load applications:{" "}
                {getApiErrorMessage(applicationsQuery.error)}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void applicationsQuery.refetch()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
              <UserRound className="size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No role applications found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another filter or check back when new applications are
                submitted.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {applications.map((application) => {
              const applicantName =
                `${application.user.firstName} ${application.user.lastName}`.trim();
              const initials =
                `${application.user.firstName[0] ?? ""}${application.user.lastName[0] ?? ""}`.toUpperCase();
              return (
                <Card key={application.id}>
                  <CardContent className="flex gap-4 p-5">
                    <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
                      {application.user.avatarUrl ? (
                        <Image
                          src={application.user.avatarUrl}
                          alt={`${applicantName} profile`}
                          fill
                          sizes="56px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        initials || "U"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="font-semibold">{applicantName}</h2>
                          <p className="break-all text-sm text-muted-foreground">
                            {application.user.email}
                          </p>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {application.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm">
                        Applying for{" "}
                        <span className="font-medium">
                          {application.requestedRole === "STUDENT"
                            ? "Student"
                            : "Faculty"}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · Submitted {dateLabel(application.createdAt)}
                        </span>
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {application.statement}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDetail(application)}
                        >
                          View application
                        </Button>
                        <select
                          aria-label={`Set status for ${applicantName}`}
                          value={application.status}
                          disabled={statusMutation.isPending}
                          onChange={(event) =>
                            statusMutation.mutate({
                              id: application.id,
                              status: event.target.value as ApplicationStatus,
                            })
                          }
                          className="h-9 rounded-lg border bg-background px-3 text-sm"
                        >
                          {statuses.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {applicationsQuery.data?.meta &&
          applicationsQuery.data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span>
                Page {applicationsQuery.data.meta.page} of{" "}
                {applicationsQuery.data.meta.totalPages} ·{" "}
                {applicationsQuery.data.meta.total} applications
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= applicationsQuery.data.meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="application-detail-title"
                  className="text-lg font-semibold"
                >
                  Application details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {detail.user.firstName} {detail.user.lastName} ·{" "}
                  {detail.user.email}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setDetail(null)}
                aria-label="Close details"
              >
                <X className="size-4" />
              </Button>
            </div>
            <dl className="mt-5 grid gap-4 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Requested role</dt>
                <dd className="mt-1 font-medium">{detail.requestedRole}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1 font-medium">{detail.status}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-medium">{detail.user.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="mt-1 font-medium">
                  {dateLabel(detail.createdAt)}
                </dd>
              </div>
              {detail.programInterest && (
                <div>
                  <dt className="text-muted-foreground">Program interest</dt>
                  <dd className="mt-1 font-medium">{detail.programInterest}</dd>
                </div>
              )}
              {detail.departmentInterest && (
                <div>
                  <dt className="text-muted-foreground">Department interest</dt>
                  <dd className="mt-1 font-medium">
                    {detail.departmentInterest}
                  </dd>
                </div>
              )}
              {detail.highestQualification && (
                <div>
                  <dt className="text-muted-foreground">
                    Highest qualification
                  </dt>
                  <dd className="mt-1 font-medium">
                    {detail.highestQualification}
                  </dd>
                </div>
              )}
              {detail.specialization && (
                <div>
                  <dt className="text-muted-foreground">Specialization</dt>
                  <dd className="mt-1 font-medium">{detail.specialization}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Statement</dt>
                <dd className="mt-1 whitespace-pre-wrap leading-6">
                  {detail.statement}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </main>
  );
}

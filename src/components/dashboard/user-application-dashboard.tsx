"use client";

import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { getApiErrorMessage, universityApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateRoleApplication,
  useMyRoleApplication,
} from "@/hooks/university.hook";
import type { ApplicationRole, User } from "@/types";

function recordsFrom(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value))
    return value.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null && !Array.isArray(item),
    );
  if (typeof value !== "object" || value === null) return [];
  const data = (value as Record<string, unknown>).data;
  if (Array.isArray(data)) return recordsFrom(data);
  return [];
}

export default function UserApplicationDashboard({ user }: { user: User }) {
  const { data, isPending, isError, error, refetch } = useMyRoleApplication();
  const { mutateAsync: submitApplication, isPending: isSubmitting } =
    useCreateRoleApplication();
  const programsQuery = useQuery({
    queryKey: ["university", "application-program-options"],
    queryFn: () =>
      universityApi.list("programs", { limit: 100, status: "ACTIVE" }),
  });
  const departmentsQuery = useQuery({
    queryKey: ["university", "application-department-options"],
    queryFn: () =>
      universityApi.list("departments", { limit: 100, status: "ACTIVE" }),
  });
  const programs = recordsFrom(programsQuery.data);
  const departments = recordsFrom(departmentsQuery.data);
  const [requestedRole, setRequestedRole] =
    useState<ApplicationRole>("STUDENT");
  const [programInterest, setProgramInterest] = useState("");
  const [departmentInterest, setDepartmentInterest] = useState("");
  const [highestQualification, setHighestQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [statement, setStatement] = useState("");
  const [formError, setFormError] = useState("");

  const application = data?.data;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    try {
      if (requestedRole === "STUDENT") {
        await submitApplication({
          requestedRole,
          programInterest,
          statement,
        });
      } else {
        await submitApplication({
          requestedRole,
          departmentInterest,
          highestQualification,
          ...(specialization.trim() ? { specialization } : {}),
          statement,
        });
      }
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <section>
          <p className="text-sm font-medium text-primary">University account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome{fullName ? `, ${fullName}` : " back"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Choose an academic role to apply for. You can submit one application
            from this account.
          </p>
        </section>

        {isPending ? (
          <section
            aria-live="polite"
            className="rounded-xl border bg-card p-6 text-sm text-muted-foreground"
          >
            Checking your application status…
          </section>
        ) : isError ? (
          <section className="rounded-xl border border-destructive/30 bg-card p-6">
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(error)}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </section>
        ) : application ? (
          <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {application.status}
            </span>
            <h2 className="mt-4 text-xl font-semibold">
              Application submitted
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your {application.requestedRole.toLowerCase()} application was
              received on{" "}
              {new Intl.DateTimeFormat("en", {
                dateStyle: "long",
              }).format(new Date(application.createdAt))}
              . Your submitted details are below.
            </p>
            <dl className="mt-6 grid gap-4 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Application type</dt>
                <dd className="mt-1 font-medium">
                  {application.requestedRole === "STUDENT"
                    ? "Student"
                    : "Faculty"}
                </dd>
              </div>
              {application.programInterest && (
                <div>
                  <dt className="text-muted-foreground">Program of interest</dt>
                  <dd className="mt-1 font-medium">
                    {application.programInterest}
                  </dd>
                </div>
              )}
              {application.departmentInterest && (
                <div>
                  <dt className="text-muted-foreground">
                    Department of interest
                  </dt>
                  <dd className="mt-1 font-medium">
                    {application.departmentInterest}
                  </dd>
                </div>
              )}
              {application.highestQualification && (
                <div>
                  <dt className="text-muted-foreground">
                    Highest qualification
                  </dt>
                  <dd className="mt-1 font-medium">
                    {application.highestQualification}
                  </dd>
                </div>
              )}
              {application.specialization && (
                <div>
                  <dt className="text-muted-foreground">Specialization</dt>
                  <dd className="mt-1 font-medium">
                    {application.specialization}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        ) : (
          <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold">Start an application</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select the role you are interested in and provide the details
              requested below.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={requestedRole === "STUDENT"}
                onClick={() => {
                  setRequestedRole("STUDENT");
                  setFormError("");
                }}
                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                  requestedRole === "STUDENT"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <GraduationCap className="mt-0.5 size-5 text-primary" />
                <span>
                  <span className="block font-medium">Student</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Apply to study in an academic program.
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-pressed={requestedRole === "FACULTY"}
                onClick={() => {
                  setRequestedRole("FACULTY");
                  setFormError("");
                }}
                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                  requestedRole === "FACULTY"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <Users className="mt-0.5 size-5 text-primary" />
                <span>
                  <span className="block font-medium">Faculty</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Apply to join an academic department.
                  </span>
                </span>
              </button>
            </div>

            <form
              onSubmit={(event) => void submit(event)}
              className="mt-6 space-y-5"
            >
              {requestedRole === "STUDENT" ? (
                <label
                  htmlFor="application-program"
                  className="flex flex-col gap-2 text-sm font-medium"
                >
                  Program of interest
                  <select
                    id="application-program"
                    required
                    value={programInterest}
                    onChange={(event) => setProgramInterest(event.target.value)}
                    className="h-10 rounded-lg border bg-background px-3 text-sm"
                    disabled={programsQuery.isPending}
                  >
                    <option value="">Select a program</option>
                    {programs.map((program) => (
                      <option
                        key={String(program.id)}
                        value={String(program.code)}
                      >
                        {String(program.name)} ({String(program.code)})
                      </option>
                    ))}
                  </select>
                  {programsQuery.isError && (
                    <span role="alert" className="text-sm text-destructive">
                      {getApiErrorMessage(programsQuery.error)}
                    </span>
                  )}
                </label>
              ) : (
                <>
                  <label
                    htmlFor="application-department"
                    className="flex flex-col gap-2 text-sm font-medium"
                  >
                    Department of interest
                    <select
                      id="application-department"
                      required
                      value={departmentInterest}
                      onChange={(event) =>
                        setDepartmentInterest(event.target.value)
                      }
                      className="h-10 rounded-lg border bg-background px-3 text-sm"
                      disabled={departmentsQuery.isPending}
                    >
                      <option value="">Select a department</option>
                      {departments.map((department) => (
                        <option
                          key={String(department.id)}
                          value={String(department.code)}
                        >
                          {String(department.name)} ({String(department.code)})
                        </option>
                      ))}
                    </select>
                    {departmentsQuery.isError && (
                      <span role="alert" className="text-sm text-destructive">
                        {getApiErrorMessage(departmentsQuery.error)}
                      </span>
                    )}
                  </label>
                  <label
                    htmlFor="application-qualification"
                    className="flex flex-col gap-2 text-sm font-medium"
                  >
                    Highest qualification
                    <Input
                      id="application-qualification"
                      required
                      minLength={2}
                      maxLength={160}
                      value={highestQualification}
                      onChange={(event) =>
                        setHighestQualification(event.target.value)
                      }
                      placeholder="For example, PhD in Computer Science"
                    />
                  </label>
                  <label
                    htmlFor="application-specialization"
                    className="flex flex-col gap-2 text-sm font-medium"
                  >
                    Specialization
                    <Input
                      id="application-specialization"
                      maxLength={160}
                      value={specialization}
                      onChange={(event) =>
                        setSpecialization(event.target.value)
                      }
                      placeholder="Optional"
                    />
                  </label>
                </>
              )}

              <label
                htmlFor="application-statement"
                className="flex flex-col gap-2 text-sm font-medium"
              >
                Personal statement
                <Textarea
                  id="application-statement"
                  required
                  minLength={20}
                  maxLength={2000}
                  value={statement}
                  onChange={(event) => setStatement(event.target.value)}
                  placeholder="Tell us why you are applying (20–2000 characters)."
                  className="min-h-32"
                />
              </label>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {formError}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit application"}
              </Button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

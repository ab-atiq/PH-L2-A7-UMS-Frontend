"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getApiErrorMessage, universityApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type RecordData = Record<string, unknown>;
type PaymentGateway = "BKASH" | "STRIPE";

function PaymentOptions({
  invoiceId,
  disabled,
  onPay,
}: {
  invoiceId: string;
  disabled: boolean;
  onPay: (invoiceId: string, gateway: PaymentGateway) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => onPay(invoiceId, "BKASH")}
      >
        bKash
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => onPay(invoiceId, "STRIPE")}
      >
        Stripe
      </Button>
    </div>
  );
}

function asRecord(value: unknown): RecordData | null {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  return value as RecordData;
}

function recordFrom(value: unknown): RecordData | null {
  const record = asRecord(value);
  if (!record) return null;
  return asRecord(record.data) ?? record;
}

function recordsFrom(value: unknown): RecordData[] {
  if (Array.isArray(value))
    return value.filter(
      (item): item is RecordData =>
        typeof item === "object" && item !== null && !Array.isArray(item),
    );
  const record = asRecord(value);
  if (!record) return [];
  for (const key of ["data", "items", "results"]) {
    if (Array.isArray(record[key])) return recordsFrom(record[key]);
    if (asRecord(record[key])) return recordsFrom(record[key]);
  }
  return [];
}

function text(value: unknown, fallback = "—") {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
}

function money(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
      }).format(amount)
    : "—";
}

export default function AcademicProgressPage() {
  const queryClient = useQueryClient();
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [pendingInvoiceId, setPendingInvoiceId] = useState("");
  const profileQuery = useQuery({
    queryKey: ["university", "student-profile"],
    queryFn: universityApi.myStudentProfile,
    retry: false,
  });
  const profile = recordFrom(profileQuery.data);
  const programId = text(profile?.programId, "");
  const programsQuery = useQuery({
    queryKey: ["university", "active-program-options"],
    queryFn: () =>
      universityApi.list("programs", { limit: 100, status: "ACTIVE" }),
    enabled: !programId,
  });
  const semestersQuery = useQuery({
    queryKey: ["university", "program-semesters", programId],
    queryFn: () => universityApi.programSemesters(programId),
    enabled: Boolean(programId),
  });
  const programQuery = useQuery({
    queryKey: ["university", "program-details", programId],
    queryFn: () => universityApi.get("programs", programId),
    enabled: Boolean(programId),
  });
  const enrollmentsQuery = useQuery({
    queryKey: ["university", "enrollments", "student"],
    queryFn: () => universityApi.list("enrollments", { limit: 100 }),
    enabled: Boolean(programId),
  });
  const semesterEnrollmentsQuery = useQuery({
    queryKey: ["university", "semester-enrollments", "student"],
    queryFn: universityApi.mySemesterEnrollments,
    enabled: Boolean(programId),
  });
  const invoicesQuery = useQuery({
    queryKey: ["university", "invoices", "student"],
    queryFn: () => universityApi.list("invoices/my", { limit: 100 }),
    enabled: Boolean(profile),
  });
  const attendanceQuery = useQuery({
    queryKey: ["university", "attendance", "student"],
    queryFn: universityApi.myAttendance,
    enabled: Boolean(profile),
  });
  const resultsQuery = useQuery({
    queryKey: ["university", "results", "student"],
    queryFn: () => universityApi.list("results"),
    enabled: Boolean(profile),
  });

  const semesters = recordsFrom(semestersQuery.data);
  const enrollments = recordsFrom(enrollmentsQuery.data);
  const semesterEnrollments = recordsFrom(semesterEnrollmentsQuery.data);
  const invoices = recordsFrom(invoicesQuery.data);
  const attendance = recordsFrom(attendanceQuery.data);
  const results = recordsFrom(resultsQuery.data);
  const program = recordFrom(programQuery.data);

  const selectProgram = useMutation({
    mutationFn: universityApi.enrollMyProgram,
    onSuccess: async () => {
      toast.add({
        title: "Program selected",
        description:
          "Your program curriculum and Semester 1 are now available.",
        type: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ["university"] });
    },
    onError: (error) =>
      toast.add({
        title: "Could not enroll in program",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  const startPayment = useMutation({
    mutationFn: ({
      invoiceId,
      gateway,
    }: {
      invoiceId: string;
      gateway: PaymentGateway;
    }) => universityApi.startPayment(invoiceId, gateway),
    onSuccess: (response) => {
      const result = recordFrom(response);
      const paymentUrl =
        result?.redirectUrl ?? result?.paymentUrl ?? result?.checkoutUrl;
      if (typeof paymentUrl === "string") window.location.assign(paymentUrl);
      else
        toast.add({
          title: "Could not start payment",
          description: "The payment gateway did not return a checkout URL.",
          type: "error",
        });
    },
    onError: (error) =>
      toast.add({
        title: "Could not start payment",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const enroll = useMutation({
    mutationFn: universityApi.enrollSemester,
    onSuccess: async (response) => {
      const result = recordFrom(response);
      if (result?.paymentRequired === true) {
        const invoiceId = text(result.invoiceId, "");
        if (invoiceId) {
          setPendingInvoiceId(invoiceId);
          toast.add({
            title: "Invoice ready",
            description:
              "Choose bKash or Stripe from the invoice details to pay.",
            type: "info",
          });
        }
      } else {
        toast.add({
          title: "Semester activated",
          description: "Your semester courses are now available.",
          type: "success",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["university"] });
    },
    onError: (error) =>
      toast.add({
        title: "Could not enroll",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  if (profileQuery.isLoading)
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> Loading your academic
        profile…
      </div>
    );

  if (!profile) {
    return (
      <main className="p-4 sm:p-6">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h1 className="text-xl font-semibold">Academic profile required</h1>
            <p className="text-sm text-muted-foreground">
              Your student record or program assignment is not available yet.
              Complete your student profile or contact the administration.
            </p>
            <Link
              href="/student/student-profile"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Open student profile
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!programId) {
    const programs = recordsFrom(programsQuery.data);
    return (
      <main className="p-4 sm:p-6">
        <Card>
          <CardContent className="mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
            <span className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
              <BookOpen className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">Enroll in a program</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose an active program to see its semesters and courses in
                order. Semester 1 will be available to start after program
                enrollment.
              </p>
            </div>
            {programsQuery.isError ? (
              <p role="alert" className="text-sm text-destructive">
                {getApiErrorMessage(programsQuery.error)}
              </p>
            ) : (
              <label className="flex flex-col gap-2 text-sm font-medium">
                Academic program
                <select
                  value={selectedProgramId}
                  onChange={(event) => setSelectedProgramId(event.target.value)}
                  disabled={programsQuery.isPending || programs.length === 0}
                  className="h-11 rounded-md border bg-background px-3"
                >
                  <option value="">Select a program</option>
                  {programs.map((item) => (
                    <option key={text(item.id)} value={text(item.id, "")}>
                      {text(item.name)} ({text(item.degreeType)} ·{" "}
                      {text(item.totalSemesters)} semesters)
                    </option>
                  ))}
                </select>
              </label>
            )}
            {!programsQuery.isPending &&
              !programsQuery.isError &&
              programs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No active programs are available. Please contact the
                  administration.
                </p>
              )}
            <Button
              disabled={!selectedProgramId || selectProgram.isPending}
              onClick={() => selectProgram.mutate(selectedProgramId)}
            >
              {selectProgram.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              Enroll in selected program
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const progress = new Map<string, { status: string; courseCount: number }>();
  for (const enrollment of semesterEnrollments) {
    const programSemester = asRecord(enrollment.programSemester);
    const id = text(programSemester?.id, "");
    if (!id) continue;
    progress.set(id, {
      status: text(enrollment.status, "NOT_STARTED"),
      courseCount: 0,
    });
  }
  for (const enrollment of enrollments) {
    const semesterEnrollment = asRecord(enrollment.semesterEnrollment);
    const semesterCourse = asRecord(enrollment.semesterCourse);
    const programSemester = asRecord(semesterCourse?.programSemester);
    const semesterId = text(programSemester?.id, "");
    if (!semesterId) continue;
    const current = progress.get(semesterId) ?? {
      status: text(semesterEnrollment?.status, "NOT_STARTED"),
      courseCount: 0,
    };
    current.courseCount += 1;
    progress.set(semesterId, current);
  }
  const orderedSemesters = [...semesters].sort(
    (left, right) =>
      Number(left.semesterNumber ?? 0) - Number(right.semesterNumber ?? 0),
  );

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header>
        <p className="text-sm font-medium text-primary">Student academics</p>
        <h1 className="mt-1 text-2xl font-semibold">
          {text(program?.name, "My program")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {text(program?.degreeType)} · {text(profile.studentId)} ·{" "}
          {text(program?.totalSemesters)} curriculum semesters · Admission{" "}
          {money(program?.admissionFee)} · Semester{" "}
          {money(program?.semesterFee)}
        </p>
        <Link
          href={`/student/academics/program/${programId}`}
          className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Program details and admission payment
        </Link>
      </header>

      {semestersQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Loading curriculum…
        </div>
      ) : (
        <section className="space-y-4">
          {orderedSemesters.map((semester) => {
            const id = text(semester.id, "");
            const semesterCourses = Array.isArray(semester.semesterCourses)
              ? recordsFrom(semester.semesterCourses)
              : [];
            const semesterProgress = progress.get(id);
            const status = semesterProgress?.status ?? "NOT_STARTED";
            const semesterNumber = Number(semester.semesterNumber ?? 0);
            const previousSemester = orderedSemesters.find(
              (item) => Number(item.semesterNumber ?? 0) === semesterNumber - 1,
            );
            const previousStatus = previousSemester
              ? progress.get(text(previousSemester.id, ""))?.status
              : undefined;
            const canStart =
              status !== "COMPLETED" &&
              status !== "FAILED" &&
              status !== "IN_PROGRESS" &&
              (semesterNumber === 1 || previousStatus === "COMPLETED");
            const isLocked =
              !canStart &&
              status !== "COMPLETED" &&
              status !== "FAILED" &&
              status !== "IN_PROGRESS";
            return (
              <Card key={id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        Semester {text(semester.semesterNumber)} of{" "}
                        {text(program?.totalSemesters)}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        {text(semester.name)}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {status.replaceAll("_", " ")} · {semesterCourses.length}{" "}
                        courses
                        {semesterProgress?.courseCount
                          ? ` · ${semesterProgress.courseCount} enrolled`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                      <Link
                        href={`/student/academics/semester/${id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Semester details
                      </Link>
                      <Button
                        type="button"
                        variant={canStart ? "default" : "outline"}
                        disabled={
                          !canStart ||
                          enroll.isPending ||
                          !semesterCourses.length
                        }
                        onClick={() => enroll.mutate(id)}
                      >
                        {enroll.isPending && canStart ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : isLocked ? (
                          <LockKeyhole className="size-4" />
                        ) : null}
                        {status === "COMPLETED"
                          ? "Completed"
                          : canStart
                            ? `Start / continue Semester ${semesterNumber}`
                            : status === "IN_PROGRESS"
                              ? "Semester active"
                              : status === "FAILED"
                                ? "Repeat required"
                                : "Locked"}
                      </Button>
                      {canStart && semesterNumber === 1 && (
                        <span className="text-xs text-muted-foreground">
                          Admission fee and semester fee must be paid
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-xs text-muted-foreground">
                          Complete the previous semester first
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 border-t pt-3">
                    {semesterCourses.map((assignment) => {
                      const course = asRecord(assignment.course);
                      const teacher = asRecord(assignment.teacher);
                      const instructor = asRecord(teacher?.user);
                      return (
                        <div
                          key={text(assignment.id)}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="font-medium">
                              {text(course?.courseCode)}
                            </span>{" "}
                            · {text(course?.title)}
                          </span>
                          <span className="shrink-0 text-right text-muted-foreground">
                            {text(instructor?.firstName, "Faculty")}{" "}
                            {text(instructor?.lastName, "")}
                          </span>
                        </div>
                      );
                    })}
                    {!semesterCourses.length && (
                      <p className="text-sm text-muted-foreground">
                        Course assignments have not been published.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="font-semibold">Admission & semester fees</h2>
            {invoices.map((invoice) => (
              <div
                key={text(invoice.id)}
                className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
              >
                <div>
                  <p className="font-medium">{text(invoice.description)}</p>
                  <p className="text-muted-foreground">
                    {text(invoice.type)} · {money(invoice.amount)} ·{" "}
                    {text(invoice.status)}
                  </p>
                </div>
                {invoice.status !== "PAID" &&
                  typeof invoice.id === "string" && (
                    <PaymentOptions
                      invoiceId={invoice.id}
                      disabled={startPayment.isPending}
                      onPay={(invoiceId, gateway) =>
                        startPayment.mutate({ invoiceId, gateway })
                      }
                    />
                  )}
              </div>
            ))}
            {pendingInvoiceId &&
              !invoices.some((invoice) => invoice.id === pendingInvoiceId) && (
                <div className="space-y-3 border-t pt-3">
                  <p className="text-sm text-muted-foreground">
                    A new invoice is ready. Select a payment method:
                  </p>
                  <PaymentOptions
                    invoiceId={pendingInvoiceId}
                    disabled={startPayment.isPending}
                    onPay={(invoiceId, gateway) =>
                      startPayment.mutate({ invoiceId, gateway })
                    }
                  />
                </div>
              )}
            {!invoices.length && (
              <p className="border-t pt-3 text-sm text-muted-foreground">
                No invoices have been issued.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="font-semibold">Recent academic records</h2>
            {[...results.slice(0, 4), ...attendance.slice(0, 4)].map(
              (record, index) => (
                <div
                  key={`${text(record.id)}-${index}`}
                  className="border-t pt-3 text-sm"
                >
                  {text(record.status, text(record.grade, "Academic record"))}
                  {" · "}
                  {text(
                    asRecord(record.semesterCourse)?.course &&
                      asRecord(asRecord(record.semesterCourse)?.course)
                        ?.courseCode,
                    "Course",
                  )}
                </div>
              ),
            )}
            {!results.length && !attendance.length && (
              <p className="border-t pt-3 text-sm text-muted-foreground">
                Published results and attendance will appear here.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

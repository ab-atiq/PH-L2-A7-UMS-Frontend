"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { getApiErrorMessage, universityApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type RecordData = Record<string, unknown>;

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
  const profileQuery = useQuery({
    queryKey: ["university", "student-profile"],
    queryFn: universityApi.myStudentProfile,
    retry: false,
  });
  const profile = recordFrom(profileQuery.data);
  const programId = text(profile?.programId, "");
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
  });
  const invoicesQuery = useQuery({
    queryKey: ["university", "invoices", "student"],
    queryFn: () => universityApi.list("invoices/my", { limit: 100 }),
  });
  const attendanceQuery = useQuery({
    queryKey: ["university", "attendance", "student"],
    queryFn: universityApi.myAttendance,
  });
  const resultsQuery = useQuery({
    queryKey: ["university", "results", "student"],
    queryFn: () => universityApi.list("results"),
  });

  const semesters = recordsFrom(semestersQuery.data);
  const enrollments = recordsFrom(enrollmentsQuery.data);
  const invoices = recordsFrom(invoicesQuery.data);
  const attendance = recordsFrom(attendanceQuery.data);
  const results = recordsFrom(resultsQuery.data);
  const program = recordFrom(programQuery.data);

  const enroll = useMutation({
    mutationFn: universityApi.enrollSemester,
    onSuccess: async (response) => {
      const result = recordFrom(response);
      if (result?.paymentRequired === true) {
        toast.add({
          title: "Payment required",
          description: text(
            result.reason,
            "An invoice is ready; complete payment to enroll.",
          ),
          type: "info",
        });
      } else {
        toast.add({
          title: "Enrolled",
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
  const startPayment = useMutation({
    mutationFn: (invoiceId: string) =>
      universityApi.startPayment(invoiceId, "BKASH"),
    onSuccess: (response) => {
      const result = recordFrom(response);
      if (typeof result?.paymentUrl === "string")
        window.location.assign(result.paymentUrl);
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

  if (profileQuery.isLoading)
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> Loading your academic
        profile…
      </div>
    );

  if (!profile || !programId) {
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

  const progress = new Map<
    string,
    { status: string; courseCount: number; courses: string[] }
  >();
  for (const enrollment of enrollments) {
    const semesterEnrollment = asRecord(enrollment.semesterEnrollment);
    const semesterCourse = asRecord(enrollment.semesterCourse);
    const programSemester = asRecord(semesterCourse?.programSemester);
    const semesterId = text(programSemester?.id, "");
    if (!semesterId) continue;
    const current = progress.get(semesterId) ?? {
      status: text(semesterEnrollment?.status, "NOT_STARTED"),
      courseCount: 0,
      courses: [],
    };
    current.courseCount += 1;
    current.courses.push(text(asRecord(semesterCourse?.course)?.courseCode));
    progress.set(semesterId, current);
  }

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
          {money(program?.admissionFee)} · Semester {money(program?.semesterFee)}
        </p>
      </header>

      {semestersQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Loading curriculum…
        </div>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {semesters.map((semester) => {
            const id = text(semester.id, "");
            const semesterCourses = Array.isArray(semester.semesterCourses)
              ? recordsFrom(semester.semesterCourses)
              : [];
            const semesterProgress = progress.get(id);
            const isCurrent = profile.currentProgramSemesterId === id;
            const status =
              semesterProgress?.status ??
              (isCurrent ? "IN_PROGRESS" : "NOT_STARTED");
            return (
              <Card key={id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">
                        Semester {text(semester.semesterNumber)} ·{" "}
                        {text(semester.name)}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {status.replaceAll("_", " ")}
                        {semesterProgress
                          ? ` · ${semesterProgress.courseCount} registered courses`
                          : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isCurrent ? "default" : "outline"}
                      disabled={enroll.isPending || status === "COMPLETED"}
                      onClick={() => enroll.mutate(id)}
                    >
                      {enroll.isPending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : null}
                      {status === "COMPLETED" ? "Completed" : "Enroll"}
                    </Button>
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
                          <span className="shrink-0 text-muted-foreground">
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
            <h2 className="font-semibold">Tuition invoices</h2>
            {invoices.map((invoice) => (
              <div
                key={text(invoice.id)}
                className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
              >
                <div>
                  <p className="font-medium">{text(invoice.description)}</p>
                  <p className="text-muted-foreground">
                    {money(invoice.amount)} · {text(invoice.status)}
                  </p>
                </div>
                {invoice.status !== "PAID" &&
                typeof invoice.id === "string" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={startPayment.isPending}
                    onClick={() => startPayment.mutate(invoice.id as string)}
                  >
                    Pay with bKash
                  </Button>
                ) : null}
              </div>
            ))}
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
                  {text(asRecord(record.semesterCourse)?.course && asRecord(asRecord(record.semesterCourse)?.course)?.courseCode, "Course")}
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

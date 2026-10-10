"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getApiErrorMessage, universityApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type RecordData = Record<string, unknown>;
type DetailKind = "program" | "semester";
type Gateway = "BKASH" | "STRIPE";

function asRecord(value: unknown): RecordData | null {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  return value as RecordData;
}

function recordFrom(value: unknown): RecordData | null {
  const record = asRecord(value);
  return record ? (asRecord(record.data) ?? record) : null;
}

function recordsFrom(value: unknown): RecordData[] {
  if (Array.isArray(value))
    return value.filter(
      (item): item is RecordData =>
        typeof item === "object" && item !== null && !Array.isArray(item),
    );
  const record = asRecord(value);
  return record && Array.isArray(record.data) ? recordsFrom(record.data) : [];
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

function PaymentOptions({
  invoiceId,
  disabled,
  onPay,
}: {
  invoiceId: string;
  disabled: boolean;
  onPay: (invoiceId: string, gateway: Gateway) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => onPay(invoiceId, "BKASH")}
      >
        Pay with bKash
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => onPay(invoiceId, "STRIPE")}
      >
        Pay with Stripe
      </Button>
    </div>
  );
}

export default function AcademicDetailPage({
  kind,
  id,
}: {
  kind: DetailKind;
  id: string;
}) {
  const queryClient = useQueryClient();
  const [pendingInvoiceId, setPendingInvoiceId] = useState("");
  const profileQuery = useQuery({
    queryKey: ["university", "student-profile"],
    queryFn: universityApi.myStudentProfile,
    retry: false,
  });
  const profile = recordFrom(profileQuery.data);
  const detailQuery = useQuery({
    queryKey: ["university", "academic-detail", kind, id],
    queryFn: () =>
      universityApi.get(kind === "program" ? "programs" : "semesters", id),
    enabled: Boolean(id),
  });
  const programSemestersQuery = useQuery({
    queryKey: ["university", "program-semesters", id],
    queryFn: () => universityApi.programSemesters(id),
    enabled: kind === "program" && Boolean(id),
  });
  const invoicesQuery = useQuery({
    queryKey: ["university", "invoices", "student"],
    queryFn: () => universityApi.list("invoices/my", { limit: 100 }),
  });
  const semesterEnrollmentsQuery = useQuery({
    queryKey: ["university", "semester-enrollments", "student"],
    queryFn: universityApi.mySemesterEnrollments,
  });
  const detail = recordFrom(detailQuery.data);
  const programSemesters = recordsFrom(programSemestersQuery.data);
  const invoices = recordsFrom(invoicesQuery.data);
  const semesterEnrollments = recordsFrom(semesterEnrollmentsQuery.data);
  const detailProgramId =
    kind === "program"
      ? id
      : text(detail?.programId, text(asRecord(detail?.program)?.id, ""));
  const isOwnedProgram =
    Boolean(profile?.programId) && profile?.programId === detailProgramId;

  const pay = useMutation({
    mutationFn: ({
      invoiceId,
      gateway,
    }: {
      invoiceId: string;
      gateway: Gateway;
    }) => universityApi.startPayment(invoiceId, gateway),
    onSuccess: (response) => {
      const result = recordFrom(response);
      const paymentUrl =
        result?.redirectUrl ?? result?.paymentUrl ?? result?.checkoutUrl;
      if (typeof paymentUrl !== "string" || !paymentUrl) {
        toast.add({
          title: "Payment could not be started",
          description: "The payment gateway did not return a checkout URL.",
          type: "error",
        });
        return;
      }
      window.location.assign(paymentUrl);
    },
    onError: (error) =>
      toast.add({
        title: "Payment could not be started",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  const enroll = useMutation({
    mutationFn: universityApi.enrollSemester,
    onSuccess: async (response) => {
      const result = recordFrom(response);
      const invoiceId = text(result?.invoiceId, "");
      if (result?.paymentRequired && invoiceId) {
        setPendingInvoiceId(invoiceId);
        toast.add({
          title: "Invoice ready",
          description: "Choose bKash or Stripe below to continue payment.",
          type: "info",
        });
      } else {
        toast.add({
          title: "Semester activated",
          description: "Course enrollments for this semester are now active.",
          type: "success",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["university"] });
    },
    onError: (error) =>
      toast.add({
        title: "Could not start semester",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  if (profileQuery.isLoading || detailQuery.isLoading)
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> Loading details…
      </div>
    );

  if (profileQuery.isError || detailQuery.isError || !profile || !detail) {
    const error = profileQuery.error ?? detailQuery.error;
    return (
      <main className="p-4 sm:p-6">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h1 className="text-xl font-semibold">Details unavailable</h1>
            <p role="alert" className="text-sm text-destructive">
              {error
                ? getApiErrorMessage(error)
                : "The requested academic record could not be found."}
            </p>
            <Link
              href="/student/academics"
              className="text-sm font-medium text-primary hover:underline"
            >
              Return to academics
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!isOwnedProgram) {
    return (
      <main className="p-4 sm:p-6">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h1 className="text-xl font-semibold">Not your enrolled program</h1>
            <p className="text-sm text-muted-foreground">
              Payment and semester details are available only for your selected
              program.
            </p>
            <Link
              href="/student/academics"
              className="text-sm font-medium text-primary hover:underline"
            >
              Return to academics
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const admissionInvoice =
    kind === "program"
      ? invoices.find(
          (invoice) =>
            invoice.type === "ADMISSION" &&
            invoice.programId === id &&
            invoice.status !== "PAID",
        )
      : undefined;
  const semesterEnrollment =
    kind === "semester"
      ? semesterEnrollments.find(
          (item) =>
            item.programSemesterId === id ||
            asRecord(item.programSemester)?.id === id,
        )
      : undefined;
  const semesterInvoice =
    asRecord(semesterEnrollment)?.feeInvoices &&
    Array.isArray(asRecord(semesterEnrollment)?.feeInvoices)
      ? (asRecord(semesterEnrollment)?.feeInvoices as RecordData[]).find(
          (invoice) => invoice.type === "SEMESTER" && invoice.status !== "PAID",
        )
      : undefined;
  const semesterNumber = Number(detail.semesterNumber ?? 0);
  const previousSemesterStatus =
    kind === "semester" && semesterNumber > 1
      ? semesterEnrollments.find((item) => {
          const previous = asRecord(item.programSemester);
          return (
            text(previous?.programId, "") === detailProgramId &&
            Number(previous?.semesterNumber ?? 0) === semesterNumber - 1
          );
        })?.status
      : "COMPLETED";
  const semesterIsLocked =
    kind === "semester" &&
    semesterNumber > 1 &&
    previousSemesterStatus !== "COMPLETED";
  const activeInvoices =
    kind === "program" ? [admissionInvoice] : [semesterInvoice];
  const displayInvoices = activeInvoices.filter(
    (invoice): invoice is RecordData => Boolean(invoice),
  );
  const pendingInvoiceIsVisible = displayInvoices.some(
    (invoice) => invoice.id === pendingInvoiceId,
  );
  const semesterOne = programSemesters.find(
    (item) => Number(item.semesterNumber) === 1,
  );

  return (
    <main className="space-y-5 p-4 sm:p-6">
      <Link
        href="/student/academics"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to program semesters
      </Link>
      <Card>
        <CardContent className="space-y-5 p-6 sm:p-8">
          <span className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
            <BookOpen className="size-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">
              {kind === "program"
                ? "Program details"
                : `Semester ${text(detail.semesterNumber)} details`}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              {kind === "program"
                ? text(detail.name)
                : text(detail.name, `Semester ${semesterNumber}`)}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {kind === "program"
                ? `${text(detail.degreeType)} · ${text(detail.totalSemesters)} semesters · ${text(asRecord(detail.department)?.name)}`
                : `${text(asRecord(detail.program)?.name)} · ${text(detail.semesterCourses && Array.isArray(detail.semesterCourses) ? detail.semesterCourses.length : 0)} courses`}
            </p>
          </div>

          {kind === "program" ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium">Admission fee</p>
              <p className="mt-1 text-lg font-semibold">
                {money(detail.admissionFee)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                One-time fee required before Semester 1 activation. Semester
                tuition is {money(detail.semesterFee)} per semester.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium">Semester tuition</p>
              <p className="mt-1 text-lg font-semibold">
                {money(asRecord(detail.program)?.semesterFee)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {text(asRecord(semesterEnrollment)?.status, "Not started")}
              </p>
            </div>
          )}

          {kind === "program" ? (
            <Button
              disabled={
                enroll.isPending ||
                programSemestersQuery.isPending ||
                !semesterOne?.id
              }
              onClick={() =>
                semesterOne && enroll.mutate(text(semesterOne.id, ""))
              }
            >
              {enroll.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              Start / pay for Semester 1
            </Button>
          ) : (
            <Button
              disabled={
                enroll.isPending ||
                semesterIsLocked ||
                ["COMPLETED", "IN_PROGRESS"].includes(
                  text(asRecord(semesterEnrollment)?.status),
                )
              }
              onClick={() => enroll.mutate(id)}
            >
              {enroll.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              {text(asRecord(semesterEnrollment)?.status) === "IN_PROGRESS"
                ? "Semester active"
                : semesterIsLocked
                  ? "Previous semester incomplete"
                  : "Start / continue semester"}
            </Button>
          )}
          {semesterIsLocked && (
            <p className="text-sm text-muted-foreground">
              Complete Semester {semesterNumber - 1} before starting this
              semester.
            </p>
          )}

          {displayInvoices.map((invoice) => (
            <div
              key={text(invoice.id)}
              className="space-y-3 rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{text(invoice.description)}</p>
                <p className="text-sm text-muted-foreground">
                  {money(invoice.amount)} · {text(invoice.status)}
                </p>
              </div>
              {typeof invoice.id === "string" && (
                <PaymentOptions
                  invoiceId={text(invoice.id, "")}
                  disabled={pay.isPending}
                  onPay={(invoiceId, gateway) =>
                    pay.mutate({ invoiceId, gateway })
                  }
                />
              )}
            </div>
          ))}
          {pendingInvoiceId && !pendingInvoiceIsVisible && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                A new invoice is ready. Choose a payment method:
              </p>
              <PaymentOptions
                invoiceId={pendingInvoiceId}
                disabled={pay.isPending}
                onPay={(invoiceId, gateway) =>
                  pay.mutate({ invoiceId, gateway })
                }
              />
            </div>
          )}

          {kind === "semester" && (
            <div className="space-y-3 border-t pt-4">
              <h2 className="font-semibold">Semester courses</h2>
              {recordsFrom(detail.semesterCourses).map((assignment) => {
                const course = asRecord(assignment.course);
                const teacher = asRecord(assignment.teacher);
                const teacherUser = asRecord(teacher?.user);
                return (
                  <div
                    key={text(assignment.id)}
                    className="flex flex-wrap justify-between gap-2 border-b pb-3 text-sm last:border-0"
                  >
                    <span>
                      <strong>{text(course?.courseCode)}</strong> ·{" "}
                      {text(course?.title)} · {text(course?.credits)} credits
                    </span>
                    <span className="text-muted-foreground">
                      {text(teacherUser?.firstName, "Faculty")}{" "}
                      {text(teacherUser?.lastName, "")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {invoicesQuery.isError && (
            <p role="alert" className="text-sm text-destructive">
              Could not load invoices: {getApiErrorMessage(invoicesQuery.error)}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

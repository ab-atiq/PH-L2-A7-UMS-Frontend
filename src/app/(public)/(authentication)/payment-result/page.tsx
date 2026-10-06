"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleHelp, CircleX, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { universityApi } from "@/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-muted-foreground">
          Verifying payment…
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") ?? searchParams.get("id");
  const paymentQuery = useQuery({
    queryKey: ["university", "payment", paymentId],
    queryFn: () => universityApi.get("payments", paymentId ?? ""),
    enabled: Boolean(paymentId),
    retry: false,
  });
  const payment = isRecord(paymentQuery.data?.data)
    ? paymentQuery.data.data
    : null;
  const status = typeof payment?.status === "string" ? payment.status : null;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl flex-col items-center justify-center px-4 py-14 text-center">
      {paymentQuery.isPending && paymentId ? (
        <LoaderCircle className="size-10 animate-spin text-primary" />
      ) : status === "SUCCESS" ? (
        <CircleCheck className="size-12 text-emerald-600" />
      ) : status === "FAILED" || status === "CANCELLED" ? (
        <CircleX className="size-12 text-destructive" />
      ) : (
        <CircleHelp className="size-12 text-muted-foreground" />
      )}
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">
        {paymentQuery.isPending && paymentId
          ? "Verifying payment"
          : status === "SUCCESS"
            ? "Payment verified"
            : status === "FAILED"
              ? "Payment failed"
              : status === "CANCELLED"
                ? "Payment cancelled"
                : "Payment status pending"}
      </h1>
      <p className="mt-3 max-w-md leading-7 text-muted-foreground">
        {status
          ? `The university system reports this transaction as ${status.toLowerCase()}.`
          : paymentQuery.isError
            ? "We could not verify this transaction yet. Check your invoice history for the latest backend-confirmed status."
            : "The payment gateway returned to the portal. The payment is not marked successful until the university system verifies it."}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/workspace/invoices"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View invoices
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Return to dashboard
        </Link>
      </div>
    </section>
  );
}

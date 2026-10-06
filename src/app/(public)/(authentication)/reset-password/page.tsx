"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { getApiErrorMessage } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { mutateAsync: reset, isPending } = useResetPassword();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await reset({ email, otp, newPassword });
      setMessage(response.message ?? "Your password has been updated.");
    } catch (resetError) {
      setError(getApiErrorMessage(resetError));
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-4 py-14">
      <p className="text-sm font-medium text-primary">Account recovery</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Choose a new password
      </h1>
      <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-4">
        <label
          htmlFor="reset-password-email"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Email address
          <Input
            id="reset-password-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label
          htmlFor="reset-password-otp"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Verification code
          <Input
            id="reset-password-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            minLength={6}
            maxLength={6}
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
        </label>
        <label
          htmlFor="reset-password-new-password"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          New password
          <Input
            id="reset-password-new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </label>
        {message && (
          <output className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            {message}
          </output>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
      <Link
        href="/login"
        className="mt-5 text-sm font-medium text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </section>
  );
}

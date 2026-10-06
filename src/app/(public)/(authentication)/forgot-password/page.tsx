"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { getApiErrorMessage } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRequestPasswordReset } from "@/hooks";

export default function ForgotPasswordPage() {
  const { mutateAsync: requestReset, isPending } = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await requestReset({ email });
      setMessage(
        response.message ??
          "If the account exists, a reset code has been sent.",
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-4 py-14">
      <p className="text-sm font-medium text-primary">Account recovery</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Reset your password
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Enter your account email. If it is registered, the university will send
        a verification code.
      </p>
      <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-4">
        <label
          htmlFor="forgot-password-email"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Email address
          <Input
            id="forgot-password-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          {isPending ? "Sending…" : "Send reset code"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        Have a code?{" "}
        <Link
          href={`/reset-password?email=${encodeURIComponent(email)}`}
          className="font-medium text-primary hover:underline"
        >
          Continue to reset
        </Link>
      </p>
    </section>
  );
}

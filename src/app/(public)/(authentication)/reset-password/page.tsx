"use client";

import { getApiErrorMessage } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await reset({ email, otp, newPassword });
      setMessage(response.message ?? "Your password has been updated.");
      router.push("/login");
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
        {/* <label
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
        </label> */}
        <label
          htmlFor="reset-password-new-password"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Password
          <span className="relative">
            <Input
              id="reset-password-new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <label
          htmlFor="reset-confirm-password"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Confirm password
          <span className="relative">
            <Input
              id="reset-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showConfirmPassword}
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
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
      <div className="mt-5 font-medium items-center gap-2 text-sm text-muted-foreground">
        Don't need to reset password?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </section>
  );
}

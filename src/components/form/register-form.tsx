"use client";

import { getApiErrorMessage } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegistration } from "@/hooks";
import { registrationSchema } from "@/validation";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const { mutateAsync: register, isPending } = useRegistration();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setValue = (field: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const parsed = registrationSchema.safeParse(values);
    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Check the information entered.",
      );
      return;
    }

    try {
      const payload = {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        password: parsed.data.password,
        phone: parsed.data.phone,
      };
      await register(payload);
      router.push(
        `/register/verify-account?email=${encodeURIComponent(payload.email)}`,
      );
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll email you a verification code to finish setting up your account.
        </p>
      </div>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label
            htmlFor="register-first-name"
            className="flex flex-col gap-2 text-sm font-medium"
          >
            First name
            <Input
              id="register-first-name"
              required
              value={values.firstName}
              onChange={(event) => setValue("firstName", event.target.value)}
            />
          </label>
          <label
            htmlFor="register-last-name"
            className="flex flex-col gap-2 text-sm font-medium"
          >
            Last name
            <Input
              id="register-last-name"
              required
              value={values.lastName}
              onChange={(event) => setValue("lastName", event.target.value)}
            />
          </label>
        </div>
        <label
          htmlFor="register-email"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Email address
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(event) => setValue("email", event.target.value)}
          />
        </label>
        <label
          htmlFor="register-phone"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Phone number{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
          <Input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => setValue("phone", event.target.value)}
          />
        </label>
        <label
          htmlFor="register-password"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Password
          <span className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={values.password}
              onChange={(event) => setValue("password", event.target.value)}
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
          htmlFor="register-confirm-password"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Confirm password
          <span className="relative">
            <Input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={values.confirmPassword}
              onChange={(event) =>
                setValue("confirmPassword", event.target.value)
              }
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
        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {formError}
          </p>
        )}
        <Button className="h-10 w-full" type="submit" disabled={isPending}>
          {isPending ? "Creating account…" : "Create student account"}
        </Button>
      </form>
    </div>
  );
}

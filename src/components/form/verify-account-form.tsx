"use client";

import { useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/toast";
import { useVerifyAccount } from "@/hooks";

export default function VerifyAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const { mutateAsync: verify, isPending } = useVerifyAccount();

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the six-digit code sent to your email.");
      return;
    }
    setError("");
    try {
      await verify({ email, otp });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.add({
        title: "Email verified",
        description: "Your university account is ready.",
        type: "success",
      });
      router.replace("/dashboard");
    } catch (verifyError) {
      setError(getApiErrorMessage(verifyError));
    }
  };

  if (!email) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          Enter the six-digit verification code sent to <strong>{email}</strong>
          .
        </CardDescription>
      </CardHeader>
      <form onSubmit={(event) => void submit(event)}>
        <CardContent>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="otp">Verification code</FieldLabel>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError("");
              }}
              autoComplete="one-time-code"
              name="otp"
              id="otp"
              pattern={REGEXP_ONLY_DIGITS}
            >
              <InputOTPGroup>
                {[
                  "otp-slot-1",
                  "otp-slot-2",
                  "otp-slot-3",
                  "otp-slot-4",
                  "otp-slot-5",
                  "otp-slot-6",
                ].map((key, index) => (
                  <InputOTPSlot key={key} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {error && <FieldError errors={[{ message: error }]} />}
          </Field>
        </CardContent>
        <CardFooter className="mt-5">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Verifying…" : "Verify account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

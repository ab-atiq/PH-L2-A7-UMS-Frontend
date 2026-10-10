"use client";
import { getApiErrorMessage } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import GoogleLoginComponent from "@/components/university/google-login/GoogleLogin";
import { useLogin } from "@/hooks";
import { loginSchema } from "@/validation";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: login, isPending } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Check your email and password.",
      );
      return;
    }

    try {
      await login(parsed.data);
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.add({
        title: "Welcome back",
        description: "You are signed in.",
        type: "success",
      });
      router.replace("/dashboard");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access your academic services and university workspace.
        </p>
      </div>
      <div>
        {/* add 4 user tesing login by default button for testing all role */}
        <div className="flex flex-row gap-2 mb-2">
          <Button
            className="h-10 w-1/2"
            variant="outline"
            onClick={() => {
              setEmail(process.env.NEXT_PUBLIC_USER_EMAIL ?? "");
              setPassword(process.env.NEXT_PUBLIC_SEED_DEFAULT_PASSWORD ?? "");
            }}
          >
            Test User
          </Button>
          <Button
            className="h-10 w-1/2"
            variant="outline"
            onClick={() => {
              setEmail(process.env.NEXT_PUBLIC_STUDENT_EMAIL ?? "");
              setPassword(process.env.NEXT_PUBLIC_SEED_DEFAULT_PASSWORD ?? "");
            }}
          >
            Test Student
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          <Button
            className="h-10 w-1/2"
            variant="outline"
            onClick={() => {
              setEmail(process.env.NEXT_PUBLIC_FACULTY_EMAIL ?? "");
              setPassword(process.env.NEXT_PUBLIC_SEED_DEFAULT_PASSWORD ?? "");
            }}
          >
            Test Faculty
          </Button>
          <Button
            className="h-10 w-1/2"
            variant="outline"
            onClick={() => {
              setEmail(process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "");
              setPassword(process.env.NEXT_PUBLIC_SEED_DEFAULT_PASSWORD ?? "");
            }}
          >
            Test Admin
          </Button>
        </div>
      </div>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
        <label
          htmlFor="login-email"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Email address
          <Input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@university.edu"
          />
        </label>
        {/* <label
          htmlFor="login-password"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Password
          <Input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
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
        </label> */}
        <label
          htmlFor="login-password"
          className="flex flex-col gap-2 text-sm font-medium"
        >
          Password
          <span className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {formError}
          </p>
        )}
        <Button className="h-10 w-full" type="submit" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="relative text-center text-xs uppercase text-muted-foreground">
        <span className="bg-background px-2">or continue with</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 border-t" />
      </div>
      <div>
        <GoogleLoginComponent />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        New student?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

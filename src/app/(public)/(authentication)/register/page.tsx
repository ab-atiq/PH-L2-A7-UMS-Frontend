import Link from "next/link";
import Logo from "@/assets/svg/Logo";
import { RegisterForm } from "@/components/form/register-form";

export default function RegisterPage() {
  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center gap-2">
              <Logo />
              <span>University Portal</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden items-center justify-center overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.32),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.3),transparent_50%)]" />
        <div className="relative max-w-md">
          <Logo />
          <p className="mt-8 text-sm font-medium text-teal-200">
            WELCOME TO YOUR UNIVERSITY
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            Start your next chapter here.
          </h2>
          <p className="mt-4 leading-7 text-slate-300">
            Create your student profile to access course registration and
            academic services.
          </p>
        </div>
      </div>
    </div>
  );
}

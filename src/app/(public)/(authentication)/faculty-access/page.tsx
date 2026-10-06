import Link from "next/link";

export default function ApplyPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-primary">Faculty access</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Faculty accounts are provisioned by the university.
      </h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        Please contact your department administrator to request access. Student
        accounts can be created directly through the registration form.
      </p>
      <Link
        href="/login"
        className="mt-7 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue to sign in
      </Link>
    </section>
  );
}

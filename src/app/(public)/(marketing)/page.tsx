import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Landmark,
  LibraryBig,
  Users,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: BookOpen,
    title: "Academic services",
    description:
      "Explore your program curriculum, enroll by semester, and keep your academic journey organized.",
  },
  {
    icon: CalendarDays,
    title: "Schedules & exams",
    description:
      "Stay informed about course schedules, attendance, exam dates, and published results.",
  },
  {
    icon: Users,
    title: "One connected campus",
    description:
      "Students, faculty, and administrators use role-specific services built around their work.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative isolate border-b bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.34),transparent_44%),radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.25),transparent_46%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-teal-100">
              <Landmark className="size-3.5" /> A better way to manage campus
              life
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your university,{" "}
              <span className="text-teal-300">within reach.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              A single digital home for academic records, course registration,
              teaching, and university operations.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
              >
                Create a student account <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 px-5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Sign in to the portal
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2rem] bg-teal-400/10 blur-2xl" />
            <div className="relative rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-300/15 p-2.5 text-teal-200">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Campus workspace</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Your academic hub
                    </p>
                  </div>
                </div>
                <span className="size-2 rounded-full bg-emerald-400" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["Courses", "Find your next class"],
                  ["Schedule", "Plan your week"],
                  ["Results", "Track your progress"],
                  ["Services", "Manage campus tasks"],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-400">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                <LibraryBig className="size-4 text-teal-300" />
                One place for every step of the academic journey
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="academics"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">
            A connected campus
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            The tools to learn, teach, and lead.
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            University services are organized around the people who use them,
            with clear access to the information and actions that matter.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {services.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="border-y bg-muted/35">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-xl font-semibold">Ready to get started?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Students can create an account or sign in to continue.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open the portal <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

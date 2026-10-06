"use client";

import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  ReceiptText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAdminStats, useGetMe, useUniversityList } from "@/hooks";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRows(value: unknown): RecordValue[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  if (Array.isArray(value.data)) return value.data.filter(isRecord);
  if (Array.isArray(value.items)) return value.items.filter(isRecord);
  return [];
}

function Metric({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: typeof BookOpen;
}) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

function DashboardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-lg border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      {label}
      <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function UniversityOverview() {
  const { data: profile } = useGetMe();
  const role = profile?.data?.role;
  const { data: adminStats, isPending: adminStatsPending } = useAdminStats(
    role === "ADMIN",
  );
  const { data: enrollmentData } = useUniversityList(
    "enrollments",
    { limit: 100 },
    role === "STUDENT",
  );
  const { data: courseData } = useUniversityList(
    role === "FACULTY" ? "section-faculty" : "courses",
    { limit: 100 },
    role === "FACULTY",
  );
  const { data: examData } = useUniversityList(
    "exams",
    { limit: 100 },
    role === "STUDENT" || role === "FACULTY",
  );
  const { data: invoiceData } = useUniversityList(
    "invoices/my",
    { limit: 100 },
    role === "STUDENT",
  );

  const stats = isRecord(adminStats?.data) ? adminStats.data : {};
  const totals = isRecord(stats.totals) ? stats.totals : {};
  const enrollments = getRows(enrollmentData?.data);
  const courses = getRows(courseData?.data);
  const exams = getRows(examData?.data);
  const invoices = getRows(invoiceData?.data);
  const fullName = [profile?.data?.firstName, profile?.data?.lastName]
    .filter(Boolean)
    .join(" ");
  const roleTitle =
    role === "ADMIN"
      ? "Administration"
      : role === "FACULTY"
        ? "Faculty"
        : "Student";
  const quickLinks =
    role === "ADMIN"
      ? [
          { href: "/workspace/departments", label: "Manage departments" },
          { href: "/workspace/courses", label: "Manage courses" },
          { href: "/workspace/sections", label: "Manage sections" },
          { href: "/workspace/audit-logs", label: "Review audit logs" },
        ]
      : role === "FACULTY"
        ? [
            { href: "/workspace/sections", label: "View my courses" },
            { href: "/workspace/attendance", label: "Record attendance" },
            { href: "/workspace/exams", label: "Manage exams" },
            { href: "/workspace/results", label: "Enter results" },
          ]
        : [
            {
              href: "/workspace/course-registration",
              label: "Register for courses",
            },
            { href: "/workspace/enrollments", label: "View my courses" },
            { href: "/workspace/transcript", label: "View transcript" },
            { href: "/workspace/invoices", label: "View fees and payments" },
          ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">
              {roleTitle} portal
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome{fullName ? `, ${fullName}` : " back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your academic workspace, all in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4 text-primary" />
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(new Date())}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {role === "ADMIN" ? (
            adminStatsPending ? (
              <div className="col-span-full rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                Loading university statistics…
              </div>
            ) : (
              <>
                <Metric
                  title="Students"
                  value={String(totals.students ?? "—")}
                  detail="Registered student profiles"
                  icon={GraduationCap}
                />
                <Metric
                  title="Faculty"
                  value={String(totals.faculty ?? "—")}
                  detail="Active faculty profiles"
                  icon={Users}
                />
                <Metric
                  title="Departments"
                  value={String(totals.departments ?? "—")}
                  detail="Academic departments"
                  icon={BookOpen}
                />
                <Metric
                  title="Courses"
                  value={String(totals.courses ?? "—")}
                  detail="Courses in the catalog"
                  icon={ReceiptText}
                />
              </>
            )
          ) : role === "FACULTY" ? (
            <>
              <Metric
                title="Assigned sections"
                value={courses.length}
                detail="Sections assigned to you"
                icon={BookOpen}
              />
              <Metric
                title="Upcoming exams"
                value={exams.length}
                detail="Exams available to manage"
                icon={CalendarDays}
              />
            </>
          ) : (
            <>
              <Metric
                title="My courses"
                value={enrollments.length}
                detail="Current and past enrollments"
                icon={BookOpen}
              />
              <Metric
                title="Exams"
                value={exams.length}
                detail="Exams available for your courses"
                icon={CalendarDays}
              />
              <Metric
                title="Invoices"
                value={invoices.length}
                detail="Your fee records"
                icon={ReceiptText}
              />
            </>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Quick access</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump into the services you use most.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickLinks.map((link) => (
                <DashboardLink key={link.href} {...link} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <GraduationCap className="size-5" />
              </span>
              <h2 className="text-lg font-semibold">University services</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Access academic records, course services, and campus
              administration through your role-specific workspace. Records are
              always loaded from the university system.
            </p>
            <Link
              href="/workspace/notifications"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View notifications <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleAlert,
  LoaderCircle,
  Plus,
  Search,
  X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { getApiErrorMessage, type Resource, universityApi } from "@/api";
import { toast } from "@/components/ui/toast";
import {
  useGetMe,
  useUniversityCreate,
  useUniversityDelete,
  useUniversityList,
} from "@/hooks";
import type { UserRole } from "@/types";

type FieldSpec = {
  name: string;
  label: string;
  kind?: "text" | "number" | "date" | "select";
  required?: boolean;
  options?: string[];
};

type ResourceConfig = {
  title: string;
  endpoint: string | null;
  description: string;
  fields?: FieldSpec[];
  createOnly?: boolean;
};

const configs: Record<string, ResourceConfig> = {
  "course-registration": {
    title: "Course registration",
    endpoint: "sections",
    description:
      "Review published sections and register for available courses.",
  },
  profile: {
    title: "My profile",
    endpoint: null,
    description:
      "Manage the personal contact information on your university account.",
    fields: [
      { name: "firstName", label: "First name", required: true },
      { name: "lastName", label: "Last name", required: true },
      { name: "phone", label: "Phone number" },
    ],
  },
  courses: {
    title: "Course catalog",
    endpoint: "courses",
    description: "Browse the academic course catalog.",
    fields: [
      { name: "courseCode", label: "Course code", required: true },
      { name: "title", label: "Course title", required: true },
      { name: "credits", label: "Credits", kind: "number", required: true },
      { name: "departmentId", label: "Department ID", required: true },
      { name: "description", label: "Description" },
      {
        name: "status",
        label: "Status",
        kind: "select",
        options: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      },
    ],
  },
  departments: {
    title: "Departments",
    endpoint: "departments",
    description: "Manage university departments and their academic codes.",
    fields: [
      { name: "name", label: "Department name", required: true },
      { name: "code", label: "Department code", required: true },
      { name: "description", label: "Description" },
      {
        name: "status",
        label: "Status",
        kind: "select",
        options: ["ACTIVE", "INACTIVE"],
      },
    ],
  },
  programs: {
    title: "Programs",
    endpoint: "programs",
    description: "Manage degree programs and credit requirements.",
    fields: [
      { name: "name", label: "Program name", required: true },
      { name: "code", label: "Program code", required: true },
      { name: "departmentId", label: "Department ID", required: true },
      {
        name: "durationYears",
        label: "Duration (years)",
        kind: "number",
        required: true,
      },
      {
        name: "totalCredits",
        label: "Total credits",
        kind: "number",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        kind: "select",
        options: ["ACTIVE", "INACTIVE"],
      },
    ],
  },
  semesters: {
    title: "Semesters",
    endpoint: "semesters",
    description: "Set up semester dates and course registration windows.",
    fields: [
      { name: "name", label: "Semester name", required: true },
      { name: "startDate", label: "Start date", kind: "date", required: true },
      { name: "endDate", label: "End date", kind: "date", required: true },
      {
        name: "registrationStart",
        label: "Registration opens",
        kind: "date",
        required: true,
      },
      {
        name: "registrationEnd",
        label: "Registration closes",
        kind: "date",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        kind: "select",
        options: [
          "UPCOMING",
          "REGISTRATION_OPEN",
          "CURRENT",
          "COMPLETED",
          "ARCHIVED",
        ],
      },
    ],
  },
  sections: {
    title: "Sections",
    endpoint: "sections",
    description: "Review course sections, schedules, and teaching assignments.",
    fields: [
      { name: "courseId", label: "Course ID", required: true },
      { name: "semesterId", label: "Semester ID", required: true },
      { name: "sectionName", label: "Section name", required: true },
      { name: "capacity", label: "Capacity", kind: "number", required: true },
      { name: "room", label: "Room" },
      {
        name: "status",
        label: "Status",
        kind: "select",
        options: ["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"],
      },
    ],
  },
  students: {
    title: "Students",
    endpoint: null,
    description:
      "Student list access is not exposed by the current backend API.",
  },
  users: {
    title: "Users",
    endpoint: null,
    description:
      "A user listing endpoint is not mounted in the current backend API.",
  },
  faculty: {
    title: "Faculty",
    endpoint: "faculty",
    description: "Review faculty profiles and academic assignments.",
  },
  enrollments: {
    title: "My courses",
    endpoint: "enrollments",
    description:
      "View your course enrollment records and their current status.",
  },
  attendance: {
    title: "Attendance",
    endpoint: null,
    description: "Attendance records are loaded for a specific course section.",
    fields: [
      { name: "enrollmentId", label: "Enrollment ID", required: true },
      { name: "classDate", label: "Class date", kind: "date", required: true },
      {
        name: "status",
        label: "Attendance status",
        kind: "select",
        required: true,
        options: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
      },
      { name: "remarks", label: "Remarks" },
    ],
  },
  "course-prerequisites": {
    title: "Course prerequisites",
    endpoint: "course-prerequisites",
    description: "Review and maintain course prerequisite relationships.",
    fields: [
      { name: "courseId", label: "Course ID", required: true },
      {
        name: "prerequisiteId",
        label: "Prerequisite course ID",
        required: true,
      },
    ],
    createOnly: true,
  },
  transcript: {
    title: "Transcript",
    endpoint: "transcripts/my",
    description:
      "Your official academic transcript from the university system.",
  },
  invoices: {
    title: "Invoices and fees",
    endpoint: "invoices/my",
    description:
      "Review your fee invoices and continue to secure payment checkout.",
    fields: [
      { name: "studentId", label: "Student profile ID", required: true },
      { name: "description", label: "Description", required: true },
      { name: "amount", label: "Amount", kind: "number", required: true },
      { name: "dueDate", label: "Due date", kind: "date", required: true },
      { name: "semesterId", label: "Semester ID" },
    ],
  },
  exams: {
    title: "Exams",
    endpoint: "exams",
    description:
      "Review and manage exams for the university's course sections.",
    fields: [
      { name: "sectionId", label: "Section ID", required: true },
      {
        name: "examType",
        label: "Exam type",
        kind: "select",
        required: true,
        options: ["QUIZ", "ASSIGNMENT", "MIDTERM", "FINAL", "PROJECT"],
      },
      { name: "examDate", label: "Exam date", kind: "date", required: true },
      {
        name: "totalMarks",
        label: "Total marks",
        kind: "number",
        required: true,
      },
      { name: "title", label: "Title" },
    ],
    createOnly: true,
  },
  results: {
    title: "Results",
    endpoint: "results",
    description: "View or manage academic results.",
    fields: [
      { name: "examId", label: "Exam ID", required: true },
      { name: "studentId", label: "Student profile ID", required: true },
      { name: "enrollmentId", label: "Enrollment ID", required: true },
      {
        name: "marksObtained",
        label: "Marks obtained",
        kind: "number",
        required: true,
      },
    ],
    createOnly: true,
  },
  payments: {
    title: "Payments",
    endpoint: null,
    description:
      "The backend currently supports payment details by transaction ID, but does not expose a payment listing.",
  },
  "audit-logs": {
    title: "Audit logs",
    endpoint: "audit-logs",
    description: "Review administrative activity records.",
  },
  notifications: {
    title: "Notifications",
    endpoint: "notifications",
    description: "Stay up to date with university and academic announcements.",
  },
  settings: {
    title: "Settings",
    endpoint: null,
    description:
      "Account preferences are managed through your profile and authentication settings.",
  },
};

const hiddenFields = new Set([
  "password",
  "passwordHash",
  "refreshToken",
  "accessToken",
]);

function isRecord(value: unknown): value is Resource {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rowsFrom(value: unknown): Resource[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  for (const key of [
    "items",
    "results",
    "enrollments",
    "sections",
    "records",
  ]) {
    if (Array.isArray(value[key])) return value[key].filter(isRecord);
  }
  return [];
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(formatCell).join(", ");
  if (isRecord(value)) {
    const displayName =
      value.name ?? value.title ?? value.courseCode ?? value.email;
    if (typeof displayName === "string") return displayName;
  }
  return "Details available";
}

function toInputValue(value: unknown, kind?: FieldSpec["kind"]) {
  if (value === undefined || value === null) return "";
  if (kind === "date" && typeof value === "string") return value.slice(0, 10);
  return String(value);
}

function getApiResource(resource: string, role?: UserRole) {
  if (resource === "sections" && role === "FACULTY") return "section-faculty";
  if (resource === "invoices" && role === "ADMIN") return "invoices";
  return configs[resource]?.endpoint;
}

function getItemId(item: Resource) {
  const id = item.id;
  return typeof id === "string" ? id : null;
}

function getPrerequisiteId(item: Resource) {
  return typeof item.prerequisiteId === "string" ? item.prerequisiteId : null;
}

function getUserFacingTitle(item: Resource) {
  const candidate =
    item.title ?? item.name ?? item.courseCode ?? item.sectionName ?? item.id;
  return typeof candidate === "string" ? candidate : "this record";
}

export default function WorkspacePage({ resource }: { resource: string }) {
  const config = configs[resource];
  const { data: userResponse } = useGetMe();
  const role = userResponse?.data?.role;
  const endpoint = config ? getApiResource(resource, role) : null;
  const isStudent = role === "STUDENT";
  const isAdmin = role === "ADMIN";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Resource | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<{
    kind: "register" | "delete" | "prerequisite-delete";
    id: string;
    title: string;
  } | null>(null);
  const [attendanceSection, setAttendanceSection] = useState("");
  const [prerequisiteCourse, setPrerequisiteCourse] = useState("");
  const [paymentGateway, setPaymentGateway] = useState<
    "STRIPE" | "BKASH" | "SSLCOMMERZ"
  >("STRIPE");
  const [isSaving, setIsSaving] = useState(false);
  const listQuery =
    resource === "invoices" && isStudent ? { limit: 100 } : { page, limit: 10 };
  const query = useUniversityList(
    endpoint ?? "",
    listQuery,
    Boolean(endpoint) && resource !== "course-prerequisites",
  );
  const queryClient = useQueryClient();
  const createMutation = useUniversityCreate(endpoint ?? "");
  const deleteMutation = useUniversityDelete(endpoint ?? "");
  const attendanceQuery = useQuery({
    queryKey: ["university", "attendance", attendanceSection],
    queryFn: () => universityApi.attendanceBySection(attendanceSection),
    enabled: resource === "attendance" && attendanceSection.length > 0,
  });
  const prerequisiteQuery = useQuery({
    queryKey: ["university", "course-prerequisites", prerequisiteCourse],
    queryFn: () =>
      universityApi.get("course-prerequisites", prerequisiteCourse),
    enabled:
      resource === "course-prerequisites" && prerequisiteCourse.length > 0,
  });
  const registration = useUniversityRegistrationMutation();
  const rows = useMemo(
    () =>
      resource === "profile" && userResponse?.data
        ? rowsFrom([userResponse.data])
        : rowsFrom(
            resource === "attendance"
              ? attendanceQuery.data?.data
              : resource === "course-prerequisites"
                ? prerequisiteQuery.data?.data
                : query.data?.data,
          ),
    [
      attendanceQuery.data,
      prerequisiteQuery.data,
      query.data,
      resource,
      userResponse,
    ],
  );
  const displayedRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return rows;
    return rows.filter((item) =>
      Object.entries(item).some(
        ([key, value]) =>
          !hiddenFields.has(key) &&
          `${key} ${formatCell(value)}`
            .toLowerCase()
            .includes(normalizedSearch),
      ),
    );
  }, [rows, search]);
  const columns = useMemo(() => {
    const firstRow = displayedRows[0];
    return firstRow
      ? Object.keys(firstRow)
          .filter((key) => !hiddenFields.has(key))
          .filter((key) => !["password", "passwordHash"].includes(key))
          .slice(0, 6)
      : [];
  }, [displayedRows]);

  if (!config) {
    return (
      <WorkspaceFrame
        title="Page not found"
        description="Choose a service from the navigation menu."
      >
        <a
          className="text-sm font-medium text-primary hover:underline"
          href="/dashboard"
        >
          Return to dashboard
        </a>
      </WorkspaceFrame>
    );
  }

  const editableFields =
    isAdmin ||
    resource === "profile" ||
    (role === "FACULTY" &&
      ["attendance", "exams", "results"].includes(resource))
      ? config.fields
      : undefined;
  const canCreate = Boolean(
    (editableFields?.length && endpoint) ||
      (["attendance", "profile"].includes(resource) &&
        editableFields?.length &&
        (resource === "profile" || attendanceSection)),
  );
  const canDelete =
    isAdmin &&
    ["departments", "programs", "courses", "semesters", "sections"].includes(
      resource,
    );
  const hasRowActions =
    resource === "course-registration" ||
    resource === "enrollments" ||
    resource === "invoices" ||
    resource === "notifications" ||
    resource === "profile" ||
    resource === "course-prerequisites" ||
    resource === "exams" ||
    resource === "results" ||
    canDelete;
  const currentPageCount = query.data?.meta?.totalPages;
  const totalCount = query.data?.meta?.total;
  const isPending =
    resource === "attendance"
      ? attendanceQuery.isPending
      : resource === "course-prerequisites"
        ? Boolean(prerequisiteCourse) && prerequisiteQuery.isPending
        : resource === "profile"
          ? !userResponse
          : query.isPending;
  const isError =
    resource === "attendance"
      ? attendanceQuery.isError
      : resource === "course-prerequisites"
        ? prerequisiteQuery.isError
        : resource === "profile"
          ? false
          : query.isError;
  const error =
    resource === "attendance"
      ? attendanceQuery.error
      : resource === "course-prerequisites"
        ? prerequisiteQuery.error
        : resource === "profile"
          ? null
          : query.error;

  const openCreateForm = () => {
    setEditItem(null);
    setFormValues({});
    setFormOpen(true);
  };

  const openEditForm = (item: Resource) => {
    if (config.createOnly) return;
    if (!config.fields) return;
    setEditItem(item);
    setFormValues(
      Object.fromEntries(
        config.fields.map((field) => [
          field.name,
          toInputValue(item[field.name], field.kind),
        ]),
      ),
    );
    setFormOpen(true);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      (!endpoint && !["attendance", "profile"].includes(resource)) ||
      !config.fields
    )
      return;
    const body: Resource = {};
    config.fields.forEach((field) => {
      const value = formValues[field.name]?.trim() ?? "";
      if (!value) return;
      body[field.name] = field.kind === "number" ? Number(value) : value;
    });
    setIsSaving(true);
    try {
      if (resource === "attendance") {
        await universityApi.recordAttendance(attendanceSection, body);
        await queryClient.invalidateQueries({
          queryKey: ["university", "attendance", attendanceSection],
        });
        toast.add({
          title: "Attendance recorded",
          description: "The backend has saved the attendance record.",
          type: "success",
        });
      } else if (resource === "profile") {
        await universityApi.updateProfile(body);
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.add({
          title: "Profile updated",
          description: "Your contact information has been saved.",
          type: "success",
        });
      } else if (resource === "exams") {
        await universityApi.createExam(body);
        await queryClient.invalidateQueries({
          queryKey: ["university", "exams"],
        });
        toast.add({
          title: "Exam created",
          description: "The exam was saved.",
          type: "success",
        });
      } else if (resource === "results") {
        await universityApi.createResult(body);
        await queryClient.invalidateQueries({
          queryKey: ["university", "results"],
        });
        toast.add({
          title: "Result submitted",
          description: "The result was sent to the university system.",
          type: "success",
        });
      } else if (editItem) {
        const id = getItemId(editItem);
        if (!id)
          throw new Error("The record cannot be updated because it has no ID.");
        if (!endpoint) throw new Error("This resource cannot be updated.");
        await universityApi.update(endpoint, id, body);
        toast.add({
          title: `${config.title} updated`,
          description: "The changes have been saved.",
          type: "success",
        });
      } else {
        await createMutation.mutateAsync(body);
        toast.add({
          title: `${config.title} created`,
          description: "The new record has been saved.",
          type: "success",
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["university", endpoint],
      });
      setFormOpen(false);
      setEditItem(null);
    } catch (submitError) {
      toast.add({
        title: "Could not save changes",
        description: getApiErrorMessage(submitError),
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.kind === "register") {
        await registration.mutateAsync(pendingAction.id);
        toast.add({
          title: "Registration submitted",
          description:
            "The university system has received your enrollment request.",
          type: "success",
        });
      } else if (pendingAction.kind === "prerequisite-delete") {
        await universityApi.removeCoursePrerequisite(
          prerequisiteCourse,
          pendingAction.id,
        );
        await queryClient.invalidateQueries({
          queryKey: ["university", "course-prerequisites", prerequisiteCourse],
        });
        toast.add({
          title: "Prerequisite removed",
          description: pendingAction.title,
          type: "success",
        });
      } else {
        await deleteMutation.mutateAsync(pendingAction.id);
        toast.add({
          title: "Record deleted",
          description: `${pendingAction.title} has been removed.`,
          type: "success",
        });
      }
      setPendingAction(null);
    } catch (actionError) {
      toast.add({
        title: "Action could not be completed",
        description: getApiErrorMessage(actionError),
        type: "error",
      });
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await universityApi.markNotificationRead(id);
      await queryClient.invalidateQueries({
        queryKey: ["university", "notifications"],
      });
      toast.add({
        title: "Notification updated",
        description: "Marked as read.",
        type: "success",
      });
    } catch (actionError) {
      toast.add({
        title: "Could not update notification",
        description: getApiErrorMessage(actionError),
        type: "error",
      });
    }
  };

  const payInvoice = async (id: string) => {
    try {
      const response = await universityApi.startPayment(id, paymentGateway);
      const checkoutUrl =
        isRecord(response.data) && typeof response.data.checkoutUrl === "string"
          ? response.data.checkoutUrl
          : isRecord(response.data) && typeof response.data.url === "string"
            ? response.data.url
            : isRecord(response.data) &&
                typeof response.data.paymentUrl === "string"
              ? response.data.paymentUrl
              : isRecord(response.data) &&
                  typeof response.data.redirectUrl === "string"
                ? response.data.redirectUrl
                : null;
      if (!checkoutUrl) {
        toast.add({
          title: "Payment initiated",
          description: response.message,
          type: "info",
        });
        return;
      }
      window.location.assign(checkoutUrl);
    } catch (actionError) {
      toast.add({
        title: "Payment could not be started",
        description: getApiErrorMessage(actionError),
        type: "error",
      });
    }
  };

  const publishItem = async (kind: "exam" | "result", id: string) => {
    try {
      if (kind === "exam") {
        await universityApi.publishExam(id);
        await queryClient.invalidateQueries({
          queryKey: ["university", "exams"],
        });
      } else {
        await universityApi.publishResult(id);
        await queryClient.invalidateQueries({
          queryKey: ["university", "results"],
        });
      }
      toast.add({
        title: `${kind === "exam" ? "Exam" : "Result"} published`,
        description: "The backend confirmed the update.",
        type: "success",
      });
    } catch (publishError) {
      toast.add({
        title: "Could not publish",
        description: getApiErrorMessage(publishError),
        type: "error",
      });
    }
  };

  return (
    <WorkspaceFrame
      title={config.title}
      description={config.description}
      actions={
        canCreate ? (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> Add record
          </button>
        ) : resource === "transcript" ? (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            Print transcript
          </button>
        ) : null
      }
    >
      {resource === "attendance" && (
        <label className="mb-5 flex max-w-xl flex-col gap-2 text-sm font-medium">
          Section ID
          <input
            value={attendanceSection}
            onChange={(event) => setAttendanceSection(event.target.value)}
            placeholder="Enter the section UUID to view attendance"
            className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      )}
      {resource === "course-prerequisites" && (
        <label className="mb-5 flex max-w-xl flex-col gap-2 text-sm font-medium">
          Course ID
          <input
            value={prerequisiteCourse}
            onChange={(event) => setPrerequisiteCourse(event.target.value)}
            placeholder="Enter a course UUID to inspect its prerequisites"
            className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      )}
      {resource === "invoices" && isStudent && (
        <label className="mb-5 flex max-w-xs flex-col gap-2 text-sm font-medium">
          Payment gateway
          <select
            value={paymentGateway}
            onChange={(event) => {
              const value = event.target.value;
              if (
                value === "STRIPE" ||
                value === "BKASH" ||
                value === "SSLCOMMERZ"
              ) {
                setPaymentGateway(value);
              }
            }}
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="STRIPE">Stripe</option>
            <option value="BKASH">bKash</option>
            <option value="SSLCOMMERZ">SSLCOMMERZ</option>
          </select>
        </label>
      )}

      {!endpoint && resource !== "attendance" && resource !== "profile" ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
          <CircleAlert className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">This list is not available yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {config.description}
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">{config.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalCount !== undefined
                  ? `${totalCount} records`
                  : "Live university records"}
              </p>
            </div>
            <label className="relative block sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search this page"
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>

          {isPending ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Loading records…
            </div>
          ) : isError ? (
            <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
              <CircleAlert className="size-7 text-destructive" />
              <p className="mt-3 font-medium">Records could not be loaded</p>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>
              <button
                type="button"
                onClick={() =>
                  resource === "attendance"
                    ? attendanceQuery.refetch()
                    : query.refetch()
                }
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : displayedRows.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
              <BookOpenIcon />
              <p className="mt-3 font-medium">
                {search ? "No matching records" : "No records to show"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Try another search term."
                  : "This view will show data as soon as the backend has records for your account."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      {columns.map((column) => (
                        <th key={column} className="px-4 py-3 font-medium">
                          {column
                            .replace(/[A-Z]/g, (letter) => ` ${letter}`)
                            .replace(/^./, (letter) => letter.toUpperCase())}
                        </th>
                      ))}
                      {hasRowActions && (
                        <th className="px-4 py-3 font-medium">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displayedRows.map((item, index) => {
                      const id = getItemId(item);
                      return (
                        <tr key={id ?? index} className="hover:bg-muted/30">
                          {columns.map((column) => (
                            <td
                              key={column}
                              className="max-w-64 px-4 py-3 align-top text-foreground/85"
                            >
                              {formatCell(item[column])}
                            </td>
                          ))}
                          {hasRowActions && (
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {resource === "course-registration" &&
                                  isStudent &&
                                  id && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingAction({
                                          kind: "register",
                                          id,
                                          title: getUserFacingTitle(item),
                                        })
                                      }
                                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                    >
                                      Register
                                    </button>
                                  )}
                                {resource === "profile" && id && (
                                  <button
                                    type="button"
                                    onClick={() => openEditForm(item)}
                                    className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                  >
                                    Edit profile
                                  </button>
                                )}
                                {canDelete && isAdmin && id && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEditForm(item)}
                                      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingAction({
                                          kind: "delete",
                                          id,
                                          title: getUserFacingTitle(item),
                                        })
                                      }
                                      className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                                {resource === "invoices" &&
                                  isStudent &&
                                  id &&
                                  (item.status === "PAID" ? (
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                                      Paid
                                    </span>
                                  ) : item.status === "CANCELLED" ? (
                                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                      Cancelled
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => void payInvoice(id)}
                                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                    >
                                      Pay invoice
                                    </button>
                                  ))}
                                {resource === "enrollments" &&
                                  isStudent &&
                                  id &&
                                  item.status === "ENROLLED" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingAction({
                                          kind: "delete",
                                          id,
                                          title: getUserFacingTitle(item),
                                        })
                                      }
                                      className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                                    >
                                      Drop course
                                    </button>
                                  )}
                                {resource === "exams" &&
                                  id &&
                                  (isAdmin || role === "FACULTY") &&
                                  item.status === "DRAFT" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void publishItem("exam", id)
                                      }
                                      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                    >
                                      Publish
                                    </button>
                                  )}
                                {resource === "results" &&
                                  isAdmin &&
                                  id &&
                                  (item.isPublished === false ||
                                    item.status === "DRAFT") && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void publishItem("result", id)
                                      }
                                      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                    >
                                      Publish
                                    </button>
                                  )}
                                {resource === "course-prerequisites" &&
                                  isAdmin &&
                                  getPrerequisiteId(item) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const prerequisiteId =
                                          getPrerequisiteId(item);
                                        if (!prerequisiteId) return;
                                        setPendingAction({
                                          kind: "prerequisite-delete",
                                          id: prerequisiteId,
                                          title: getUserFacingTitle(item),
                                        });
                                      }}
                                      className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                                    >
                                      Remove prerequisite
                                    </button>
                                  )}
                                {resource === "notifications" &&
                                  id &&
                                  !item.isRead && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void markNotificationRead(id)
                                      }
                                      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                    >
                                      Mark read
                                    </button>
                                  )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {currentPageCount !== undefined && currentPageCount > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                  <span className="text-muted-foreground">
                    Page {query.data?.meta?.page ?? page} of {currentPageCount}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      className="rounded-md border p-2 disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={page >= currentPageCount}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(currentPageCount, current + 1),
                        )
                      }
                      className="rounded-md border p-2 disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {formOpen && config.fields && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-form-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="record-form-title" className="text-lg font-semibold">
                  {editItem ? `Edit ${config.title}` : `Add ${config.title}`}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The backend validates and saves these fields.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close form"
              >
                <X className="size-5" />
              </button>
            </div>
            <form
              onSubmit={(event) => void submitForm(event)}
              className="mt-5 space-y-4"
            >
              {config.fields.map((field) => (
                <label
                  key={field.name}
                  htmlFor={`workspace-field-${field.name}`}
                  className="flex flex-col gap-1.5 text-sm font-medium"
                >
                  {field.label}
                  {field.kind === "select" ? (
                    <select
                      required={field.required}
                      id={`workspace-field-${field.name}`}
                      value={formValues[field.name] ?? ""}
                      onChange={(event) =>
                        setFormValues((values) => ({
                          ...values,
                          [field.name]: event.target.value,
                        }))
                      }
                      className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a value</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={field.required}
                      id={`workspace-field-${field.name}`}
                      type={field.kind ?? "text"}
                      value={formValues[field.name] ?? ""}
                      onChange={(event) =>
                        setFormValues((values) => ({
                          ...values,
                          [field.name]: event.target.value,
                        }))
                      }
                      className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  )}
                </label>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="h-9 rounded-lg border px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || isSaving}
                  className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {createMutation.isPending || isSaving
                    ? "Saving…"
                    : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">
              {pendingAction.kind === "register"
                ? "Confirm course registration"
                : "Delete this record?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pendingAction.kind === "register"
                ? `Submit a registration request for ${pendingAction.title}? Eligibility and seat availability are confirmed by the university system.`
                : `This will remove ${pendingAction.title}. The backend may reject the request if the record is in use.`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="h-9 rounded-lg border px-4 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmAction()}
                disabled={registration.isPending || deleteMutation.isPending}
                className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {registration.isPending || deleteMutation.isPending
                  ? "Submitting…"
                  : "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </WorkspaceFrame>
  );
}

function useUniversityRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: universityApi.registerSection,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["university"] }),
  });
}

function WorkspaceFrame({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">
              University workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          {actions}
        </header>
        {children}
      </div>
    </main>
  );
}

function BookOpenIcon() {
  return <BookOpen className="size-7 text-muted-foreground" />;
}

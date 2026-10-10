import apiClient from "@/lib/apiClient";
import type { AvailableFacultyUser, FacultyProfile, User } from "@/types";

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type Resource = Record<string, unknown>;
export type ListQuery = Record<string, string | number | undefined>;

export type FacultyProfilePayload = {
  employeeId?: string;
  designation?: string;
  specialization?: string | null;
  departmentId?: string | null;
  userId?: string;
  joinDate?: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
};

export type AdminUserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING_VERIFICATION";

function queryString(query?: ListQuery) {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export const universityApi = {
  me: () => apiClient<ApiEnvelope<Resource>>("/user/me"),
  updateProfile: (body: Resource) =>
    apiClient<ApiEnvelope<Resource>>("/user/me", { method: "PATCH", body }),
  uploadProfileImage: (file: File) => {
    const body = new FormData();
    body.append("profileImage", file);
    return apiClient<ApiEnvelope<User>>("/user/profile-image", {
      method: "PATCH",
      body,
    });
  },
  adminStats: () => apiClient<ApiEnvelope<Resource>>("/admin/dashboard/stats"),
  listFaculty: (search?: string) =>
    apiClient<ApiEnvelope<FacultyProfile[]>>("/faculty", {
      params: search ? { search } : undefined,
    }),
  filterFaculty: (filters: ListQuery) =>
    apiClient<ApiEnvelope<FacultyProfile[]>>("/faculty/filter", {
      params: filters,
    }),
  availableFacultyUsers: () =>
    apiClient<ApiEnvelope<AvailableFacultyUser[]>>("/faculty/available-users"),
  facultyByEmployeeId: (employeeId: string) =>
    apiClient<ApiEnvelope<FacultyProfile>>(
      `/faculty/${encodeURIComponent(employeeId)}`,
    ),
  createFaculty: (payload: FacultyProfilePayload) =>
    apiClient<ApiEnvelope<FacultyProfile>>("/faculty", {
      method: "POST",
      body: payload,
    }),
  updateFaculty: (employeeId: string, payload: FacultyProfilePayload) =>
    apiClient<ApiEnvelope<FacultyProfile>>(
      `/faculty/${encodeURIComponent(employeeId)}`,
      { method: "PATCH", body: payload },
    ),
  deleteFaculty: (employeeId: string) =>
    apiClient<ApiEnvelope<FacultyProfile>>(
      `/faculty/${encodeURIComponent(employeeId)}`,
      { method: "DELETE" },
    ),
  myStudentProfile: () => apiClient<ApiEnvelope<Resource>>("/students/me"),
  createMyStudentProfile: (payload: Resource) =>
    apiClient<ApiEnvelope<Resource>>("/students/me", {
      method: "POST",
      body: payload,
    }),
  updateMyStudentProfile: (payload: Resource) =>
    apiClient<ApiEnvelope<Resource>>("/students/me", {
      method: "PATCH",
      body: payload,
    }),
  deleteMyStudentProfile: () =>
    apiClient<ApiEnvelope<Resource>>("/students/me", { method: "DELETE" }),
  updateAdminUser: (id: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(`/user/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),
  updateAdminUserStatus: (id: string, status: AdminUserStatus) =>
    apiClient<ApiEnvelope<Resource>>(`/user/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: { status },
    }),
  deleteAdminUser: (id: string) =>
    apiClient<ApiEnvelope<Resource>>(`/user/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  updateAdminStudent: (studentId: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(
      `/students/${encodeURIComponent(studentId)}`,
      { method: "PATCH", body },
    ),
  deleteAdminStudent: (studentId: string) =>
    apiClient<ApiEnvelope<Resource>>(
      `/students/${encodeURIComponent(studentId)}`,
      { method: "DELETE" },
    ),

  list: (resource: string, query?: ListQuery) =>
    apiClient<ApiEnvelope<unknown>>(`/${resource}${queryString(query)}`),
  get: (resource: string, id: string) =>
    apiClient<ApiEnvelope<Resource>>(`/${resource}/${encodeURIComponent(id)}`),
  create: (resource: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(`/${resource}`, {
      method: "POST",
      body,
    }),
  update: (resource: string, id: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(`/${resource}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),
  remove: (resource: string, id: string) =>
    apiClient<ApiEnvelope<null>>(`/${resource}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  enrollSemester: (programSemesterId: string) =>
    apiClient<ApiEnvelope<Resource>>("/enrollments", {
      method: "POST",
      body: { programSemesterId },
    }),
  attendanceBySemesterCourse: (semesterCourseId: string) =>
    apiClient<ApiEnvelope<unknown>>(
      `/attendance/semester-course/${encodeURIComponent(semesterCourseId)}`,
    ),
  myAttendance: () =>
    apiClient<ApiEnvelope<unknown>>("/attendance/my"),
  recordAttendance: (semesterCourseId: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(
      `/attendance/semester-course/${encodeURIComponent(semesterCourseId)}`,
      {
        method: "POST",
        body: { ...body, semesterCourseId },
      },
    ),
  programSemesters: (programId: string) =>
    apiClient<ApiEnvelope<unknown>>(`/programs/${encodeURIComponent(programId)}/semesters`),
  semesterCourses: (programSemesterId: string) =>
    apiClient<ApiEnvelope<unknown>>(
      `/program-semesters/${encodeURIComponent(programSemesterId)}/courses`,
    ),
  addSemesterCourse: (programSemesterId: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(
      `/program-semesters/${encodeURIComponent(programSemesterId)}/courses`,
      { method: "POST", body },
    ),
  updateSemesterCourse: (id: string, body: Resource) =>
    apiClient<ApiEnvelope<Resource>>(
      `/semester-courses/${encodeURIComponent(id)}`,
      { method: "PATCH", body },
    ),
  deleteSemesterCourse: (id: string) =>
    apiClient<ApiEnvelope<null>>(
      `/semester-courses/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    ),
  facultyCourses: () =>
    apiClient<ApiEnvelope<unknown>>("/faculty/my-courses"),
  publishExamResults: (id: string) =>
    apiClient<ApiEnvelope<Resource>>(
      `/exams/${encodeURIComponent(id)}/publish-results`,
      { method: "POST" },
    ),
  createExam: (body: Resource) =>
    apiClient<ApiEnvelope<Resource>>("/exams", { method: "POST", body }),
  createResult: (body: Resource) =>
    apiClient<ApiEnvelope<Resource>>("/results", { method: "POST", body }),
  publishExam: (id: string) =>
    apiClient<ApiEnvelope<Resource>>(
      `/exams/${encodeURIComponent(id)}/publish`,
      {
        method: "POST",
      },
    ),
  publishResult: (id: string) =>
    apiClient<ApiEnvelope<Resource>>(
      `/results/${encodeURIComponent(id)}/publish`,
      { method: "POST" },
    ),
  markNotificationRead: (id: string) =>
    apiClient<ApiEnvelope<Resource>>(
      `/notifications/${encodeURIComponent(id)}/read`,
      { method: "PATCH" },
    ),
  startPayment: (
    invoiceId: string,
    gateway: "STRIPE" | "BKASH" | "SSLCOMMERZ",
  ) =>
    apiClient<ApiEnvelope<Resource>>("/payments/initiate", {
      method: "POST",
      body: { invoiceId, gateway },
    }),
};

export function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    if ("data" in error && isRecord(error.data)) {
      if (typeof error.data.message === "string") {
        return error.data.message;
      }
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return "The request could not be completed. Please try again.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

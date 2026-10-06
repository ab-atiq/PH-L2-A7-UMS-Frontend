export type UserRole = "ADMIN" | "FACULTY" | "STUDENT";

export type UserStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  studentProfile?: {
    id: string;
    studentId: string;
    programId: string | null;
    departmentId: string | null;
    currentSemesterId: string | null;
  } | null;
  facultyProfile?: {
    id: string;
    employeeId: string;
    departmentId: string | null;
    designation: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

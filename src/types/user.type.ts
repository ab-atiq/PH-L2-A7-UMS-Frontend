export type UserRole = "ADMIN" | "FACULTY" | "STUDENT" | "USER";
export type ApplicationRole = Extract<UserRole, "STUDENT" | "FACULTY">;
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RoleApplication {
  id: string;
  userId: string;
  requestedRole: ApplicationRole;
  status: ApplicationStatus;
  programInterest: string | null;
  departmentInterest: string | null;
  highestQualification: string | null;
  specialization: string | null;
  statement: string;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

interface ProfileRelation {
  id?: string;
  name?: string;
  title?: string;
  code?: string;
}

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
    program?: ProfileRelation | null;
    department?: ProfileRelation | null;
    currentSemester?: ProfileRelation | null;
  } | null;
  facultyProfile?: {
    id: string;
    employeeId: string;
    departmentId: string | null;
    designation: string | null;
    department?: ProfileRelation | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface FacultyProfile {
  id: string;
  employeeId: string;
  designation: string | null;
  specialization: string | null;
  departmentId: string | null;
  userId: string;
  joinDate: string | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<
    User,
    "id" | "email" | "firstName" | "lastName" | "phone" | "avatarUrl" | "status"
  >;
  department: { id: string; name: string; code: string; status: string } | null;
}

export interface AvailableFacultyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: UserStatus;
}

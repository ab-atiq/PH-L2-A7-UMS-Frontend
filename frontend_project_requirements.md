# University Management System — Frontend Requirements

## 1. Overview

A production-quality **Next.js frontend** for the University Management System. The frontend is a pure consumer of the backend REST API under `/api/v1` — it must **never** implement academic or financial business logic locally. It should feel like a state-of-the-art university ERP/SaaS platform, not a generic CRUD dashboard.

### Core Architectural Alignment (Program Curriculum)

The application mirrors the backend's **fixed program curriculum model**:

- Every degree **Program** has a fixed sequence of **ProgramSemester** slots driven by degree type (`BSC` = 8, `MSC` = 4, `PHD` = 6).
- Each semester slot has pre-configured **SemesterCourse** offerings with a single assigned faculty teacher (no multiple sections).
- Progression is strictly **semester-gated**: a student can only enroll in Semester $N$ once Semester $N-1$ has `status = COMPLETED`.
- Enrolling in a semester (`POST /api/v1/semester-enrollments`) automatically enrolls the student into all courses for that semester (`CourseEnrollment`).
- Fees are split into a one-time **Admission Fee** (`InvoiceType.ADMISSION`) and a flat recurring **Semester Tuition Fee** (`InvoiceType.SEMESTER`).

---

## 2. Mandatory Technology Stack

| Concern           | Technology                          | Notes                                                      |
| ----------------- | ----------------------------------- | ---------------------------------------------------------- |
| **Framework**     | Next.js (latest stable), App Router | Server & Client Components                                 |
| **Language**      | TypeScript                          | Strict type safety, shared domain interfaces               |
| **Styling**       | Tailwind CSS                        | Consistent design tokens, dark/light harmonious palette    |
| **Components**    | shadcn/ui                           | Radix primitives, highly accessible                        |
| **Forms**         | TanStack Form + Zod                 | Field-level validation mapped to backend errors            |
| **Server State**  | TanStack Query (v5)                 | Cache, query keys, mutations, optimistic UI where safe     |
| **HTTP Client**   | ofetch                              | Standardized request wrapper matching `/api/v1` envelope   |
| **Icons**         | Lucide React                        | Consistent semantic iconography                            |
| **Notifications** | Base UI / Sonner Toast              | Toast feedback for API outcomes                            |
| **Charts**        | Recharts / Tremor                   | Render metrics only when backend provides real series data |

Design tone: clean, modern, high-density academic ERP SaaS dashboard. Desktop-first, fully responsive.

---

## 3. Roles & Permissions

`USER`, `STUDENT`, `FACULTY`, `ADMIN`

- Navigation, sidebar items, and action buttons render dynamically based on the authenticated user's active role.
- `USER` represents a newly registered/verified account awaiting academic role profile setup (or application approval).
- Unauthorized actions are hidden from the UI to improve UX.
- **Frontend role gating is UX convenience only** — the backend API remains the authoritative source of truth for authorization.

---

## 4. Global UX & Visual Principles

- **Layout Structure**: Collapsible responsive sidebar, sticky topbar with breadcrumbs, notification bell, and user profile avatar menu.
- **Standard Views**: Search bar, multi-attribute filter dropdowns, sort headers, and server-side pagination controls on all data lists.
- **Feedback Loops**: Loading skeletons, empty states with clear CTAs, error boundaries with retry buttons, confirmation dialogs for destructive actions.
- **Status Badges**: Standard color-coded badges for all domain statuses (`ACTIVE`, `PENDING`, `COMPLETED`, `IN_PROGRESS`, `DROPPED`, `PAID`, `FAILED`, `PUBLISHED`, `DRAFT`).
- **Typography & Color**: Curated academic palette (slate/indigo/neutral), accessible contrast ratios, and clear typographic hierarchy.

---

## 5. Public & Authentication Pages

```
/                       Landing page (university branding, metrics, CTAs)
/login                  Multi-role login (Student, Faculty, Admin)
/register               Candidate self-registration
/verify-email           Email OTP verification
/forgot-password        Request password reset OTP
/reset-password         Submit new password with OTP
/auth/google/callback   OAuth redirect handler
```

---

## 6. Authenticated Shell & Role Dashboard Entry

Root authenticated entry: `/dashboard`. Content, statistics, and quick actions adapt dynamically according to the authenticated role:

### 6.1 New Account State (`USER`)

- For verified accounts without an attached student or faculty profile.
- Displays onboarding card: program selection and student profile submission or faculty affiliation status.

---

## 7. Student Navigation & Page Flows

```
Dashboard · My Curriculum · Semester Enrollment · My Courses · Class Schedule
Attendance · Exams · Results · Official Transcript · Fees & Payments · Notifications
```

### 7.1 Student Flows

#### A — Student Dashboard (`/dashboard`)

- **Key Metrics**: Current Program & Semester (e.g., "B.Sc. in CSE — Semester 2 of 8"), Cumulative GPA (CGPA), Total Credits Earned, Attendance %, Outstanding Fees.
- **Quick Actions**: "Enroll in Semester", "View Transcript", "Pay Tuition Fee", "View Published Results".
- **Recent Feeds**: Latest exam schedules, published results, fee due notices.

#### B — My Curriculum (`/curriculum`)

- View the entire degree roadmap: displays all numbered semesters (1 to 8/4/6) and the assigned courses for each semester slot.
- Visual status indicators per semester:
  - ✅ `COMPLETED` (with achieved Semester GPA)
  - 🔄 `IN_PROGRESS` (Current active semester)
  - 🔒 `LOCKED` (Upcoming semesters, locked until prior semester completes)

#### C — Semester Enrollment (`/semester-enrollment`)

- Active enrollment action center:
  - If Semester 1: requires Admission Fee (`type: ADMISSION`) to be `PAID`. Shows warning banner with direct "Pay Admission Fee" button if unpaid.
  - If Semester $N > 1$: verifies Semester $N-1$ is `COMPLETED`. Shows locking indicator if previous semester results are pending.
  - Clicking **"Enroll in Semester"** opens confirmation modal showing all semester courses that will be registered automatically.
  - On success, displays confirmation toast and auto-redirects to **My Courses**.

#### D — My Courses (`/my-courses`)

- Lists courses for the active semester with teacher name, credits, and status (`ENROLLED` or `DROPPED`).
- Actions:
  - **"Course Details"** → `/courses/:id`
  - **"Drop Course"** → Triggers confirmation dialog explaining academic implications (`DELETE /api/v1/course-enrollments/:id`). Dropped courses display a `DROPPED` badge.

#### E — Attendance (`/attendance`)

- Read-only attendance dashboard.
- Filter by enrolled course: shows attendance percentage bar, total classes, count of Present / Late / Absent / Excused sessions, and class date history.

#### F — Exams (`/exams`)

- Filter by current semester courses.
- Tabs: **Upcoming Exams** (exam type, scheduled date, total marks, weightage) and **Completed Exams**.

#### G — Results (`/results`)

- Displays **published results only** (draft marks are never exposed to students).
- Detailed grade breakdown per exam and overall course grade (`Grade`), grade point (`gradePoint`), and credits.

#### H — Official Transcript (`/transcript`)

- Comprehensive academic history grouped by `ProgramSemester`.
- Displays course codes, titles, credits, letter grades, semester GPAs, total credits earned, and overall Cumulative GPA (CGPA).
- Action: **"Print / Download Transcript"** (styled print view).

#### I — Fees & Invoices (`/fees` or `/invoices`)

- Tabs: **Pending Invoices** · **Paid History**.
- Displays invoice number, type badge (`ADMISSION` vs `SEMESTER`), description, amount (৳), due date, and payment status.
- **Payment Flow**:
  - Click **"Pay Now"** → Select gateway (Stripe, bKash, SSLCommerz).
  - Calls `POST /api/v1/payments/initiate` → receives gateway redirect URL or modal.
  - Redirects to provider checkout → on return, displays payment status result page.
  - **Hard constraint**: The frontend _never_ marks an invoice paid locally; it polls or waits for backend confirmation.

---

## 8. Faculty Navigation & Page Flows

```
Dashboard · Assigned Courses · Class Attendance · Exams & Tests · Grade Entry · Schedule
```

### 8.1 Faculty Flows

#### A — Faculty Dashboard (`/dashboard`)

- Metrics: Assigned Semester Courses, Total Enrolled Students, Today's Classes, Pending Marks to Submit.
- Quick links to take today's attendance and grade recent exams.

#### B — Assigned Courses (`/faculty/courses` → `/faculty/courses/:semesterCourseId`)

- Lists courses assigned to the faculty member (`GET /api/v1/faculty/my-courses`).
- Detail view shows Program, Semester, enrolled student roster, course syllabus, and links to: **Take Attendance**, **Manage Exams**, **Enter Marks**.

#### C — Attendance Marking (`/faculty/courses/:semesterCourseId/attendance`)

- Class date selector (defaults to today).
- Table of enrolled students with quick toggles: **Present**, **Late**, **Absent**, **Excused** (with "Mark All Present" convenience button).
- Optional remarks field.
- Prevents duplicate submission for the same date with clear UI feedback.

#### D — Exam Management (`/faculty/exams`)

- Create Exam Form: selects assigned course, `examType` (Quiz, Midterm, Final, Assignment, Project), date, total marks, weightage.
- Exam list with status: `DRAFT`, `PUBLISHED`, `COMPLETED`.

#### E — Results & Marks Entry (`/faculty/results`)

- Selects exam → loads student roster.
- Real-time mark input with client-side boundary validation: $0 \le \text{marksObtained} \le \text{totalMarks}$.
- Auto-displays calculated letter grade (`A`, `A+`, `B`, etc.) and grade point.
- Saves marks as `DRAFT` or submits to Admin for publication.

---

## 9. Admin Navigation & Page Flows

```
Dashboard · Users · Students · Faculty · Departments · Programs · Courses
Curriculum Builder · Semester Progressions · Invoices · Payments · Audit Logs · Settings
```

### 9.1 Admin Flows

#### A — Admin Dashboard (`/admin/dashboard`)

- University-wide statistics: total active students, faculty count, departments, programs, semester enrollments, total revenue, pending invoices.
- Filterable revenue and enrollment distribution charts.

#### B — User Directory & Moderation (`/admin/users`)

- Complete user table with search, role filter (`STUDENT`, `FACULTY`, `ADMIN`), status filter (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`).
- Actions: View profile details, **Suspend / Activate Account** modal (`PATCH /api/v1/admin/users/:id/status`).

#### C — Student Management (`/admin/students`)

- Student directory by Student ID, name, department, program, batch year.
- "Create Student Profile" modal linking verified `USER` accounts with their academic degree program.

#### D — Faculty Management (`/admin/faculty`)

- Faculty directory with search (`/faculty?search=`) and filter by designation/department (`/faculty/filter`).
- "Create Faculty Member" modal: links `FACULTY` user with employee ID, designation, and department.

#### E — Academic Departments (`/admin/departments`)

- Full CRUD: Create, View, Edit, Soft-Delete academic departments (`CSE`, `EEE`, `BBA`).

#### F — Degree Programs (`/admin/programs`)

- Program table: Degree Type (`BSC`, `MSC`, `PHD`), Duration, Total Semesters, Total Credits, Admission Fee, Semester Tuition Fee.
- Creating a program automatically creates its sequence of `ProgramSemester` slots.
- "View Curriculum" drawer linking directly to semester curriculum slots.

#### G — Course Catalog (`/admin/courses`)

- Global course catalog CRUD (`courseCode`, `title`, `credits`, `department`). Searchable and filterable.

#### H — Curriculum Builder (`/admin/curriculum`)

- **Interactive Visual Curriculum Builder**:
  - Select Program → displays all numbered semester slots (Semester 1 to 8/4/6).
  - Under each semester slot: shows placed courses and assigned teacher.
  - Action **"Add Course to Semester"**: select catalog course and assign faculty teacher (`POST /api/v1/program-semesters/:id/courses`).
  - Action **"Reassign Teacher"**: update faculty assignment on existing semester course.
  - Action **"Remove Course"**: remove course from semester slot.

#### I — Semester Progressions & Grade Publication (`/admin/progressions`)

- Review student semester enrollments.
- Review submitted exam marks and execute **"Publish Results"** (`POST /api/v1/exams/:id/publish-results`).
- Execute **"Mark Semester Completed"** (`POST /api/v1/semester-enrollments/:id/complete`): triggers semester GPA calculation and unlocks the next semester for eligible students.

#### J — Invoices & Finance (`/admin/invoices`)

- Manage both `ADMISSION` and `SEMESTER` invoices.
- Filter by status (`PENDING`, `PAID`, `OVERDUE`, `CANCELLED`) and type.
- Form to manually create special invoices or inspect payment attempts.

#### K — Payment Transactions (`/admin/payments`)

- Live gateway payment transaction ledger: transaction ID, invoice reference, student, amount, gateway (Stripe/bKash/SSLCommerz), status (`SUCCESS`, `PENDING`, `FAILED`).

#### L — System Audit Logs (`/admin/audit-logs`)

- Filterable and searchable audit trail: Actor, Action type (`ASSIGN_TEACHER`, `ENROLL`, `DROP_ENROLLMENT`, `PUBLISH_RESULT`, etc.), Entity, Entity ID, timestamp.

---

## 10. Clean Architecture & Next.js Folder Structure

Preserves the project's existing structure under `src/` without introducing breaking URL changes:

```
src/
├── app/
│   ├── (public)/
│   │   ├── (marketing)/
│   │   │   └── page.tsx                     # Landing page
│   │   └── (authentication)/
│   │       ├── login/page.tsx
│   │       ├── register/page.tsx
│   │       ├── verify-email/page.tsx
│   │       ├── forgot-password/page.tsx
│   │       └── reset-password/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx                       # Shared dashboard shell (Sidebar, Topbar)
│       ├── dashboard/page.tsx               # Dynamic role-based dashboard
│       ├── curriculum/page.tsx              # Student degree roadmap & semester slots
│       ├── semester-enrollment/page.tsx     # Student semester registration
│       ├── my-courses/page.tsx              # Student course list & drop
│       ├── attendance/page.tsx              # Student attendance view
│       ├── exams/page.tsx                   # Student exams view
│       ├── results/page.tsx                 # Student published results
│       ├── transcript/page.tsx              # Student official transcript
│       ├── fees/page.tsx                    # Student invoices & gateway checkout
│       ├── faculty/
│       │   ├── courses/page.tsx             # Faculty assigned courses
│       │   ├── attendance/page.tsx          # Faculty attendance entry
│       │   ├── exams/page.tsx               # Faculty exam manager
│       │   └── results/page.tsx             # Faculty marks entry
│       ├── admin/
│       │   ├── users/page.tsx               # User management
│       │   ├── students/page.tsx            # Student profile directory
│       │   ├── faculty/page.tsx             # Faculty directory & filter
│       │   ├── departments/page.tsx         # Departments CRUD
│       │   ├── programs/page.tsx            # Programs CRUD
│       │   ├── courses/page.tsx             # Course catalog CRUD
│       │   ├── curriculum/page.tsx          # Visual curriculum builder
│       │   ├── progressions/page.tsx        # Exam publication & semester completion
│       │   ├── invoices/page.tsx            # Invoices overview
│       │   ├── payments/page.tsx            # Payment transactions ledger
│       │   └── audit-logs/page.tsx          # System audit logs
│       └── workspace/[resource]/page.tsx    # Generic resource detail fallback
├── api/
│   ├── auth.api.ts                          # Login, register, OTP, refresh
│   ├── user.api.ts                          # Profile, avatar upload
│   ├── student.api.ts                       # Student profiles & enrollment history
│   ├── faculty.api.ts                       # Faculty profiles, assigned courses
│   ├── academic.api.ts                      # Departments, programs, course catalog
│   ├── curriculum.api.ts                    # ProgramSemester & SemesterCourse APIs
│   ├── enrollment.api.ts                    # Semester & Course enrollment actions
│   ├── attendance.api.ts                    # Bulk attendance & student attendance
│   ├── exam.api.ts                          # Exams CRUD & results
│   ├── finance.api.ts                       # Invoices & payment gateway initiation
│   ├── admin.api.ts                         # Dashboard stats, user moderation
│   └── audit.api.ts                         # Audit logs
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── Breadcrumbs.tsx
│   ├── ui/                                  # shadcn/ui primitives
│   ├── shared/
│   │   ├── DataTable.tsx                    # Reusable server-paginated data table
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── student/
│   │   ├── CurriculumRoadmap.tsx
│   │   ├── SemesterEnrollmentModal.tsx
│   │   └── TranscriptView.tsx
│   ├── faculty/
│   │   ├── AttendanceGrid.tsx
│   │   └── MarksEntryTable.tsx
│   ├── admin/
│   │   ├── CurriculumBuilderSlot.tsx
│   │   └── ResultPublicationModal.tsx
│   └── finance/
│       └── GatewayPaymentModal.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCurriculum.ts
│   ├── useEnrollment.ts
│   ├── useAttendance.ts
│   └── useFinance.ts
├── lib/
│   ├── apiClient.ts                         # Configured ofetch instance with auth headers
│   └── formatters.ts                        # Currency (BDT ৳), date, GPA formatting
└── types/
    └── api.types.ts                         # Shared backend response interfaces
```

---

## 11. API Integration & Error Envelope Handling

The client-side `apiClient.ts` wrapper unwraps the backend envelope:

- **Success Format**: extracts `res.data` and pagination `res.meta`.
- **Error Handling**: maps backend `errorSources` (path + message) directly into TanStack Form field errors and displays a clear Sonner toast for general error messages.
- **Token Refresh**: intercepts `401 Unauthorized` responses and automatically attempts `POST /api/v1/auth/refresh-token`. If refresh fails, redirects smoothly to `/login`.

---

## 12. Frontend State & Edge Cases to Handle

1. **Previous Semester Not Completed**: When attempting to enroll in Semester $N$, disable the action button and display a clear alert badge: _"Semester $N-1$ must be COMPLETED before enrolling."_
2. **Admission Fee Unpaid**: Disable Semester 1 enrollment with a CTA: _"Please pay the one-time admission fee to unlock Semester 1."_
3. **Dropped Course Display**: Courses with `EnrollmentStatus.DROPPED` must clearly display a badge and excluded status from ongoing attendance or GPA calculations.
4. **Draft vs Published Results**: Students must never see empty placeholders for unpublished marks; show a clean badge: _"Grading in progress"_.
5. **Payment Failure**: When a gateway webhook returns `PaymentStatus.FAILED`, display a prominent notice on the invoice card with an easy **"Retry Payment"** action.
6. **Concurrent Duplicate Attendance**: If a faculty member submits attendance for an already recorded date, gracefully surface the backend's duplicate constraint error.

---

## 13. Hard Constraints

- **Never calculate GPA or CGPA on the frontend**: Always consume the backend's computed `semesterGpa` and transcript response.
- **Never mark payments successful in client code**: A payment is only successful when reflected by backend status `SUCCESS` after webhook verification.
- **No client-side prerequisite verification**: Progression rules are enforced by the backend's semester-gating logic.
- **Strictly mirror backend terminology**: Use `ProgramSemester`, `SemesterCourse`, `SemesterEnrollment`, `CourseEnrollment`, `InvoiceType.ADMISSION`, `InvoiceType.SEMESTER`.

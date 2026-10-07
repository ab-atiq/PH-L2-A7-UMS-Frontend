# University Management System — Frontend Requirements

## 1. Overview

A production-quality **Next.js frontend** for the University Management System. The frontend is a pure consumer of the backend REST API under `/api/v1` — it must **never** implement business logic locally. It should feel like a real university ERP/SaaS product, not a generic CRUD dashboard.

---

## 2. Mandatory Technology Stack

| Concern | Technology |
|---|---|
| Framework | Next.js (latest stable), App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Forms | TanStack Form + Zod (use the existing project dependencies) |
| Server State | TanStack Query |
| HTTP Client | ofetch |
| Icons | Lucide React |
| Charts | Do not fabricate charts; use visualizations only when the backend supplies series data |
| Notifications | Existing Base UI toast components |

Design: clean, modern university SaaS dashboard. Desktop-first, fully responsive.

---

## 3. Roles

`USER`, `STUDENT`, `FACULTY`, `ADMIN`

- Navigation and actions render dynamically based on the authenticated user's role.
- `USER` is a verified account without an academic role; the user dashboard lets
  the account submit one student or faculty role application and view its status.
- Unauthorized actions are never shown.
- **Frontend role hiding is not security** — the backend API remains the source of truth for authorization. All UI gating is a UX convenience only.

---

## 4. Global UX Principles

Build with consistent design tokens across the app:

- Clean dashboard layout, responsive sidebar, top navigation, breadcrumbs
- Search, filters, pagination on all list views
- Tables, cards, empty states, loading skeletons, error states
- Confirmation dialogs, toast notifications, inline form validation
- Modal/drawer patterns where appropriate
- Status badges, responsive mobile navigation
- Professional academic color palette — avoid excessive gradients
- Highly readable typography

---

## 5. Public Pages

```
/                       Landing page
/login
/register
/forgot-password
/reset-password
/auth/google/callback
```

Landing page includes: university branding, login/register CTAs, Google login, feature overview, academic statistics, contact/footer.

---

## 6. Authenticated Application

Root authenticated route: `/dashboard`. Content adapts entirely by role.

### 6.1 New Account and Role Application

- Email registration and first-time Google sign-in create an active `USER`.
- The `USER` dashboard offers an application for either `STUDENT` or `FACULTY`.
- Student applications require a program of interest and a personal statement.
- Faculty applications require a department, highest qualification, and a
  personal statement; specialization is optional.
- Each account can submit one role application. The application is persisted by
  `POST /api/v1/applications` and status is read from
  `GET /api/v1/applications/me`.
- Submission is not role activation. Users remain `USER` until an authorized
  university process changes their role and creates the academic profile.

---

## 7. Student Navigation

```
Dashboard · My Profile · Course Catalog · Course Registration · My Courses
Class Schedule · Attendance · Exams · Results · Transcript
Fees & Payments · Notifications · Settings
```

### 7.1 Student Page Flows

**A — Dashboard** (`/dashboard`)
Current semester, registered courses, total credits, current GPA, attendance %, upcoming exams, outstanding fees, recent notifications.
Quick actions: Register Course · View Schedule · View Results · Pay Fees.

**B — Course Registration** (`/course-registration`)
Current semester course cards/table: code, name, credit, prerequisites, available seats, faculty, schedule, status.
- `View Course` → `/courses/:id`
- `Register` → confirmation modal → enrollment confirmation on success
- Before registering, clearly show: ✓ Prerequisite satisfied · ✓ Credit limit available · ✓ Seat available · ✓ Registration period active
- On failure, surface the **exact backend error message**.

**C — My Courses** (`/my-courses`)
Tabs: Current · Completed · Dropped. Per-course: code, title, credits, faculty, schedule, attendance, result.

**D — Attendance** (`/attendance`)
Overall + course-wise attendance (present/absent/percentage), charted.

**E — Exams** (`/exams`)
Tabs: Upcoming · Completed. Per-exam: course, exam type, date, time, total marks, status.

**F — Results** (`/results`)
Semester results table: course, credits, marks, grade, grade point. Summary: semester GPA, cumulative GPA, completed credits.

**G — Transcript** (`/transcript`)
Grouped by semester: course, credits, grade, grade point, plus semester GPA and cumulative GPA. Includes Download/Print Transcript.

**H — Fees** (`/fees`)
Outstanding, paid, and history views. Invoice: number, description, amount, due date, status, Pay button.
Payment flow: Invoice → Pay → Payment gateway → Success/Failure → return to payment result page.
**Never mark a payment successful from the frontend** — always wait for backend verification.

---

## 8. Faculty Navigation

```
Dashboard · My Profile · My Courses · Students · Attendance
Exams · Results · Schedule · Notifications · Settings
```

### 8.1 Faculty Page Flows

**A — Dashboard**
Assigned courses, total students, today's classes, upcoming exams, pending results.

**B — My Courses** (`/faculty/courses` → `/faculty/courses/:sectionId`)
Course cards; detail page shows course, semester, schedule, room, student count, with actions: Attendance · Students · Exams · Results.

**C — Attendance** (`/faculty/courses/:sectionId/attendance`)
Select date → student table (ID, name, status) → mark Present/Absent → Save. Duplicate attendance prevented via backend validation, surfaced clearly in UI.

**D — Exams** (`/faculty/exams`)
Create Exam form: course, exam type, date, time, total marks. After creation → exam details → Enter Marks.

**E — Results** (`/faculty/results`)
Select exam → student table (ID, marks, grade, grade point) → enter marks with validation `0 <= marks <= totalMarks` → confirmation step before submit/publish.

---

## 9. Admin Navigation

```
Dashboard · Users · Students · Faculty · Departments · Programs
Courses · Prerequisites · Semesters · Sections · Enrollments
Invoices · Payments · Reports · Audit Logs · Notifications · Settings
```

### 9.1 Admin Page Flows

**A — Dashboard**
Analytics: total students, total faculty, departments, programs, active courses, current semester, total revenue, pending payments.
Charts: student growth, enrollment statistics, revenue, course distribution.

**B — User Management** (`/admin/users`)
Table: name, email, role, status, created, actions (View, Change status). Never expose passwords.

**C — Departments** (`/admin/departments`)
Full CRUD. List: name, code, programs, courses, status.

**D — Programs** (`/admin/programs`)
Full CRUD. Fields: name, code, department, duration, total credits, status.

**E — Courses** (`/admin/courses`)
Full CRUD. Fields: code, title, description, credit, department, status. Detail view includes prerequisites.

**F — Semesters** (`/admin/semesters`)
Create form: name, start date, end date, registration start, registration end, status. Only one semester is CURRENT per backend business rules (frontend reflects, never enforces, this).

**G — Sections** (`/admin/sections`)
Create form: course, semester, section name, capacity, schedule, room → then Assign Faculty.

**H — Invoices** (`/admin/invoices`)
Create form: student, description, amount, due date. Track status: Pending · Paid · Cancelled.

**I — Payments** (`/admin/payments`)
Table: transaction ID, student, invoice, amount, gateway, status, date. Filter: Success · Pending · Failed · Cancelled.

**J — Audit Logs** (`/admin/audit-logs`)
Table: actor, action, entity, entity ID, timestamp. Supports search, filter, pagination.

---

## 10. Routing Structure

Keep the existing project layout under `src/`; do not reorganize it into new
`app/(student)`, `app/(faculty)`, or `app/(admin)` route groups. Route groups
remain organizational and do not add URL segments.

```
src/
  app/
    (public)/
      (marketing)/
        faculty-directory/
      (authentication)/
        faculty-access/
    (dashboard)/
      dashboard/
        enrollments/
      faculty/
        schedules/
      admin/
        faculty-approvals/
      workspace/[resource]/
  api/
  assets/
  components/
    auth/
    dashboard/
    form/
    layout/public/
    university/
      enrollments/
      faculty-approvals/
      faculty-directory/
      teaching-schedules/
    ui/
  hooks/
  lib/
  providers/
  routes/
  types/
  utils/
  validation/
```

Role-specific navigation stays in `src/routes/`; authenticated resource pages
use `/workspace/[resource]` and reusable dashboard components.

---

## 11. API Integration Layer

```
src/
  api/
    auth.api.ts
    application.api.ts
    university.api.ts
  lib/
    apiClient.ts
  hooks/
    auth.hook.ts
    application hooks in university.hook.ts
    university.hook.ts
```

- TanStack Query handles server state, caching, refetching, and mutations.
- Optimistic updates only where genuinely safe (no financial/academic-record ambiguity).
- No business logic inside UI components — API modules and hooks own that boundary.

---

## 12. Authentication Architecture

- Login, Register, Google login, Logout, Refresh token
- Protected route groups + role-based route protection using the existing auth guards
- API requests send credentialed HTTP-only cookies
- Current identity endpoint: `GET /api/v1/user/me` (`/api/v1/auth/me` is not mounted)
- `USER` accounts may read and update their own `/api/v1/user/me` profile.
- Role applications are submitted and fetched through
  `/api/v1/applications` and `/api/v1/applications/me`.
- The backend remains authoritative for authentication and authorization

---

## 13. Forms

Use the existing TanStack Form / Zod dependencies and form components, with:
- Field-level validation
- Backend validation error surfacing (mapped from API error envelope)
- Loading state and disabled submit while in-flight
- Success and error toast notifications

---

## 14. Data Tables

Reusable `DataTable` component supporting: search, filtering, sorting, pagination, loading state, empty state, row actions.

---

## 15. Core Reusable Components

```
AppSidebar          Topbar              Breadcrumbs
PageHeader          StatCard            DataTable
SearchInput         FilterDropdown      Pagination
StatusBadge         ConfirmDialog       LoadingSkeleton
EmptyState          ErrorState          FormField
DatePicker          Select              Modal
Drawer              NotificationBell    ProfileMenu
```

---

## 16. Design System

- 8px spacing system
- Cards with subtle borders, consistent border radius
- Readable typography with clear hierarchy
- Accessible contrast, keyboard navigation, visible focus states
- Consistent icon usage (Lucide)
- Minimal, uncluttered UI

---

## 17. Responsive Strategy

| Breakpoint | Behavior |
|---|---|
| Desktop | Sidebar + content |
| Tablet | Collapsible sidebar |
| Mobile | Bottom/slide navigation where appropriate |

Tables degrade to horizontal scroll or responsive cards. Content must never overflow badly at any breakpoint.

---

## 18. UX Edge Cases to Handle

Every state below needs a clear message and a meaningful next action:

- No courses available
- Course already registered
- Prerequisite missing
- Credit limit exceeded
- Section full
- Registration closed
- No attendance recorded
- No exam scheduled
- Result not published
- Invoice already paid
- Payment failed
- Network error
- Unauthorized
- Session expired
- Server error
- Empty search results

---

## 19. Hard Constraints

- Mirror backend domain terminology exactly — do not invent different names for entities/states.
- Keep the four backend roles exactly: USER / STUDENT / FACULTY / ADMIN.
- Do not create fake or optimistic payment success states.
- Do not bypass or duplicate backend authorization logic.
- Do not calculate business-critical academic or payment rules (GPA, prerequisites, credit limits, payment status) on the frontend — always defer to backend responses.

---

## 20. Delivery Plan

Implement incrementally in the existing frontend structure, prioritizing a
cohesive, API-connected university experience. Do not fabricate analytics or
payment states when the backend does not return the corresponding data.

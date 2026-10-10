"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LoaderCircle,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  cloneElement,
  type FormEvent,
  type ReactElement,
  useState,
} from "react";
import {
  type AdminUserStatus,
  getApiErrorMessage,
  type Resource,
  universityApi,
} from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useUniversityList } from "@/hooks";

const statuses: AdminUserStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
];

function isRecord(value: unknown): value is Resource {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordsFrom(value: unknown): Resource[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  for (const key of ["items", "results", "records", "data"]) {
    if (Array.isArray(value[key])) return value[key].filter(isRecord);
  }
  return [];
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (isRecord(value)) {
    for (const key of ["name", "title", "code", "email"]) {
      if (typeof value[key] === "string") return value[key];
    }
  }
  return "Details available";
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}

function StudentEditor({
  student,
  departments,
  programs,
  semesters,
  saving,
  onClose,
  onSubmit,
}: {
  student: Resource;
  departments: Resource[];
  programs: Resource[];
  semesters: Resource[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: Resource) => void;
}) {
  const user = isRecord(student.user) ? student.user : {};
  const [studentId, setStudentId] = useState(text(student.studentId));
  const [firstName, setFirstName] = useState(text(user.firstName));
  const [lastName, setLastName] = useState(text(user.lastName));
  const [phone, setPhone] = useState(text(user.phone));
  const [gender, setGender] = useState(text(student.gender));
  const [dateOfBirth, setDateOfBirth] = useState(
    text(student.dateOfBirth).slice(0, 10),
  );
  const [address, setAddress] = useState(text(student.address));
  const [guardianName, setGuardianName] = useState(text(student.guardianName));
  const [guardianPhone, setGuardianPhone] = useState(
    text(student.guardianPhone),
  );
  const [batchYear, setBatchYear] = useState(text(student.batchYear));
  const [admissionDate, setAdmissionDate] = useState(
    text(student.admissionDate).slice(0, 10),
  );
  const [departmentId, setDepartmentId] = useState(text(student.departmentId));
  const [programId, setProgramId] = useState(text(student.programId));
  const [currentProgramSemesterId, setCurrentProgramSemesterId] = useState(
    text(student.currentProgramSemesterId),
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      studentId: studentId.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      address: address.trim() || null,
      guardianName: guardianName.trim() || null,
      guardianPhone: guardianPhone.trim() || null,
      batchYear: batchYear ? Number(batchYear) : null,
      admissionDate: admissionDate || null,
      departmentId: departmentId || null,
      programId: programId || null,
      currentProgramSemesterId: currentProgramSemesterId || null,
    });
  };

  const activePrograms = programs.filter(
    (program) => !departmentId || program.departmentId === departmentId,
  );
  const activeSemesters = semesters.filter(
    (semester) => !programId || semester.programId === programId,
  );
  return (
    <Modal title="Edit student record" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Student ID">
          <Input
            required
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          />
        </Field>
        <Field label="Batch year">
          <Input
            type="number"
            min={1900}
            max={2100}
            value={batchYear}
            onChange={(event) => setBatchYear(event.target.value)}
          />
        </Field>
        <Field label="First name">
          <Input
            required
            minLength={2}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </Field>
        <Field label="Last name">
          <Input
            required
            minLength={2}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </Field>
        <Field label="Email">
          <Input disabled value={text(user.email)} />
        </Field>
        <Field label="Phone">
          <Input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </Field>
        <Field label="Gender">
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Not specified</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Date of birth">
          <Input
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </Field>
        <Field label="Admission date">
          <Input
            type="date"
            value={admissionDate}
            onChange={(event) => setAdmissionDate(event.target.value)}
          />
        </Field>
        <Field label="Department">
          <select
            value={departmentId}
            onChange={(event) => {
              setDepartmentId(event.target.value);
              setProgramId("");
            }}
            className="h-10 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {departments.map((department) => (
              <option key={text(department.id)} value={text(department.id)}>
                {display(department.name)} ({display(department.code)})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Program">
          <select
            value={programId}
            onChange={(event) => setProgramId(event.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {activePrograms.map((program) => (
              <option key={text(program.id)} value={text(program.id)}>
                {display(program.name)} ({display(program.code)})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Current program semester">
          <select
            value={currentProgramSemesterId}
            onChange={(event) =>
              setCurrentProgramSemesterId(event.target.value)
            }
            className="h-10 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {activeSemesters.map((semester) => (
              <option key={text(semester.id)} value={text(semester.id)}>
                {display(semester.name)} · {display(semester.program)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Address">
          <Input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </Field>
        <Field label="Guardian name">
          <Input
            value={guardianName}
            onChange={(event) => setGuardianName(event.target.value)}
          />
        </Field>
        <Field label="Guardian phone">
          <Input
            value={guardianPhone}
            onChange={(event) => setGuardianPhone(event.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ id?: string }>;
}) {
  const id = `student-field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}

export default function StudentManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [currentProgramSemesterId, setCurrentProgramSemesterId] = useState("");
  const [status, setStatus] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const params = {
    page,
    limit: 12,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(departmentId ? { departmentId } : {}),
    ...(programId ? { programId } : {}),
    ...(currentProgramSemesterId ? { currentProgramSemesterId } : {}),
    ...(status ? { status } : {}),
    ...(includeDeleted ? { includeDeleted: "true" } : {}),
  };
  const studentsQuery = useQuery({
    queryKey: ["admin", "students", params],
    queryFn: () => universityApi.list("students", params),
  });
  const detailQuery = useQuery({
    queryKey: ["admin", "student", selectedStudentId],
    queryFn: () => universityApi.get("students", selectedStudentId),
    enabled: Boolean(selectedStudentId),
  });
  const departmentsQuery = useUniversityList("departments", { limit: 100 });
  const programsQuery = useUniversityList("programs", { limit: 100 });
  const semestersQuery = useUniversityList("semesters", { limit: 100 });
  const departments = recordsFrom(departmentsQuery.data?.data);
  const programs = recordsFrom(programsQuery.data?.data);
  const semesters = recordsFrom(semestersQuery.data?.data);
  const rows = recordsFrom(studentsQuery.data?.data);
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Resource }) =>
      universityApi.updateAdminStudent(id, body),
    onSuccess: async () => {
      await refresh();
      setEditing(null);
      toast.add({
        title: "Student updated",
        description: "The student profile was saved.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not update student",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const deleteMutation = useMutation({
    mutationFn: universityApi.deleteAdminStudent,
    onSuccess: async () => {
      await refresh();
      setDeleteTarget(null);
      toast.add({
        title: "Student profile deleted",
        description:
          "The profile was soft-deleted; the user account and history were preserved.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not delete student profile",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status: nextStatus,
    }: {
      id: string;
      status: AdminUserStatus;
    }) => universityApi.updateAdminUserStatus(id, nextStatus),
    onSuccess: async () => {
      await refresh();
      toast.add({
        title: "Student account updated",
        description: "Account access status changed.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not change account status",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const nameOf = (student: Resource) => {
    const user = isRecord(student.user) ? student.user : {};
    return (
      `${text(user.firstName)} ${text(user.lastName)}`.trim() ||
      "Unknown student"
    );
  };
  const studentIdOf = (student: Resource) => text(student.studentId);
  const filterChanged = () => setPage(1);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium text-primary">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Student records
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search, review, edit, suspend, and remove student profiles while
            preserving account history.
          </p>
        </header>
        <Card>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                id="admin-students-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  filterChanged();
                }}
                placeholder="Search student, email, ID"
                aria-label="Search students"
              />
            </div>
            <select
              aria-label="Filter by department"
              value={departmentId}
              onChange={(event) => {
                setDepartmentId(event.target.value);
                setProgramId("");
                filterChanged();
              }}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All departments</option>
              {departments.map((item) => (
                <option key={text(item.id)} value={text(item.id)}>
                  {display(item.name)}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by program"
              value={programId}
              onChange={(event) => {
                setProgramId(event.target.value);
                filterChanged();
              }}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All programs</option>
              {programs
                .filter(
                  (item) => !departmentId || item.departmentId === departmentId,
                )
                .map((item) => (
                  <option key={text(item.id)} value={text(item.id)}>
                    {display(item.name)}
                  </option>
                ))}
            </select>
            <select
              aria-label="Filter by program semester"
              value={currentProgramSemesterId}
              onChange={(event) => {
                setCurrentProgramSemesterId(event.target.value);
                filterChanged();
              }}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All semesters</option>
              {semesters.map((item) => (
                <option key={text(item.id)} value={text(item.id)}>
                  {display(item.name)}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by account status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                filterChanged();
              }}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All account statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm xl:col-span-5">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(event) => {
                  setIncludeDeleted(event.target.checked);
                  filterChanged();
                }}
              />
              Include deleted student profiles
            </label>
          </CardContent>
        </Card>
        {studentsQuery.isPending ? (
          <Card>
            <CardContent className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading student records…
            </CardContent>
          </Card>
        ) : studentsQuery.isError ? (
          <Card>
            <CardContent className="space-y-3 p-6 text-sm text-destructive">
              Could not load students: {getApiErrorMessage(studentsQuery.error)}
              <div>
                <Button
                  variant="outline"
                  onClick={() => void studentsQuery.refetch()}
                >
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
              <UserRound className="size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No matching student records</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {rows.map((student) => {
              const user = isRecord(student.user) ? student.user : {};
              const userId = text(student.userId);
              const deleted = Boolean(student.deletedAt);
              const accountStatus = text(user.status);
              const avatar = text(user.avatarUrl);
              const name = nameOf(student);
              return (
                <Card key={studentIdOf(student)}>
                  <CardContent className="flex gap-4 p-5">
                    <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={`${name} profile`}
                          fill
                          sizes="56px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="font-semibold">{name}</h2>
                          <p className="break-all text-sm text-muted-foreground">
                            {text(user.email)}
                          </p>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {deleted
                            ? "PROFILE DELETED"
                            : accountStatus.replaceAll("_", " ")}
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Student ID
                          </dt>
                          <dd>{studentIdOf(student)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Program
                          </dt>
                          <dd>{display(student.program)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Department
                          </dt>
                          <dd>{display(student.department)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Semester
                          </dt>
                          <dd>{display(student.currentProgramSemester)}</dd>
                        </div>
                      </dl>
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedStudentId(studentIdOf(student))
                          }
                        >
                          View profile
                        </Button>
                        {!deleted && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditing(student)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={statusMutation.isPending}
                              onClick={() =>
                                statusMutation.mutate({
                                  id: userId,
                                  status:
                                    accountStatus === "SUSPENDED"
                                      ? "ACTIVE"
                                      : "SUSPENDED",
                                })
                              }
                            >
                              {accountStatus === "SUSPENDED" ? (
                                <>
                                  <ShieldCheck className="size-4" />
                                  Reactivate
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="size-4" />
                                  Suspend
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget(student)}
                            >
                              <Trash2 className="size-4" />
                              Delete profile
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {studentsQuery.data?.meta && studentsQuery.data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span>
              Page {studentsQuery.data.meta.page} of{" "}
              {studentsQuery.data.meta.totalPages} ·{" "}
              {studentsQuery.data.meta.total} records
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= studentsQuery.data.meta.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      {editing && (
        <StudentEditor
          key={studentIdOf(editing)}
          student={editing}
          departments={departments}
          programs={programs}
          semesters={semesters}
          saving={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSubmit={(body) =>
            updateMutation.mutate({ id: studentIdOf(editing), body })
          }
        />
      )}
      {selectedStudentId && (
        <Modal
          title="Student profile details"
          onClose={() => setSelectedStudentId("")}
        >
          {detailQuery.isPending ? (
            <div className="flex justify-center p-8">
              <LoaderCircle className="size-5 animate-spin" />
            </div>
          ) : detailQuery.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(detailQuery.error)}
            </p>
          ) : isRecord(detailQuery.data?.data) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(detailQuery.data.data)
                .filter(([key]) => key !== "passwordHash")
                .map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3">
                    <p className="text-xs capitalize text-muted-foreground">
                      {key
                        .replace(/[A-Z]/g, (letter) => ` ${letter}`)
                        .replace(/^./, (letter) => letter.toUpperCase())}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium">
                      {display(value)}
                    </p>
                  </div>
                ))}
            </div>
          ) : null}
        </Modal>
      )}
      {deleteTarget && (
        <Modal
          title="Delete student profile?"
          onClose={() => setDeleteTarget(null)}
        >
          <p className="text-sm text-muted-foreground">
            This soft-deletes the profile for {nameOf(deleteTarget)}. The
            student's login account, enrolments, and history are preserved.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(studentIdOf(deleteTarget))}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete profile"}
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}

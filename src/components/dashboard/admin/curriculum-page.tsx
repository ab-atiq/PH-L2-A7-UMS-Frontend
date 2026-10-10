"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage, universityApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type RecordData = Record<string, unknown>;

function recordsFrom(value: unknown): RecordData[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is RecordData =>
        typeof item === "object" && item !== null && !Array.isArray(item),
    );
  }
  if (typeof value !== "object" || value === null) return [];
  const record = value as RecordData;
  for (const key of ["data", "items", "results"]) {
    const nested = record[key];
    if (Array.isArray(nested)) return recordsFrom(nested);
    if (typeof nested === "object" && nested !== null)
      return recordsFrom(nested);
  }
  return [];
}

function displayName(value: unknown) {
  if (typeof value !== "object" || value === null) return "Unknown";
  const record = value as RecordData;
  const name = record.name ?? record.title;
  if (typeof name === "string") return name;
  const user = record.user as RecordData | undefined;
  if (user) {
    const first = typeof user.firstName === "string" ? user.firstName : "";
    const last = typeof user.lastName === "string" ? user.lastName : "";
    return `${first} ${last}`.trim() || "Faculty member";
  }
  return "Unknown";
}

export default function CurriculumPage() {
  const queryClient = useQueryClient();
  const [programId, setProgramId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teacherEdits, setTeacherEdits] = useState<Record<string, string>>({});

  const programsQuery = useQuery({
    queryKey: ["university", "curriculum-programs"],
    queryFn: () => universityApi.list("programs", { limit: 100 }),
  });
  const programs = recordsFrom(programsQuery.data);
  const activeProgramId =
    programId || (typeof programs[0]?.id === "string" ? programs[0].id : "");
  const semestersQuery = useQuery({
    queryKey: ["university", "program-semesters", activeProgramId],
    queryFn: () => universityApi.programSemesters(activeProgramId),
    enabled: Boolean(activeProgramId),
  });
  const semesters = recordsFrom(semestersQuery.data);
  const activeSemesterId =
    semesterId ||
    (typeof semesters[0]?.id === "string" ? semesters[0].id : "");
  const coursesQuery = useQuery({
    queryKey: ["university", "curriculum-courses"],
    queryFn: () => universityApi.list("courses", { limit: 100 }),
  });
  const facultyQuery = useQuery({
    queryKey: ["university", "curriculum-faculty"],
    queryFn: () => universityApi.list("faculty", { limit: 100 }),
  });
  const semesterCoursesQuery = useQuery({
    queryKey: ["university", "semester-courses", activeSemesterId],
    queryFn: () => universityApi.semesterCourses(activeSemesterId),
    enabled: Boolean(activeSemesterId),
  });
  const courses = recordsFrom(coursesQuery.data);
  const faculty = recordsFrom(facultyQuery.data);
  const assignedCourses = recordsFrom(semesterCoursesQuery.data);

  const addCourse = useMutation({
    mutationFn: () =>
      universityApi.addSemesterCourse(activeSemesterId, { courseId, teacherId }),
    onSuccess: () => {
      toast.add({
        title: "Course assigned",
        description: "The course is now part of this semester's curriculum.",
        type: "success",
      });
      setCourseId("");
      setTeacherId("");
      queryClient.invalidateQueries({
        queryKey: ["university", "semester-courses", activeSemesterId],
      });
    },
    onError: (error) =>
      toast.add({
        title: "Course assignment failed",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const removeCourse = useMutation({
    mutationFn: universityApi.deleteSemesterCourse,
    onSuccess: () => {
      toast.add({
        title: "Assignment removed",
        description: "The course was removed from this semester.",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["university", "semester-courses", activeSemesterId],
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not remove assignment",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const updateCourse = useMutation({
    mutationFn: (input: { id: string; teacherId: string }) =>
      universityApi.updateSemesterCourse(input.id, {
        teacherId: input.teacherId,
      }),
    onSuccess: () => {
      toast.add({
        title: "Faculty assignment updated",
        description: "The instructor assignment has been saved.",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["university", "semester-courses", activeSemesterId],
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not update instructor",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  const busy =
    programsQuery.isLoading ||
    semestersQuery.isLoading ||
    coursesQuery.isLoading ||
    facultyQuery.isLoading;

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header>
        <p className="text-sm font-medium text-primary">Academic setup</p>
        <h1 className="mt-1 text-2xl font-semibold">Program curriculum</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Assign courses and one responsible faculty member to each semester in
          a program. Semester counts are determined by the program degree type.
        </p>
      </header>
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Program
            <select
              className="h-10 rounded-md border bg-background px-3 font-normal"
              value={activeProgramId}
              onChange={(event) => {
                setProgramId(event.target.value);
                setSemesterId("");
              }}
              disabled={busy}
            >
              {programs.map((program) => (
                <option key={String(program.id)} value={String(program.id)}>
                  {displayName(program)} · {String(program.code ?? "")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Program semester
            <select
              className="h-10 rounded-md border bg-background px-3 font-normal"
              value={activeSemesterId}
              onChange={(event) => setSemesterId(event.target.value)}
              disabled={!semesters.length || semestersQuery.isLoading}
            >
              {semesters.map((semester) => (
                <option key={String(semester.id)} value={String(semester.id)}>
                  {String(semester.name)} · Semester {String(semester.semesterNumber)}
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      {busy ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Loading curriculum…
        </div>
      ) : !programs.length ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Create a program before configuring its curriculum.
          </CardContent>
        </Card>
      ) : !semesters.length ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No semesters are configured for this program.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]">
              <label className="grid gap-2 text-sm font-medium">
                Course
                <select
                  className="h-10 rounded-md border bg-background px-3 font-normal"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={String(course.id)} value={String(course.id)}>
                      {String(course.courseCode)} · {String(course.title)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Assigned faculty
                <select
                  className="h-10 rounded-md border bg-background px-3 font-normal"
                  value={teacherId}
                  onChange={(event) => setTeacherId(event.target.value)}
                >
                  <option value="">Select a faculty member</option>
                  {faculty.map((member) => (
                    <option key={String(member.id)} value={String(member.id)}>
                      {displayName(member)} · {String(member.employeeId)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                className="self-end"
                disabled={!courseId || !teacherId || addCourse.isPending}
                onClick={() => addCourse.mutate()}
              >
                {addCourse.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Assign course
              </Button>
            </CardContent>
          </Card>

          <section className="grid gap-4 md:grid-cols-2">
            {assignedCourses.map((assignment) => {
              const id =
                typeof assignment.id === "string" ? assignment.id : "";
              const course = assignment.course as RecordData | undefined;
              const semester = assignment.programSemester as
                | RecordData
                | undefined;
              const teacher = assignment.teacher as RecordData | undefined;
              const currentTeacherId =
                typeof teacher?.id === "string" ? teacher.id : "";
              const selectedTeacherId = teacherEdits[id] ?? currentTeacherId;
              return (
                <Card key={id}>
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {String(course?.courseCode ?? "")} ·{" "}
                        {String(course?.title ?? "Course")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {String(semester?.name ?? "")}
                        {typeof course?.credits === "number"
                          ? ` · ${course.credits} credits`
                          : ""}
                      </p>
                      <p className="mt-3 text-sm">
                        Instructor: {displayName(teacher)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <select
                          className="h-9 min-w-48 rounded-md border bg-background px-2 text-sm"
                          value={selectedTeacherId}
                          onChange={(event) =>
                            setTeacherEdits((current) => ({
                              ...current,
                              [id]: event.target.value,
                            }))
                          }
                          aria-label="Change assigned faculty"
                        >
                          {faculty.map((member) => (
                            <option
                              key={String(member.id)}
                              value={String(member.id)}
                            >
                              {displayName(member)}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            !selectedTeacherId ||
                            selectedTeacherId === currentTeacherId ||
                            updateCourse.isPending
                          }
                          onClick={() =>
                            updateCourse.mutate({
                              id,
                              teacherId: selectedTeacherId,
                            })
                          }
                        >
                          Save instructor
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      aria-label={`Remove ${String(course?.courseCode ?? "course")}`}
                      disabled={removeCourse.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Remove this course assignment? Enrolled students cannot be removed this way.",
                          )
                        )
                          removeCourse.mutate(id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {!assignedCourses.length && (
              <Card className="md:col-span-2">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No courses assigned to this semester yet.
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}
    </main>
  );
}

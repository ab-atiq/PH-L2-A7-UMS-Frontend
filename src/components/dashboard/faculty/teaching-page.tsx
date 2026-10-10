"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage, universityApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

type RecordData = Record<string, unknown>;

function asRecord(value: unknown): RecordData | null {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  return value as RecordData;
}

function recordsFrom(value: unknown): RecordData[] {
  if (Array.isArray(value))
    return value.filter(
      (item): item is RecordData =>
        typeof item === "object" && item !== null && !Array.isArray(item),
    );
  const record = asRecord(value);
  if (!record) return [];
  for (const key of ["data", "items", "results"]) {
    if (Array.isArray(record[key])) return recordsFrom(record[key]);
    if (asRecord(record[key])) return recordsFrom(record[key]);
  }
  return [];
}

function text(value: unknown, fallback = "—") {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
}

function RosterAndExams({ assignment }: { assignment: RecordData }) {
  const queryClient = useQueryClient();
  const courseId = text(assignment.id, "");
  const course = asRecord(assignment.course);
  const programSemester = asRecord(assignment.programSemester);
  const program = asRecord(programSemester?.program);
  const roster = recordsFrom(assignment.courseEnrollments);
  const [examType, setExamType] = useState("FINAL");
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const examsQuery = useQuery({
    queryKey: ["university", "faculty-exams", courseId],
    queryFn: () => universityApi.list("exams", { semesterCourseId: courseId }),
    enabled: Boolean(courseId),
  });
  const exams = recordsFrom(examsQuery.data);

  const markAttendance = useMutation({
    mutationFn: ({
      courseEnrollmentId,
      status,
    }: {
      courseEnrollmentId: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    }) =>
      universityApi.recordAttendance(courseId, {
        courseEnrollmentId,
        semesterCourseId: courseId,
        classDate: `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`,
        status,
      }),
    onSuccess: () => {
      toast.add({
        title: "Attendance recorded",
        description: "The student's attendance has been saved.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["university"] });
    },
    onError: (error) =>
      toast.add({
        title: "Could not record attendance",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const createExam = useMutation({
    mutationFn: () =>
      universityApi.createExam({
        semesterCourseId: courseId,
        examType,
        title: examTitle.trim() || null,
        examDate: new Date(examDate).toISOString(),
        totalMarks: Number(totalMarks),
      }),
    onSuccess: async () => {
      toast.add({
        title: "Exam created",
        description: "The exam was added to this course.",
        type: "success",
      });
      setExamTitle("");
      setExamDate("");
      await queryClient.invalidateQueries({
        queryKey: ["university", "faculty-exams", courseId],
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not create exam",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const submitResult = useMutation({
    mutationFn: ({
      studentId,
      courseEnrollmentId,
      marksObtained,
    }: {
      studentId: string;
      courseEnrollmentId: string;
      marksObtained: number;
    }) =>
      universityApi.createResult({
        examId: selectedExamId,
        studentId,
        courseEnrollmentId,
        marksObtained,
      }),
    onSuccess: () =>
      toast.add({
        title: "Result submitted",
        description: "The result is ready for publication.",
        type: "success",
      }),
    onError: (error) =>
      toast.add({
        title: "Could not submit result",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const publishResults = useMutation({
    mutationFn: universityApi.publishExamResults,
    onSuccess: () => {
      toast.add({
        title: "Results published",
        description: "Students can now view their results.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["university"] });
    },
    onError: (error) =>
      toast.add({
        title: "Could not publish results",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <header>
          <p className="text-sm font-medium text-primary">
            {text(course?.courseCode)} · {text(program?.name)}
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            {text(course?.title, "Course")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {text(programSemester?.name)} · {roster.length} enrolled students
          </p>
        </header>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-medium">Class attendance · today</h3>
          {roster.map((enrollment) => {
            const student = asRecord(enrollment.student);
            const account = asRecord(student?.user);
            const enrollmentId = text(enrollment.id, "");
            return (
              <div
                key={enrollmentId}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm last:border-0"
              >
                <span>
                  {text(account?.firstName)} {text(account?.lastName, "")}
                  <span className="ml-2 text-muted-foreground">
                    {text(student?.studentId)}
                  </span>
                </span>
                <div className="flex gap-2">
                  {(["PRESENT", "ABSENT", "LATE"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      disabled={markAttendance.isPending}
                      onClick={() =>
                        markAttendance.mutate({
                          courseEnrollmentId: enrollmentId,
                          status,
                        })
                      }
                    >
                      {status.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
          {!roster.length && (
            <p className="text-sm text-muted-foreground">
              Students appear after completing the semester fee payment and
              enrollment.
            </p>
          )}
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-medium">Create an exam</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={examType}
              onChange={(event) => setExamType(event.target.value)}
            >
              {["QUIZ", "ASSIGNMENT", "MIDTERM", "FINAL", "PROJECT"].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ),
              )}
            </select>
            <Input
              aria-label="Exam title"
              placeholder="Exam title (optional)"
              value={examTitle}
              onChange={(event) => setExamTitle(event.target.value)}
            />
            <Input
              aria-label="Exam date"
              type="date"
              required
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
            <Input
              aria-label="Total marks"
              type="number"
              min="1"
              required
              value={totalMarks}
              onChange={(event) => setTotalMarks(event.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={!examDate || Number(totalMarks) <= 0 || createExam.isPending}
            onClick={() => createExam.mutate()}
          >
            {createExam.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            Add exam
          </Button>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-medium">Submit and publish results</h3>
            <select
              className="h-10 min-w-52 rounded-md border bg-background px-3 text-sm"
              value={selectedExamId}
              onChange={(event) => setSelectedExamId(event.target.value)}
              disabled={examsQuery.isLoading}
            >
              <option value="">Select an exam</option>
              {exams.map((exam) => (
                <option key={text(exam.id)} value={text(exam.id, "")}>
                  {text(exam.title, text(exam.examType))}
                </option>
              ))}
            </select>
          </div>
          {selectedExamId &&
            roster.map((enrollment) => {
              const student = asRecord(enrollment.student);
              const account = asRecord(student?.user);
              const enrollmentId = text(enrollment.id, "");
              return (
                <div
                  key={enrollmentId}
                  className="grid gap-2 border-b pb-3 sm:grid-cols-[1fr_120px_auto] sm:items-center"
                >
                  <span className="text-sm">
                    {text(account?.firstName)} {text(account?.lastName, "")}
                  </span>
                  <Input
                    aria-label={`Marks for ${text(account?.firstName)} ${text(account?.lastName, "")}`}
                    type="number"
                    min="0"
                    placeholder="Marks"
                    value={marks[enrollmentId] ?? ""}
                    onChange={(event) =>
                      setMarks((current) => ({
                        ...current,
                        [enrollmentId]: event.target.value,
                      }))
                    }
                  />
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    disabled={
                      submitResult.isPending ||
                      marks[enrollmentId] === undefined ||
                      marks[enrollmentId] === "" ||
                      !student ||
                      typeof student.id !== "string"
                    }
                    onClick={() => {
                      if (typeof student?.id !== "string") return;
                      submitResult.mutate({
                        studentId: student.id,
                        courseEnrollmentId: enrollmentId,
                        marksObtained: Number(marks[enrollmentId]),
                      });
                    }}
                  >
                    Submit marks
                  </Button>
                </div>
              );
            })}
          {selectedExamId && (
            <Button
              type="button"
              variant="outline"
              disabled={publishResults.isPending}
              onClick={() => publishResults.mutate(selectedExamId)}
            >
              {publishResults.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              Publish exam results
            </Button>
          )}
          {!exams.length && (
            <p className="text-sm text-muted-foreground">
              Create an exam before entering marks.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeachingPage() {
  const coursesQuery = useQuery({
    queryKey: ["university", "faculty-courses"],
    queryFn: universityApi.facultyCourses,
  });
  const courses = recordsFrom(coursesQuery.data);

  if (coursesQuery.isLoading)
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> Loading assigned
        courses…
      </div>
    );
  if (coursesQuery.isError)
    return (
      <p className="p-6 text-sm text-destructive">
        {getApiErrorMessage(coursesQuery.error)}
      </p>
    );

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header>
        <p className="text-sm font-medium text-primary">Faculty workspace</p>
        <h1 className="mt-1 text-2xl font-semibold">My courses</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage attendance, exams, and published results for your assigned
          program courses.
        </p>
      </header>
      <section className="grid gap-5 xl:grid-cols-2">
        {courses.map((assignment) => (
          <RosterAndExams
            key={text(assignment.id)}
            assignment={assignment}
          />
        ))}
        {!courses.length && (
          <Card className="xl:col-span-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No courses have been assigned to your faculty profile yet.
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

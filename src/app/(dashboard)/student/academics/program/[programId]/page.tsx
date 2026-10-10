import AcademicDetailPage from "@/components/dashboard/student/academic-detail-page";

export default async function StudentProgramDetailsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  return <AcademicDetailPage kind="program" id={programId} />;
}

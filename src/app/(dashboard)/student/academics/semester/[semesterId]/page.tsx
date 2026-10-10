import AcademicDetailPage from "@/components/dashboard/student/academic-detail-page";

export default async function StudentSemesterDetailsPage({
  params,
}: {
  params: Promise<{ semesterId: string }>;
}) {
  const { semesterId } = await params;
  return <AcademicDetailPage kind="semester" id={semesterId} />;
}

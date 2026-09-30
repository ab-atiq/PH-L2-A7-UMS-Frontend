import { getAllPublicDoctors, getPublicDoctorProfile } from "@/api";
import DoctorBooking from "@/components/modules/doctors/doctor-booking";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  BriefcaseBusiness,
  GraduationCap,
  ScrollText,
  Stethoscope,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
  const limit = 100;
  const first = await getAllPublicDoctors({ page: 1, limit });

  const totalPages = first.meta.totalPages ?? 1;

  const all = [...first.data];

  for (let page = 2; page <= totalPages; page++) {
    const data = await getAllPublicDoctors({ page, limit });
    all.push(...data.data);
  }

  return all.map((doctor) => ({ id: doctor.id }));
}

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getPublicDoctorProfile(id);

  const doctor = data.data || undefined;

  if (!doctor) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Doctor not found.</p>
        <Button
          variant="link"
          render={<Link href="/doctors">Back to doctors</Link>}
          nativeButton={false}
        >
          Back to doctors
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="my-10">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          render={<Link href="/doctors" />}
          nativeButton={false}
        >
          <ArrowLeft /> Back to doctors
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{doctor.name}</CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <Stethoscope className="size-4" />
              {doctor.specialization}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p className="flex items-center gap-2">
              <GraduationCap className="size-4 shrink-0" />
              {doctor.qualifications}
            </p>
            <p className="flex items-center gap-2">
              <BriefcaseBusiness className="size-4 shrink-0" />
              {doctor.experienceYears}{" "}
              {doctor.experienceYears === 1 ? "year" : "years"} of experience
            </p>
            <p className="flex items-center gap-2">
              <ScrollText className="size-4 shrink-0" />
              License No: {doctor.licenseNumber}
            </p>
            {doctor.consultationFee != null && (
              <p className="flex items-center gap-2">
                <Wallet className="size-4 shrink-0" />
                Consultation fee: ৳{doctor.consultationFee}
              </p>
            )}
            {doctor.bio && (
              <div className="pt-2">
                <p className="font-medium text-foreground">About</p>
                <p>{doctor.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Book appointment</h2>
          <p className="text-sm text-muted-foreground">
            Today&apos;s available slots. Booking redirects to bKash payment.
          </p>
        </div>
        <DoctorBooking doctorId={doctor.id} />
      </div>
    </div>
  );
}

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSuspenseGetPublicDoctors } from "@/hooks";
import { PublicDoctorParams } from "@/types";
import Link from "next/link";
import {
  BriefcaseBusiness,
  GraduationCap,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { Suspense, useDeferredValue, useState } from "react";

export default function PublicDoctorList() {
  const [page, setPage] = useState(1);

  const queryParams: PublicDoctorParams = {
    page,
    limit: 100,
  };

  return (
    <div>
      <Suspense fallback={<PublicDoctorListLoading />}>
        <PublicDoctorGrid {...queryParams} onPageChange={setPage} />
      </Suspense>
    </div>
  );
}

function PublicDoctorGrid({
  onPageChange,
  ...params
}: PublicDoctorParams & { onPageChange: (page: number) => void }) {
  const { data } = useSuspenseGetPublicDoctors(params);

  const doctors = data?.data ?? [];

  if (doctors.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        No doctors found.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <CardTitle>{doctor.name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <Stethoscope className="size-3.5" />
                {doctor.specialization}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <GraduationCap className="size-4 shrink-0" />
                {doctor.qualifications}
              </p>
              <p className="flex items-center gap-1.5">
                <BriefcaseBusiness className="size-4 shrink-0" />
                {doctor.experienceYears}{" "}
                {doctor.experienceYears === 1 ? "year" : "years"} of experience
              </p>

              <p className="flex items-center gap-1.5">
                <Wallet className="size-4 shrink-0" />
                Fee:
                {doctor.consultationFee ? `৳${doctor.consultationFee}` : "-"}
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                className="flex-1"
                render={<Link href={`/doctors/${doctor.id}`}>See Details</Link>}
                nativeButton={false}
              >
                See Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PublicDoctorListLoading() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="space-y-2 rounded-xl border p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useBookAppointment,
  useGetMe,
  useGetTodayScheduleByDoctor,
} from "@/hooks";
import { Schedule } from "@/types";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookingConfirmation {
  schedule: Schedule;
  paymentUrl: string;
}

export default function DoctorBooking({ doctorId }: { doctorId: string }) {
  const router = useRouter();

  const { data: me, isPending: mePending } = useGetMe();
  const { data, isPending, error } = useGetTodayScheduleByDoctor({ doctorId });
  const { mutate: book, isPending: bookingPending } = useBookAppointment();
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );

  const schedules = data?.data ?? [];

  const handleBooking = (schedule: Schedule) => {
    if (!mePending && !me?.data) {
      router.push("/login");
      return;
    }

    book(
      { scheduleId: schedule.id },
      {
        onSuccess: (res) => {
          console.log(res);

          setConfirmation({ paymentUrl: res.data.paymentUrl, schedule });
        },
      },
    );
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Spinner />
          <span className="text-sm text-muted-foreground">
            Loading today&apos;s slots…
          </span>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        Could not load slots. Please try again.
      </p>
    );
  }

  if (schedules.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        No bookable slots today for this doctor. Try another day or doctor.
      </p>
    );
  }

  return (
    <>
      <div>
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="border rounded-md p-3 flex gap-5 items-center"
          >
            <span>{format(schedule.startDateTime, "eeee")}</span>
            <span>{format(schedule.startDateTime, "PP")}</span>
            <span className="text-sm text-muted-foreground">
              Starts at {format(schedule.startDateTime, "p")}
            </span>
            <span className="text-sm text-muted-foreground">
              Ends at {format(schedule.endDateTime, "p")}
            </span>
            <Button className="ml-auto" onClick={() => handleBooking(schedule)}>
              {bookingPending ? "Booking..." : "Book Now"}
            </Button>
          </div>
        ))}
      </div>
      <Dialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmation(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Successful</DialogTitle>
            <DialogDescription>
              Please pay within 10 minutes to keep your booking
            </DialogDescription>
            <span>
              Data and Time:
              {confirmation
                ? format(confirmation.schedule.startDateTime, "PPP")
                : "-"}
            </span>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmation(null)}>
              Pay Later
            </Button>
            <Button
              onClick={() => {
                if (confirmation) {
                  window.location.href = confirmation.paymentUrl;
                }
              }}
            >
              Pay Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

//Payment failed => http://localhost:3000/dashboard/my-appointments?status=failue

"use client";

import { Button } from "@/components/ui/button";
import { useGetMyAppointments } from "@/hooks";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AppointmentList() {
  const params = useSearchParams();
  const status = params.get("status");

  const { data } = useGetMyAppointments({ page: 1, limit: 100 });

  const appointments = data?.data || [];

  if (status === "failure") {
    return (
      <div>
        <div>
          <h1>Payment Failed</h1>
          <p>Please check your vendor</p>
          <Link href="/dashboard/my-appointments">Go back to appointments</Link>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div>
        <div>
          <h1>Payment Successful</h1>
          <p>Please be prepared to join the video call</p>
          <Link href="/dashboard/my-appointments">Go back to appointments</Link>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return <p>There is not appointment</p>;
  }

  return (
    <div>
      {appointments.map(({ doctor, status, id }) => (
        <div key={id} className="border rounded-md p-3">
          <div className="w-full flex gap-3">
            <span>Doctor: {doctor.name}</span>
            <span>Status: {status}</span>
            <div className="ml-auto">
              <Button>Join</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

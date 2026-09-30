"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Schedule } from "@/types";

interface Props {
  schedule: Schedule;
  open: boolean;
  onClose: () => void;
}

export default function ScheduleDetailSheet({
  schedule,
  open,
  onClose,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Schedule details</SheetTitle>
          <SheetDescription>
            {new Date(schedule.startDateTime).toLocaleDateString(undefined, {
              dateStyle: "full",
            })}
          </SheetDescription>
        </SheetHeader>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Start</dt>
            <dd>
              {new Date(schedule.startDateTime).toLocaleTimeString(undefined, {
                timeStyle: "short",
              })}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">End</dt>
            <dd>
              {new Date(schedule.endDateTime).toLocaleTimeString(undefined, {
                timeStyle: "short",
              })}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{schedule.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Slots</dt>
            <dd>
              {schedule.totalSlots - schedule.availableSlots}/
              {schedule.totalSlots} booked
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Meeting link</dt>
            <dd className="truncate">
              <a
                href={schedule.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-primary"
              >
                Join
              </a>
            </dd>
          </div>
        </dl>
      </SheetContent>
    </Sheet>
  );
}

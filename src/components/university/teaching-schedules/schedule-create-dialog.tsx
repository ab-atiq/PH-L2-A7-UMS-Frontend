import CreateScheduleForm from "@/components/form/create-schedule-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function ScheduleCreateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" />}>
        Create Schedule
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
          <DialogDescription>
            This schedule will be visible to patient
          </DialogDescription>
        </DialogHeader>
        <CreateScheduleForm handleClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

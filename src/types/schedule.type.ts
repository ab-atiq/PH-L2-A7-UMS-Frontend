export type ScheduleStatus = "DRAFT" | "PUBLISHED";

export interface Schedule {
  id: string;
  startDateTime: string;
  endDateTime: string;
  totalSlots: number;
  availableSlots: number;
  meetingLink: string;
  status: ScheduleStatus;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchedulePayload {
  startDateTime: string;
  endDateTime: string;
  meetingLink: string;
}

export interface ScheduleParams {
  status?: ScheduleStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "desc" | "asc";
}

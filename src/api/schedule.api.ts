import apiClient from "@/lib/apiClient";
import {
  ApiResponse,
  CreateSchedulePayload,
  Schedule,
  ScheduleParams,
} from "@/types";

export function createSchedule(payload: CreateSchedulePayload) {
  return apiClient<ApiResponse<Schedule>>("/schedule/create-schedule", {
    method: "POST",
    body: payload,
  });
}

export function getMySchedules(params: ScheduleParams) {
  return apiClient<ApiResponse<Schedule[]>>("/schedule/my-schedules", {
    params,
  });
}

export function publishSchedule(scheduleId: string) {
  return apiClient<ApiResponse<Schedule>>(
    `/schedule/publish-schedule/${scheduleId}`,
    { method: "PATCH" },
  );
}

export function deleteSchedule(scheduleId: string) {
  return apiClient<ApiResponse<Schedule>>(`/schedule/${scheduleId}`, {
    method: "DELETE",
  });
}

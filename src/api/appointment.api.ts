import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  BookAppointmentPayload,
  BookAppointmentResponse,
} from "@/types";

export function bookAppointment(payload: BookAppointmentPayload) {
  return apiClient<ApiResponse<BookAppointmentResponse>>(
    "/appointment/book-appointment",
    {
      method: "POST",
      body: payload,
    },
  );
}

export function getMyAppointments(params: { page?: number; limit?: number }) {
  return apiClient("/appointment/my-appointments", {
    params,
  });
}

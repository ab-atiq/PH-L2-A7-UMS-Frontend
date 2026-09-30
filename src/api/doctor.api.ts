import apiClient from "@/lib/apiClient";
import {
  ApiResponse,
  ApproveDoctorPayload,
  Doctor,
  DoctorApplicationPayload,
  DoctorParams,
  PublicDoctorParams,
  PublicDoctorProfile,
  Schedule,
  VerifyAccountPayload,
} from "@/types";

export function applyAsDoctor(payload: DoctorApplicationPayload) {
  const formData = new FormData();

  formData.append("data", JSON.stringify(payload.data));
  formData.append("resume", payload.resume);

  for (const file of payload.additionalFiles) {
    formData.append("additionalFiles", file);
  }

  return apiClient("/doctor/apply-as-doctor", {
    method: "POST",
    body: formData,
  });
}

export function verifyDoctorAccount(payload: VerifyAccountPayload) {
  return apiClient("/doctor/apply-as-doctor/verify-email", {
    method: "POST",
    body: payload,
  });
}

export function getAllDoctors(params: DoctorParams) {
  return apiClient<ApiResponse<Doctor[]>>("/doctor/all-doctors", {
    params,
  });
}

export function approveDoctor(payload: ApproveDoctorPayload) {
  return apiClient("/doctor/approve-doctor", {
    method: "POST",
    body: payload,
  });
}

export function getAllPublicDoctors(params: PublicDoctorParams) {
  return apiClient<ApiResponse<PublicDoctorProfile[]>>(
    "/doctor/public/all-doctors",
    {
      params,
    },
  );
}

export function getPublicDoctorProfile(doctorId: string) {
  return apiClient<ApiResponse<PublicDoctorProfile>>(
    `/doctor/public/${doctorId}`,
  );
}

export function getTodayScheduleByDoctor(params: {
  doctorId?: string;
  page?: number;
  limit?: number;
}) {
  return apiClient<ApiResponse<Schedule[]>>("/schedule/todays-schedule", {
    params,
  });
}

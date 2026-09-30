import type { Schedule } from "./schedule.type";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "ONGOING"
  | "COMPLETED";

export type PaymentStatus =
  | "UNPAID"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface Payment {
  id: string;
  status: PaymentStatus;
  amount: number | string;
  currency: string;
  bkashPaymentId?: string | null;
  bkashTrxId?: string | null;
  payerReference?: string | null;
  paidAt?: string | null;
  refundTrxId?: string | null;
  refundAmount?: number | string | null;
  refundReason?: string | null;
  refundedAt?: string | null;
  appointmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentDoctor {
  id: string;
  name: string;
  specialization: string;
  email?: string;
  userId?: string;
}

export interface AppointmentPatient {
  id: string;
  name: string;
  email: string;
  contactNumber?: string | null;
  userId?: string;
}

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  joiningTime?: string | null;
  serialNumber?: number | null;
  recordUrl?: string | null;
  prescriptionUrl?: string | null;
  patientId: string;
  doctorId: string;
  scheduleId: string;
  createdAt: string;
  updatedAt: string;
  patient?: AppointmentPatient;
  doctor?: AppointmentDoctor;
  schedule?: Schedule;
  payment?: Payment | null;
}

export interface AppointmentParams {
  status?: AppointmentStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "desc" | "asc";
}

export interface BookAppointmentPayload {
  scheduleId: string;
}

export interface PayAppointmentPayload {
  appointmentId: string;
}

export interface CancelAppointmentPayload {
  appointmentId: string;
}

export interface BookAppointmentResponse {
  paymentUrl: string;
}

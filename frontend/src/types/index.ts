export type UserRole = 'patient' | 'doctor';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  doctor_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: number;
  user_id: number;
  name: string;
  email: string;
  specialty: string;
  room_number: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'scheduled' | 'serving' | 'completed' | 'absent' | 'cancelled';

export interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  specialty: string;
  room_number: string;
  appointment_date: string;
  time_slot: string;
  queue_number: number;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

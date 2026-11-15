export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  head_doctor_name?: string;
  doctor_count: number;
}

export interface DoctorAvailability {
  id: number;
  doctor_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_available: boolean;
}

export interface Doctor {
  id: number;
  user_id: number;
  department_id: number;
  department_name?: string;
  license_number: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  biography?: string;
  user?: User;
  availabilities?: DoctorAvailability[];
}

export interface Patient {
  id: number;
  user_id: number;
  patient_uhid: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  allergies?: string;
  chronic_conditions?: string;
  user?: User;
}

export interface DigitalHealthCard {
  uhid: string;
  full_name: string;
  email: string;
  phone?: string;
  blood_group?: string;
  gender: string;
  dob: string;
  allergies?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  total_visits: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  department_id: number;
  appointment_date: string;
  time_slot: string;
  queue_number: number;
  status: AppointmentStatus;
  symptoms?: string;
  created_at?: string;
  patient_name?: string;
  patient_uhid?: string;
  doctor_name?: string;
  doctor_specialization?: string;
  department_name?: string;
}

export interface QueueStatus {
  appointment_id: number;
  queue_number: number;
  current_serving_number: number;
  patients_ahead: number;
  estimated_wait_minutes: number;
  status: string;
  doctor_name: string;
  department_name: string;
  time_slot: string;
}

export interface MedicationItem {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: number;
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  diagnosis: string;
  medications: MedicationItem[];
  additional_advice?: string;
  created_at?: string;
  doctor_name?: string;
  patient_name?: string;
  patient_uhid?: string;
}

export interface ConsultationNote {
  id: number;
  appointment_id: number;
  doctor_id: number;
  patient_id: number;
  clinical_impression: string;
  vital_signs?: {
    blood_pressure?: string;
    pulse_rate?: string;
    temperature?: string;
    spo2?: string;
    weight?: string;
  };
  follow_up_recommendation?: string;
  created_at?: string;
  doctor_name?: string;
  patient_name?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at?: string;
}

export interface HospitalAnalytics {
  total_patients: number;
  total_doctors: number;
  total_departments: number;
  total_appointments: number;
  today_appointments: number;
  completion_rate_percentage: number;
  active_in_queue: number;
  daily_trend: { date: string; count: number }[];
  department_distribution: { department: string; count: number }[];
  doctor_workload: { doctor_name: string; department: string; appointment_count: number }[];
}

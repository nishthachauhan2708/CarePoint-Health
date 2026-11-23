import axios from 'axios';
import { 
  User, Department, Doctor, Patient, DigitalHealthCard, 
  Appointment, QueueStatus, Prescription, ConsultationNote, 
  Notification, HospitalAnalytics, AppointmentStatus 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('carehealth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('carehealth_token');
        localStorage.removeItem('carehealth_user');
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    },
    register: async (userData: { email: string; password: string; full_name: string; role?: string; phone_number?: string; date_of_birth?: string; gender?: string; blood_group?: string; address?: string }) => {
      const res = await apiClient.post('/auth/register', userData);
      return res.data;
    },
    getMe: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
  },

  // Departments
  departments: {
    getAll: async (): Promise<Department[]> => {
      const res = await apiClient.get('/departments/');
      return res.data;
    },
    getById: async (id: number): Promise<Department> => {
      const res = await apiClient.get(`/departments/${id}`);
      return res.data;
    },
    create: async (data: Partial<Department>): Promise<Department> => {
      const res = await apiClient.post('/departments/', data);
      return res.data;
    },
    update: async (id: number, data: Partial<Department>): Promise<Department> => {
      const res = await apiClient.put(`/departments/${id}`, data);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await apiClient.delete(`/departments/${id}`);
      return res.data;
    },
  },

  // Doctors
  doctors: {
    getAll: async (params?: { department_id?: number; specialization?: string; min_experience?: number; search?: string }): Promise<Doctor[]> => {
      const res = await apiClient.get('/doctors/', { params });
      return res.data;
    },
    getById: async (id: number): Promise<Doctor> => {
      const res = await apiClient.get(`/doctors/${id}`);
      return res.data;
    },
    getSlots: async (id: number, dateStr: string): Promise<{ doctor_id: number; date: string; slots: { slot: string; is_booked: boolean }[] }> => {
      const res = await apiClient.get(`/doctors/${id}/slots`, { params: { date_str: dateStr } });
      return res.data;
    },
    create: async (data: any): Promise<Doctor> => {
      const res = await apiClient.post('/doctors/', data);
      return res.data;
    },
    setAvailability: async (id: number, availabilities: any[]) => {
      const res = await apiClient.post(`/doctors/${id}/availability`, availabilities);
      return res.data;
    },
  },

  // Patients
  patients: {
    getAll: async (search?: string): Promise<Patient[]> => {
      const res = await apiClient.get('/patients/', { params: { search } });
      return res.data;
    },
    getById: async (id: number): Promise<Patient> => {
      const res = await apiClient.get(`/patients/${id}`);
      return res.data;
    },
    getMyProfile: async (): Promise<Patient> => {
      const res = await apiClient.get('/patients/me/profile');
      return res.data;
    },
    getHealthCard: async (id: number): Promise<DigitalHealthCard> => {
      const res = await apiClient.get(`/patients/${id}/health-card`);
      return res.data;
    },
    update: async (id: number, data: Partial<Patient>): Promise<Patient> => {
      const res = await apiClient.put(`/patients/${id}`, data);
      return res.data;
    },
    updateMyProfile: async (data: any): Promise<Patient> => {
      const res = await apiClient.put('/patients/me/profile', data);
      return res.data;
    },
    verifyCard: async (uhid: string) => {
      const res = await apiClient.get(`/patients/verify-card/${uhid}`);
      return res.data;
    },
  },

  // Chatbot (Care Buddy)
  chatbot: {
    sendMessage: async (message: string, sessionId?: string) => {
      const res = await apiClient.post('/chatbot/message', { message, session_id: sessionId });
      return res.data;
    },
  },

  // Appointments
  appointments: {
    book: async (data: { doctor_id: number; department_id: number; appointment_date: string; time_slot: string; symptoms?: string; patient_id?: number }): Promise<Appointment> => {
      const res = await apiClient.post('/appointments/', data);
      return res.data;
    },
    getAll: async (params?: { date_filter?: string; status_filter?: string; doctor_id?: number; patient_id?: number }): Promise<Appointment[]> => {
      const res = await apiClient.get('/appointments/', { params });
      return res.data;
    },
    getById: async (id: number): Promise<Appointment> => {
      const res = await apiClient.get(`/appointments/${id}`);
      return res.data;
    },
    updateStatus: async (id: number, status: AppointmentStatus): Promise<Appointment> => {
      const res = await apiClient.patch(`/appointments/${id}/status`, { status });
      return res.data;
    },
    getQueueStatus: async (id: number): Promise<QueueStatus> => {
      const res = await apiClient.get(`/appointments/${id}/queue`);
      return res.data;
    },
  },

  // Prescriptions
  prescriptions: {
    create: async (data: { appointment_id: number; diagnosis: string; medications: any[]; additional_advice?: string }): Promise<Prescription> => {
      const res = await apiClient.post('/prescriptions/', data);
      return res.data;
    },
    getByAppointment: async (appointmentId: number): Promise<Prescription> => {
      const res = await apiClient.get(`/prescriptions/appointment/${appointmentId}`);
      return res.data;
    },
    getByPatient: async (patientId: number): Promise<Prescription[]> => {
      const res = await apiClient.get(`/prescriptions/patient/${patientId}`);
      return res.data;
    },
  },

  // Consultations
  consultations: {
    record: async (data: { appointment_id: number; clinical_impression: string; vital_signs?: any; follow_up_recommendation?: string }): Promise<ConsultationNote> => {
      const res = await apiClient.post('/consultations/', data);
      return res.data;
    },
    getByAppointment: async (appointmentId: number): Promise<ConsultationNote> => {
      const res = await apiClient.get(`/consultations/appointment/${appointmentId}`);
      return res.data;
    },
  },

  // Analytics
  analytics: {
    getSummary: async (): Promise<HospitalAnalytics> => {
      const res = await apiClient.get('/analytics/summary');
      return res.data;
    },
  },

  // Notifications
  notifications: {
    getAll: async (): Promise<Notification[]> => {
      const res = await apiClient.get('/notifications/');
      return res.data;
    },
    markRead: async (id: number): Promise<Notification> => {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data;
    },
  },
};

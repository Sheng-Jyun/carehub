import { z } from 'zod';

// Patient Types
export const PatientSchema = z.object({
  id: z.string(),
  mrn: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email().optional(),
  phone: z.string(),
  address: z.string(),
  status: z.enum(['active', 'inactive', 'deceased']),
  provider: z.string(),
  providerName: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  photo: z.string().optional(),
  hasUpcomingAppointment: z.boolean(),
  lastVisit: z.string().optional(),
  nextAppointment: z.string().optional(),
  activeMedications: z.number(),
  alerts: z.array(z.string()),
});

export type Patient = z.infer<typeof PatientSchema>;

// Appointment Types
export const AppointmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.enum(['checkup', 'followup', 'urgent', 'procedure', 'consultation']),
  status: z.enum(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']),
  room: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

// Vital Signs Types
export const VitalSignsSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  date: z.string(),
  bloodPressureSystolic: z.number(),
  bloodPressureDiastolic: z.number(),
  heartRate: z.number(),
  temperature: z.number(),
  respiratoryRate: z.number(),
  oxygenSaturation: z.number(),
  weight: z.number(),
  height: z.number(),
  bmi: z.number(),
  recordedBy: z.string(),
});

export type VitalSigns = z.infer<typeof VitalSignsSchema>;

// Provider Notes Types
export const ProviderNoteSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  date: z.string(),
  type: z.enum(['progress', 'admission', 'discharge', 'consultation', 'procedure']),
  content: z.string(),
  isPrivate: z.boolean(),
});

export type ProviderNote = z.infer<typeof ProviderNoteSchema>;

// Provider Types
export const ProviderSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  specialty: z.string(),
  email: z.string().email(),
  phone: z.string(),
  photo: z.string().optional(),
});

export type Provider = z.infer<typeof ProviderSchema>;

// Notification Types
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['appointment', 'alert', 'message', 'system']),
  title: z.string(),
  message: z.string(),
  timestamp: z.string(),
  read: z.boolean(),
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

export type Notification = z.infer<typeof NotificationSchema>;

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Parameters
export interface PatientQueryParams {
  search?: string;
  status?: 'active' | 'inactive' | 'deceased';
  provider?: string;
  hasUpcoming?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentQueryParams {
  startDate?: string;
  endDate?: string;
  providerId?: string;
  patientId?: string;
  status?: string;
  room?: string;
}

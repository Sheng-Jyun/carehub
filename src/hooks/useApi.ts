import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { Patient, PaginatedResponse, PatientQueryParams, Appointment, VitalSigns, ProviderNote, Provider, Notification } from '@/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// API Client Functions
async function fetchPatients(params: PatientQueryParams): Promise<PaginatedResponse<Patient>> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/patients?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  
  return response.json();
}

async function fetchPatient(id: string): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch patient');
  }
  
  return response.json();
}

async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update patient');
  }
  
  return response.json();
}

async function fetchPatientAppointments(patientId: string): Promise<Appointment[]> {
  const response = await fetch(`/api/patients/${patientId}/appointments`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch patient appointments');
  }
  
  return response.json();
}

async function fetchPatientVitals(patientId: string): Promise<VitalSigns[]> {
  const response = await fetch(`/api/patients/${patientId}/vitals`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch patient vitals');
  }
  
  return response.json();
}

async function fetchPatientNotes(patientId: string): Promise<ProviderNote[]> {
  const response = await fetch(`/api/patients/${patientId}/notes`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch patient notes');
  }
  
  return response.json();
}

async function createPatientNote(patientId: string, data: Partial<ProviderNote>): Promise<ProviderNote> {
  const response = await fetch(`/api/patients/${patientId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create note');
  }
  
  return response.json();
}

async function fetchAppointments(params?: any): Promise<Appointment[]> {
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const response = await fetch(`/api/appointments?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }
  
  return response.json();
}

async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create appointment');
  }
  
  return response.json();
}

async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
  const response = await fetch(`/api/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update appointment');
  }
  
  return response.json();
}

async function deleteAppointment(id: string): Promise<void> {
  const response = await fetch(`/api/appointments/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete appointment');
  }
}

async function fetchProviders(): Promise<Provider[]> {
  const response = await fetch('/api/providers');
  
  if (!response.ok) {
    throw new Error('Failed to fetch providers');
  }
  
  return response.json();
}

async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/notifications');
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  return response.json();
}

async function markNotificationRead(id: string): Promise<Notification> {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: 'PUT',
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  
  return response.json();
}

async function markAllNotificationsRead(): Promise<void> {
  const response = await fetch('/api/notifications', {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
}

// React Query Hooks
export function usePatients(params: PatientQueryParams) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => fetchPatients(params),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => 
      updatePatient(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient', data.id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: ['patient-appointments', patientId],
    queryFn: () => fetchPatientAppointments(patientId),
    enabled: !!patientId,
  });
}

export function usePatientVitals(patientId: string) {
  return useQuery({
    queryKey: ['patient-vitals', patientId],
    queryFn: () => fetchPatientVitals(patientId),
    enabled: !!patientId,
  });
}

export function usePatientNotes(patientId: string) {
  return useQuery({
    queryKey: ['patient-notes', patientId],
    queryFn: () => fetchPatientNotes(patientId),
    enabled: !!patientId,
  });
}

export function useCreatePatientNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: Partial<ProviderNote> }) =>
      createPatientNote(patientId, data),
    onMutate: async ({ patientId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['patient-notes', patientId] });
      
      // Snapshot previous value
      const previousNotes = queryClient.getQueryData(['patient-notes', patientId]);
      
      // Optimistically update
      queryClient.setQueryData(['patient-notes', patientId], (old: ProviderNote[] = []) => [
        {
          id: 'temp-' + Date.now(),
          ...data,
          date: new Date().toISOString(),
        } as ProviderNote,
        ...old,
      ]);
      
      return { previousNotes };
    },
    onError: (err, { patientId }, context) => {
      queryClient.setQueryData(['patient-notes', patientId], context?.previousNotes);
    },
    onSettled: (data, error, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['patient-notes', patientId] });
    },
  });
}

export function useAppointments(params?: any) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => fetchAppointments(params),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export { queryClient };

import { NextRequest, NextResponse } from 'next/server';
import { appointments } from '@/mocks/data';
import { randomDelay, shouldSimulateError, generateId } from '@/lib/utils';
import { AppointmentQueryParams } from '@/types';

export async function GET(request: NextRequest) {
  await randomDelay();

  // Simulate occasional errors
  if (shouldSimulateError()) {
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  
  const params: AppointmentQueryParams = {
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    providerId: searchParams.get('providerId') || undefined,
    patientId: searchParams.get('patientId') || undefined,
    status: searchParams.get('status') || undefined,
    room: searchParams.get('room') || undefined,
  };

  let filteredAppointments = [...appointments];

  if (params.startDate) {
    filteredAppointments = filteredAppointments.filter(
      appt => new Date(appt.startTime) >= new Date(params.startDate!)
    );
  }

  if (params.endDate) {
    filteredAppointments = filteredAppointments.filter(
      appt => new Date(appt.startTime) <= new Date(params.endDate!)
    );
  }

  if (params.providerId) {
    filteredAppointments = filteredAppointments.filter(
      appt => appt.providerId === params.providerId
    );
  }

  if (params.patientId) {
    filteredAppointments = filteredAppointments.filter(
      appt => appt.patientId === params.patientId
    );
  }

  if (params.status) {
    filteredAppointments = filteredAppointments.filter(
      appt => appt.status === params.status
    );
  }

  if (params.room) {
    filteredAppointments = filteredAppointments.filter(
      appt => appt.room === params.room
    );
  }

  return NextResponse.json(filteredAppointments);
}

export async function POST(request: NextRequest) {
  await randomDelay();

  const body = await request.json();

  const newAppointment = {
    id: generateId(),
    ...body,
  };

  appointments.push(newAppointment);

  return NextResponse.json(newAppointment);
}

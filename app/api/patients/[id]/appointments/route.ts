import { NextRequest, NextResponse } from 'next/server';
import { appointments } from '@/mocks/data';
import { randomDelay } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const patientAppointments = appointments.filter(a => a.patientId === id);

  return NextResponse.json(patientAppointments);
}

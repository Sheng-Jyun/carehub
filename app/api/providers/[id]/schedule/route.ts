import { NextRequest, NextResponse } from 'next/server';
import { appointments } from '@/mocks/data';
import { randomDelay } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let providerAppointments = appointments.filter(a => a.providerId === id);

  if (startDate) {
    providerAppointments = providerAppointments.filter(
      a => new Date(a.startTime) >= new Date(startDate)
    );
  }

  if (endDate) {
    providerAppointments = providerAppointments.filter(
      a => new Date(a.startTime) <= new Date(endDate)
    );
  }

  return NextResponse.json(providerAppointments);
}

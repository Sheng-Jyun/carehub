import { NextRequest, NextResponse } from 'next/server';
import { appointments } from '@/mocks/data';
import { randomDelay } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const appointment = appointments.find(a => a.id === id);

  if (!appointment) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(appointment);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const body = await request.json();
  const index = appointments.findIndex(a => a.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  }

  appointments[index] = { ...appointments[index], ...body };

  return NextResponse.json(appointments[index]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const index = appointments.findIndex(a => a.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  }

  appointments.splice(index, 1);

  return NextResponse.json({ success: true });
}

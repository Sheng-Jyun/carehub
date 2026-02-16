import { NextRequest, NextResponse } from 'next/server';
import { patients } from '@/mocks/data';
import { randomDelay } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return NextResponse.json(
      { error: 'Patient not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(patient);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const body = await request.json();
  const index = patients.findIndex(p => p.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Patient not found' },
      { status: 404 }
    );
  }

  // Update patient
  patients[index] = { ...patients[index], ...body };

  return NextResponse.json(patients[index]);
}

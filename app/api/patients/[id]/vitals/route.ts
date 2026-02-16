import { NextRequest, NextResponse } from 'next/server';
import { vitalSigns } from '@/mocks/data';
import { randomDelay } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const patientVitals = vitalSigns.filter(v => v.patientId === id);

  return NextResponse.json(patientVitals);
}

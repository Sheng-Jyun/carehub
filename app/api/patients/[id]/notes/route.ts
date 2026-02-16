import { NextRequest, NextResponse } from 'next/server';
import { providerNotes } from '@/mocks/data';
import { randomDelay, generateId } from '@/lib/utils';
import { ProviderNote } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const patientNotes = providerNotes.filter(n => n.patientId === id);

  return NextResponse.json(patientNotes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const body = await request.json();

  const newNote: ProviderNote = {
    id: generateId(),
    patientId: id,
    providerId: body.providerId,
    providerName: body.providerName,
    date: new Date().toISOString(),
    type: body.type,
    content: body.content,
    isPrivate: body.isPrivate || false,
  };

  providerNotes.unshift(newNote);

  return NextResponse.json(newNote);
}

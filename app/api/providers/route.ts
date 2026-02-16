import { NextRequest, NextResponse } from 'next/server';
import { providers } from '@/mocks/data';
import { randomDelay } from '@/lib/utils';

export async function GET(request: NextRequest) {
  await randomDelay();

  return NextResponse.json(providers);
}

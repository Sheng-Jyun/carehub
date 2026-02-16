import { NextRequest, NextResponse } from 'next/server';
import { notifications } from '@/mocks/data';
import { randomDelay } from '@/lib/utils';

export async function GET(request: NextRequest) {
  await randomDelay();

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  await randomDelay();

  // Mark all as read
  notifications.forEach(notif => {
    notif.read = true;
  });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { notifications } from '@/mocks/data';
import { randomDelay } from '@/lib/utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await randomDelay();

  const { id } = await params;
  const notification = notifications.find(n => n.id === id);

  if (!notification) {
    return NextResponse.json(
      { error: 'Notification not found' },
      { status: 404 }
    );
  }

  notification.read = true;

  return NextResponse.json(notification);
}

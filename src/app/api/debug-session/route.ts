import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function GET() {
  const session = await auth();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    hasSession: !!session,
    session: session ? {
      user: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name
      }
    } : null
  });
}
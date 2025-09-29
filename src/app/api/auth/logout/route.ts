import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });

  return response;
}
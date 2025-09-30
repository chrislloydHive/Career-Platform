import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({
        error: 'No session found',
        hasSession: false
      }, { status: 401 });
    }

    if (!session.user?.id) {
      return NextResponse.json({
        error: 'No user ID in session',
        hasSession: true,
        user: session.user
      }, { status: 401 });
    }

    // Check if profile exists
    const profileCheck = await sql`
      SELECT user_id, name, bio, linkedin_url
      FROM user_profiles
      WHERE user_id = ${session.user.id}
    `;

    return NextResponse.json({
      hasSession: true,
      userId: session.user.id,
      userEmail: session.user.email,
      profileExists: profileCheck.rows.length > 0,
      profileData: profileCheck.rows[0] || null,
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const result = await createUser(email, password, name);

    if (!result.success) {
      console.error('Account creation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create account' },
        { status: 400 }
      );
    }

    console.log('Account created successfully:', { email, userId: result.userId });

    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
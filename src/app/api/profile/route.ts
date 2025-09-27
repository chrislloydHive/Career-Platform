import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, saveUserProfile } from '@/lib/storage/user-profile';

export async function GET() {
  try {
    const profile = await getUserProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    const profile = await getUserProfile();

    const updatedProfile = {
      ...profile,
      ...updates,
      lastUpdated: new Date()
    };

    await saveUserProfile(updatedProfile);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
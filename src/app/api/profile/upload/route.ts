import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const documentUrls: { type: string; url: string; filename: string }[] = [];

    // Upload resume
    const resume = formData.get('resume') as File | null;
    if (resume) {
      const blob = await put(`profiles/${session.user.id}/resume_${Date.now()}_${resume.name}`, resume, {
        access: 'public',
      });
      documentUrls.push({
        type: 'resume',
        url: blob.url,
        filename: resume.name,
      });
    }

    // Upload additional documents
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key.startsWith('doc_') && value instanceof File) {
        const blob = await put(`profiles/${session.user.id}/doc_${Date.now()}_${value.name}`, value, {
          access: 'public',
        });
        documentUrls.push({
          type: 'document',
          url: blob.url,
          filename: value.name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      documentUrls,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        error: 'Failed to upload files',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

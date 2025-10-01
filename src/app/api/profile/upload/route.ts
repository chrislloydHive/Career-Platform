import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload: Request received');

    const session = await auth();
    console.log('Upload: Session check result:', session ? 'Session found' : 'No session');

    if (!session?.user?.id) {
      console.error('Upload: No session found, returning 401');
      return NextResponse.json({ error: 'Please sign in to upload files' }, { status: 401 });
    }

    console.log('Upload: Starting upload for user', session.user.id);
    console.log('Upload: Checking for BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'Present' : 'MISSING');

    const formData = await request.formData();
    console.log('Upload: FormData parsed, entries:', Array.from(formData.keys()));

    const documentUrls: { type: string; url: string; filename: string }[] = [];

    // Upload resume
    const resume = formData.get('resume') as File | null;
    if (resume) {
      console.log('Upload: Uploading resume:', resume.name, 'Size:', resume.size, 'Type:', resume.type);

      const blob = await put(`profiles/${session.user.id}/resume_${Date.now()}_${resume.name}`, resume, {
        access: 'public',
      });

      console.log('Upload: Resume uploaded successfully:', blob.url);
      documentUrls.push({
        type: 'resume',
        url: blob.url,
        filename: resume.name,
      });
    } else {
      console.log('Upload: No resume file found in formData');
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

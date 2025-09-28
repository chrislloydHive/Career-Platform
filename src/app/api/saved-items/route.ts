import { NextRequest, NextResponse } from 'next/server';
import { getSavedItems, saveJob, saveCareer, removeSavedItem } from '@/lib/storage/saved-items-db';
import { auth } from '@/lib/auth/config';

export async function GET() {
  try {
    const items = await getSavedItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Failed to get saved items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve saved items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, item, notes, tags } = body;

    if (type === 'job') {
      const savedItem = await saveJob(item, notes, tags);

      if (typeof window !== 'undefined') {
        const { InteractionTracker } = await import('@/lib/adaptive-questions/interaction-tracker');
        InteractionTracker.trackJobSaved(item.title, {
          company: item.company,
        });
      }

      return NextResponse.json({ success: true, item: savedItem });
    } else if (type === 'career') {
      const savedItem = await saveCareer(item, notes, tags);

      if (typeof window !== 'undefined') {
        const { InteractionTracker } = await import('@/lib/adaptive-questions/interaction-tracker');
        InteractionTracker.trackCareerViewed(item.title, {
          industry: item.category,
        });
      }

      return NextResponse.json({ success: true, item: savedItem });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid item type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to save item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await removeSavedItem(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete saved item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
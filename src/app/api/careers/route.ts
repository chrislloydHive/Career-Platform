import { NextRequest, NextResponse } from 'next/server';
import { JobCategory } from '@/types/career';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const career = await request.json() as JobCategory;

    if (!career.title || !career.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const careersDir = path.join(process.cwd(), 'data', 'careers');

    try {
      await fs.access(careersDir);
    } catch {
      await fs.mkdir(careersDir, { recursive: true });
    }

    const fileName = `${career.id || `career-${Date.now()}`}.json`;
    const filePath = path.join(careersDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(career, null, 2), 'utf-8');

    const indexPath = path.join(careersDir, 'index.json');
    let careerIndex: string[] = [];

    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      careerIndex = JSON.parse(indexContent);
    } catch {
      careerIndex = [];
    }

    if (!careerIndex.includes(fileName)) {
      careerIndex.push(fileName);
      await fs.writeFile(indexPath, JSON.stringify(careerIndex, null, 2), 'utf-8');
    }

    return NextResponse.json({
      success: true,
      career,
      message: 'Career saved successfully'
    });
  } catch (error) {
    console.error('Error saving career:', error);
    return NextResponse.json(
      { error: 'Failed to save career' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const careersDir = path.join(process.cwd(), 'data', 'careers');
    const indexPath = path.join(careersDir, 'index.json');

    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const careerFiles = JSON.parse(indexContent) as string[];

      const careers: JobCategory[] = [];

      for (const fileName of careerFiles) {
        const filePath = path.join(careersDir, fileName);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          careers.push(JSON.parse(content));
        } catch (err) {
          console.error(`Error reading career file ${fileName}:`, err);
        }
      }

      return NextResponse.json({ careers });
    } catch {
      return NextResponse.json({ careers: [] });
    }
  } catch (error) {
    console.error('Error loading careers:', error);
    return NextResponse.json(
      { error: 'Failed to load careers' },
      { status: 500 }
    );
  }
}
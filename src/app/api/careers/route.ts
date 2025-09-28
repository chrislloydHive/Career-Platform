import { NextRequest, NextResponse } from 'next/server';
import { JobCategory } from '@/types/career';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth/config';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { careerId, activeTab } = await request.json();

    if (!careerId || !activeTab) {
      return NextResponse.json(
        { error: 'Career ID and active tab are required' },
        { status: 400 }
      );
    }

    await sql`
      UPDATE career_research
      SET active_tab = ${activeTab}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${careerId} AND user_id = ${session.user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating active tab:', error);
    return NextResponse.json(
      { error: 'Failed to update active tab' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const career = await request.json() as JobCategory;

    if (!career.title || !career.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const careerId = career.id || `career-${Date.now()}`;

    const salaryRange = career.salaryRanges?.[0]
      ? `$${career.salaryRanges[0].min.toLocaleString()} - $${career.salaryRanges[0].max.toLocaleString()}`
      : '';

    await sql`
      INSERT INTO career_research (
        id, user_id, title, description, category, salary_range, education_required,
        skills, work_life_balance, job_security, growth_potential, match_score,
        pros, cons, day_in_life, career_path, companies, resources,
        salary_ranges, career_progression, active_tab,
        alternative_titles, daily_tasks, industry_insights, work_environment,
        job_outlook, education, related_roles, keywords
      ) VALUES (
        ${careerId},
        ${session.user.id},
        ${career.title},
        ${career.description || ''},
        ${career.category || 'business'},
        ${salaryRange},
        ${career.education?.minimumDegree || ''},
        ${JSON.stringify(career.requiredSkills?.map(s => s.skill) || [])},
        ${0},
        ${0},
        ${0},
        ${0},
        ${JSON.stringify([])},
        ${JSON.stringify([])},
        ${JSON.stringify(career.dailyTasks?.map(t => t.task) || [])},
        ${JSON.stringify(career.careerProgression?.map(cp => cp.title) || [])},
        ${JSON.stringify([])},
        ${JSON.stringify({})},
        ${JSON.stringify(career.salaryRanges || [])},
        ${JSON.stringify(career.careerProgression || [])},
        ${'overview'},
        ${JSON.stringify(career.alternativeTitles || [])},
        ${JSON.stringify(career.dailyTasks || [])},
        ${JSON.stringify(career.industryInsights || [])},
        ${JSON.stringify(career.workEnvironment || {})},
        ${JSON.stringify(career.jobOutlook || {})},
        ${JSON.stringify(career.education || {})},
        ${JSON.stringify(career.relatedRoles || [])},
        ${JSON.stringify(career.keywords || [])}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        salary_range = EXCLUDED.salary_range,
        education_required = EXCLUDED.education_required,
        skills = EXCLUDED.skills,
        day_in_life = EXCLUDED.day_in_life,
        career_path = EXCLUDED.career_path,
        salary_ranges = EXCLUDED.salary_ranges,
        career_progression = EXCLUDED.career_progression,
        alternative_titles = EXCLUDED.alternative_titles,
        daily_tasks = EXCLUDED.daily_tasks,
        industry_insights = EXCLUDED.industry_insights,
        work_environment = EXCLUDED.work_environment,
        job_outlook = EXCLUDED.job_outlook,
        education = EXCLUDED.education,
        related_roles = EXCLUDED.related_roles,
        keywords = EXCLUDED.keywords,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({
      success: true,
      career: { ...career, id: careerId },
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM career_research
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    const careers: JobCategory[] = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      category: row.category || 'business',
      alternativeTitles: row.alternative_titles || [],
      dailyTasks: row.daily_tasks || [],
      requiredSkills: (row.skills || []).map((skill: string) => ({
        skill,
        category: 'technical' as const,
        importance: 'required' as const
      })),
      salaryRanges: row.salary_ranges || [],
      careerProgression: row.career_progression || [],
      industryInsights: row.industry_insights || [],
      workEnvironment: row.work_environment || {
        remote: false,
        hybrid: false,
        onsite: true,
        travelRequired: false,
        typicalHours: '40 hours/week'
      },
      jobOutlook: row.job_outlook || {
        growthRate: 'N/A',
        projectedJobs: 'N/A',
        competitionLevel: 'medium' as const
      },
      education: row.education || {
        minimumDegree: row.education_required || undefined,
        certifications: [],
        alternativePathways: []
      },
      relatedRoles: row.related_roles || [],
      keywords: row.keywords || [],
      activeTab: row.active_tab || 'overview'
    }));

    return NextResponse.json({ careers });
  } catch (error) {
    console.error('Error loading careers:', error);
    return NextResponse.json(
      { error: 'Failed to load careers' },
      { status: 500 }
    );
  }
}
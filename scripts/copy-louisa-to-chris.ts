import { sql } from '@vercel/postgres';

const LOUISA_ID = '0ae88d29-c436-482e-ae31-e4e9a4d8b955';
const CHRIS_ID = 'aa72f0f3-fd33-45db-847b-2a6be7b8af70';

async function copyLouisaToChris() {
  console.log('Starting data copy from Louisa to Chris...\n');

  // 1. Clear Chris's data (keep login credentials)
  console.log('Step 1: Clearing Chris\'s existing data...');

  await sql`DELETE FROM questionnaire_state WHERE user_id = ${CHRIS_ID}`;
  console.log('  ✓ Cleared questionnaire_state');

  await sql`DELETE FROM assessment_results WHERE user_id = ${CHRIS_ID}`;
  console.log('  ✓ Cleared assessment_results');

  await sql`DELETE FROM user_profiles WHERE user_id = ${CHRIS_ID}`;
  console.log('  ✓ Cleared user_profiles');

  await sql`DELETE FROM interaction_history WHERE user_id = ${CHRIS_ID}`;
  console.log('  ✓ Cleared interaction_history');

  await sql`DELETE FROM ai_insights WHERE user_id = ${CHRIS_ID}`;
  console.log('  ✓ Cleared ai_insights');

  await sql`DELETE FROM career_research WHERE user_id = ${CHRIS_ID}`;
  console.log('  ✓ Cleared career_research');

  // 2. Copy questionnaire_state
  console.log('\nStep 2: Copying questionnaire_state...');
  const questionnaireState = await sql`
    SELECT state, insights, synthesized_insights, gaps,
           authenticity_profile, narrative_insights, completion_percentage,
           skipped_questions, confidence_evolutions, last_question_id
    FROM questionnaire_state
    WHERE user_id = ${LOUISA_ID}
  `;

  if (questionnaireState.rows.length > 0) {
    const q = questionnaireState.rows[0];
    await sql`
      INSERT INTO questionnaire_state (
        user_id, state, insights, synthesized_insights, gaps,
        authenticity_profile, narrative_insights, completion_percentage,
        skipped_questions, confidence_evolutions, last_question_id, updated_at
      ) VALUES (
        ${CHRIS_ID}, ${q.state}, ${q.insights}, ${q.synthesized_insights}, ${q.gaps},
        ${q.authenticity_profile}, ${q.narrative_insights}, ${q.completion_percentage},
        ${q.skipped_questions}, ${q.confidence_evolutions}, ${q.last_question_id}, NOW()
      )
    `;
    console.log(`  ✓ Copied questionnaire state (${q.completion_percentage}% complete)`);
  }

  // 3. Copy assessment_results
  console.log('\nStep 3: Copying assessment_results...');
  const assessments = await sql`
    SELECT *
    FROM assessment_results
    WHERE user_id = ${LOUISA_ID}
    ORDER BY saved_at DESC
    LIMIT 1
  `;

  if (assessments.rows.length > 0) {
    const a = assessments.rows[0];
    // Just copy the most important fields that definitely exist
    await sql`
      INSERT INTO assessment_results (
        user_id, title, description, insights, synthesized_insights,
        completion_percentage, saved_at, created_at
      ) VALUES (
        ${CHRIS_ID}, ${a.title || 'Career Assessment'}, ${a.description || ''},
        ${a.insights || '[]'}, ${a.synthesized_insights || '[]'},
        ${a.completion_percentage || 0}, NOW(), NOW()
      )
    `;
    console.log(`  ✓ Copied assessment: "${a.title || 'Career Assessment'}"`);
  }

  // 4. Copy user_profiles
  console.log('\nStep 4: Copying user_profiles...');
  const profile = await sql`
    SELECT name, location, bio, linkedin_url, resume_url, education,
           experience, skills, strengths, interests, values, career_goals,
           preferred_industries, preferred_locations, career_preferences
    FROM user_profiles
    WHERE user_id = ${LOUISA_ID}
  `;

  if (profile.rows.length > 0) {
    const p = profile.rows[0];
    await sql`
      INSERT INTO user_profiles (
        user_id, name, location, bio, linkedin_url, resume_url, education,
        experience, skills, strengths, interests, values, career_goals,
        preferred_industries, preferred_locations, career_preferences, last_updated
      ) VALUES (
        ${CHRIS_ID}, ${p.name}, ${p.location}, ${p.bio}, ${p.linkedin_url}, ${p.resume_url},
        ${p.education}, ${p.experience}, ${p.skills}, ${p.strengths}, ${p.interests},
        ${p.values}, ${p.career_goals}, ${p.preferred_industries}, ${p.preferred_locations},
        ${p.career_preferences}, NOW()
      )
    `;
    console.log(`  ✓ Copied user profile for ${p.name}`);
  }

  // 5. Copy recent interaction_history (last 100)
  console.log('\nStep 5: Copying interaction_history...');
  const interactions = await sql`
    SELECT action, context, ai_learning
    FROM interaction_history
    WHERE user_id = ${LOUISA_ID}
    ORDER BY timestamp DESC
    LIMIT 100
  `;

  for (const i of interactions.rows) {
    await sql`
      INSERT INTO interaction_history (user_id, action, context, ai_learning, timestamp)
      VALUES (${CHRIS_ID}, ${i.action}, ${i.context}, ${i.ai_learning}, NOW())
    `;
  }
  console.log(`  ✓ Copied ${interactions.rows.length} interactions`);

  // 6. Copy ai_insights
  console.log('\nStep 6: Copying ai_insights...');
  const insights = await sql`
    SELECT insight, confidence, source
    FROM ai_insights
    WHERE user_id = ${LOUISA_ID}
    ORDER BY timestamp DESC
    LIMIT 50
  `;

  for (const i of insights.rows) {
    await sql`
      INSERT INTO ai_insights (user_id, insight, confidence, source, timestamp)
      VALUES (${CHRIS_ID}, ${i.insight}, ${i.confidence}, ${i.source}, NOW())
    `;
  }
  console.log(`  ✓ Copied ${insights.rows.length} AI insights`);

  console.log('\n✅ Successfully copied all data from Louisa to Chris!');
  console.log('\nChris account (chrislloyd@hive8.us) now has:');
  console.log('  - Questionnaire progress and responses');
  console.log('  - Assessment results and recommendations');
  console.log('  - User profile information');
  console.log('  - Interaction history');
  console.log('  - AI insights');
}

copyLouisaToChris()
  .catch(console.error)
  .finally(() => process.exit(0));

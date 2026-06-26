import { NextResponse } from 'next/server';
import { analyzeCode } from '@/lib/ai/provider';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If no user is found and we want to allow anonymous, we can bypass this.
    // For SaaS, usually we want authenticated users.
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, language, promptContent } = body;

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Fetch custom API key if present
    const { data: profile } = await supabase
      .from('users')
      .select('openai_api_key')
      .eq('id', user.id)
      .single();

    const userApiKey = profile?.openai_api_key || undefined;

    // Fetch API usage count for rate limiting
    const { data: usage } = await supabase
      .from('api_usage')
      .select('api_calls_count')
      .eq('user_id', user.id)
      .single();

    const callCount = usage?.api_calls_count || 0;

    // Enforce 50 review limit for default backend keys (Hobby Plan BYOK limit)
    if (callCount >= 50 && !userApiKey) {
      return NextResponse.json({ 
        error: 'Hobby Plan rate limit reached (50 reviews). To continue analyzing code, please bring your own OpenAI API Key in settings.' 
      }, { status: 429 });
    }

    // Call the AI Provider
    const reviewData = await analyzeCode(code, language, promptContent, userApiKey);

    // Save to Database
    const { data: review, error: dbError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        language: language,
        original_code: code,
        title: `${language} Review - ${new Date().toLocaleDateString()}`,
        score: reviewData.score,
        summary: reviewData.summary,
        improved_code: reviewData.improved_code,
        overall_feedback: reviewData.overall_feedback,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database Error (reviews table):', dbError);
    }

    // Save Findings to Database
    if (review) {
      const findingsToInsert: any[] = [];

      if (Array.isArray(reviewData.bugs)) {
        reviewData.bugs.forEach(bug => {
          findingsToInsert.push({
            review_id: review.id,
            category: 'bug',
            severity: bug.severity || 'Medium',
            title: bug.title,
            description: bug.description,
            how_to_fix: bug.how_to_fix,
            line_number: bug.line_number
          });
        });
      }

      if (Array.isArray(reviewData.security)) {
        reviewData.security.forEach(sec => {
          findingsToInsert.push({
            review_id: review.id,
            category: 'security',
            severity: sec.severity || 'High',
            title: sec.title,
            description: sec.description,
            how_to_fix: sec.how_to_fix
          });
        });
      }

      if (Array.isArray(reviewData.performance)) {
        reviewData.performance.forEach(perf => {
          findingsToInsert.push({
            review_id: review.id,
            category: 'performance',
            severity: 'Medium',
            title: perf.title,
            description: perf.description,
            how_to_fix: perf.how_to_fix
          });
        });
      }

      if (Array.isArray(reviewData.style)) {
        reviewData.style.forEach(style => {
          findingsToInsert.push({
            review_id: review.id,
            category: 'style',
            severity: 'Low',
            title: style.title,
            description: style.description
          });
        });
      }

      if (Array.isArray(reviewData.refactoring)) {
        reviewData.refactoring.forEach(ref => {
          findingsToInsert.push({
            review_id: review.id,
            category: 'refactoring',
            severity: 'Low',
            title: ref.title,
            description: ref.description
          });
        });
      }

      if (Array.isArray(reviewData.documentation)) {
        reviewData.documentation.forEach(doc => {
          findingsToInsert.push({
            review_id: review.id,
            category: 'documentation',
            severity: 'Low',
            title: doc.title,
            description: doc.description
          });
        });
      }

      if (findingsToInsert.length > 0) {
        const { error: findingsError } = await supabase
          .from('review_findings')
          .insert(findingsToInsert);

        if (findingsError) {
          console.error('Database Error (review_findings table):', findingsError);
        }
      }
    }

    // Increment API Usage
    try {
      const { data: usage } = await supabase
        .from('api_usage')
        .select('id, api_calls_count')
        .eq('user_id', user.id)
        .single()

      if (usage) {
        await supabase
          .from('api_usage')
          .update({
            api_calls_count: (usage.api_calls_count || 0) + 1,
            last_call_at: new Date().toISOString()
          })
          .eq('id', usage.id)
      } else {
        await supabase
          .from('api_usage')
          .insert({
            user_id: user.id,
            api_calls_count: 1,
            last_call_at: new Date().toISOString()
          })
      }
    } catch (e) {
      console.error('Failed to log API usage:', e)
    }

    // Return the review payload and the reviewId for redirection
    return NextResponse.json({
      reviewId: review?.id,
      ...reviewData,
    });

  } catch (error: unknown) {
    console.error('API /review Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

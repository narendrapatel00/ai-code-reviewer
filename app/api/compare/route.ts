import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export interface AICompareResponse {
  summary: string;
  improvements: string[];
  regressions: string[];
  bugs: string[];
  whatChanged: string[];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldCode, newCode, language } = await request.json();

    if (!oldCode || !newCode || !language) {
      return NextResponse.json({ error: 'Old code, new code, and language are required' }, { status: 400 });
    }

    // Fetch custom API key if present
    const { data: profile } = await supabase
      .from('users')
      .select('openai_api_key')
      .eq('id', user.id)
      .single();

    const userApiKey = profile?.openai_api_key || undefined;
    const apiKey = userApiKey || process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'placeholder_openai_api_key' || apiKey === 'placeholder_groq_api_key') {
      return NextResponse.json(generateMockCompareResponse(language));
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const prompt = `
You are an expert Senior Software Engineer and Code Reviewer.
Compare the following two versions of the code (Old vs New):

Old Code:
${oldCode}

New Code:
${newCode}

Language: ${language}

Analyze the changes and return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown):
{
  "summary": "Brief summary of the changes",
  "improvements": [
    "List of improvements made in the new version"
  ],
  "regressions": [
    "List of regressions, potential degradation of quality, or lost functionality"
  ],
  "bugs": [
    "List of potential bugs or edge cases introduced by the changes"
  ],
  "whatChanged": [
    "List of specific logical or syntax changes"
  ]
}
`;

    const models = [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
    ];

    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await openai.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No content returned from AI');

        const data = parseJSONResponse(content) as AICompareResponse;
        return NextResponse.json(data);
      } catch (error) {
        console.warn(`Groq Model ${model} compare failed. Error:`, error);
        lastError = error;
      }
    }

    throw new Error('All Groq models failed for version comparison');
  } catch (error: any) {
    console.error('API /compare Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function parseJSONResponse(rawContent: string): any {
  let cleaned = rawContent.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '');
    cleaned = cleaned.replace(/\n?```$/, '');
    cleaned = cleaned.trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Invalid JSON format returned from AI model');
  }
}

function generateMockCompareResponse(language: string): AICompareResponse {
  return {
    summary: `Version comparison for the ${language} code highlights architectural refactoring and minor performance changes.`,
    improvements: [
      "Extracted long code block into a separate modular function, improving testability.",
      "Replaced imperative loops with clean array map/filter operations.",
      "Added strict TypeScript interface types to input parameters."
    ],
    regressions: [
      "Removed error fallback handler which was present in the old code block.",
      "Reduced API logging verbosity, which could make remote debugging slightly harder."
    ],
    bugs: [
      "Possible race condition: the map asynchronous promises are not properly awaited in the revised code.",
      "Potential memory leak: event listener is registered in useEffect but not cleaned up in the return callback."
    ],
    whatChanged: [
      "Modified function signature to accept type arguments.",
      "Removed inline config parameters, extracting them to a shared helper constant.",
      "Updated UI list return elements to pass unique keys."
    ]
  };
}

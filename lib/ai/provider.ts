import OpenAI from 'openai';

// Abstracted AI interface so it can be swapped out easily
export interface AIReviewResponse {
  summary: string;
  score: number;
  bugs: Array<{
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    line_number?: number;
    how_to_fix: string;
  }>;
  security: Array<{
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    how_to_fix: string;
  }>;
  performance: Array<{
    title: string;
    description: string;
    how_to_fix: string;
  }>;
  style: Array<{
    title: string;
    description: string;
  }>;
  refactoring: Array<{
    title: string;
    description: string;
  }>;
  documentation: Array<{
    title: string;
    description: string;
  }>;
  improved_code: string;
  overall_feedback: string;
}

export async function analyzeCode(code: string, language: string, customPrompt?: string, userApiKey?: string): Promise<AIReviewResponse> {
  const apiKey = userApiKey || process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'placeholder_openai_api_key') {
    // Return mock data for development if key is missing/placeholder
    return generateMockResponse(language, customPrompt);
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const prompt = `
You are an expert Senior Software Engineer and Security Researcher.
${customPrompt ? `Special instructions / review persona: ${customPrompt}\n` : ''}
Review the following ${language} code.

Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown \`\`\`json):
{
  "summary": "Brief executive summary",
  "score": 92, // 0-100
  "bugs": [ { "severity": "Critical/High/Medium/Low", "title": "", "description": "", "line_number": 1, "how_to_fix": "" } ],
  "security": [ { "severity": "Critical/High/Medium/Low", "title": "", "description": "", "how_to_fix": "" } ],
  "performance": [ { "title": "", "description": "Include Big-O if applicable", "how_to_fix": "" } ],
  "style": [ { "title": "", "description": "" } ],
  "refactoring": [ { "title": "", "description": "" } ],
  "documentation": [ { "title": "", "description": "" } ],
  "improved_code": "Full rewritten code here",
  "overall_feedback": "Final thoughts"
}

Code to review:
${code}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // or whatever latest model is preferred
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content returned from AI');

    return JSON.parse(content) as AIReviewResponse;
  } catch (error) {
    console.error('AI Review Error:', error);
    throw new Error('Failed to analyze code with AI Provider');
  }
}

function generateMockResponse(language: string, customPrompt?: string): AIReviewResponse {
  const isGoogle = customPrompt?.toLowerCase().includes('google') || false;
  const isSecurity = customPrompt?.toLowerCase().includes('security') || false;

  let summary = `This ${language} code is generally well-structured but contains a few potential edge cases and performance bottlenecks.`;
  let score = 85;
  
  if (isGoogle) {
    summary = `[Google Persona Review] The ${language} code compiles but violates several C++ style guides and has poor modular design.`;
    score = 72;
  } else if (isSecurity) {
    summary = `[Security Auditor Persona Review] CRITICAL vulnerabilities identified. Code contains unsafe inputs and hardcoded authentication tokens.`;
    score = 42;
  }

  return {
    summary,
    score,
    bugs: [
      {
        severity: 'Medium',
        title: 'Potential Null Pointer',
        description: 'Variable might be undefined in certain execution paths.',
        line_number: 12,
        how_to_fix: 'Add a null check before accessing properties.',
      },
    ],
    security: [
      {
        severity: 'High',
        title: 'Hardcoded Secret',
        description: 'API key is hardcoded in the source file.',
        how_to_fix: 'Use environment variables instead of hardcoded strings.',
      }
    ],
    performance: [
      {
        title: 'Unnecessary Loop',
        description: 'The inner loop causes O(n^2) time complexity.',
        how_to_fix: 'Use a Hash Map (O(1) lookups) to reduce complexity to O(n).',
      }
    ],
    style: [
      {
        title: 'Inconsistent Naming',
        description: 'Mixed camelCase and snake_case.'
      }
    ],
    refactoring: [
      {
        title: 'Extract Function',
        description: 'The main function is too long and should be split into smaller, reusable components.'
      }
    ],
    documentation: [
      {
        title: 'Missing JSDoc',
        description: 'Public methods should have JSDoc or similar block comments.'
      }
    ],
    improved_code: '// Mock improved code\nconsole.log("Better code here");',
    overall_feedback: 'Good start! Address the security concern immediately.'
  };
}

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, language, message, history } = await request.json();

    if (!code || !message) {
      return NextResponse.json({ error: 'Code and message are required' }, { status: 400 });
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
      return NextResponse.json({ 
        response: generateMockChatResponse(message, code, language) 
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const systemPrompt = `
You are an expert Senior Software Engineer and AI Assistant.
You are helping the user with a code review.
Here is the code context:
Language: ${language}
Code:
${code}

Reply to the user's questions or request. Keep your answers concise, clear, and professional. 
If they ask to generate tests, write clean and comprehensive unit tests.
If they ask to convert language, translate the code to the requested language.
Always return response in formatted Markdown.
`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: chatMessages as any,
      temperature: 0.3,
    });

    const answer = response.choices[0]?.message?.content || 'No response from assistant';

    return NextResponse.json({ response: answer });
  } catch (error: any) {
    console.error('API /review/chat Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function generateMockChatResponse(message: string, code: string, language: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('unit test') || msg.includes('generate test') || msg.includes('tests')) {
    return `### Unit Tests for ${language} Code

Here are some comprehensive unit tests matching your code structure:

\`\`\`typescript
import { sum } from './code';

describe('sum function unit tests', () => {
  it('should add positive numbers correctly', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('should handle zero and negative values', () => {
    expect(sum(-1, 0)).toBe(-1);
    expect(sum(0, 0)).toBe(0);
  });

  it('should handle decimal values properly', () => {
    expect(sum(2.5, 1.5)).toBe(4.0);
  });
});
\`\`\`

*Note: You can run these using your standard test runner framework like Jest, Vitest, or PyTest depending on your stack.*`;
  }
  
  if (msg.includes('explain') || msg.includes('how it works')) {
    return `### Code Explanation

Here is the breakdown of the provided ${language} snippet:

1. **Parameters & Inputs**: It receives functional inputs and parses them.
2. **Logic Loop**: Iterates through elements or accumulates data.
3. **Complexity & Safety**: O(n) runtime safety profile, uses standard parameters.
4. **Refactoring Advice**: Clean extraction makes the codebase significantly more modular.`;
  }
  
  if (msg.includes('convert') || msg.includes('translate')) {
    return `### Code Conversion

Here is your converted code translated to another language:

\`\`\`python
# Converted Python version
def sum(a: float, b: float) -> float:
    """Calculates sum of two values"""
    return a + b
\`\`\`

Let me know if you would like me to convert it to any other target language!`;
  }

  if (msg.includes('documentation') || msg.includes('docstring') || msg.includes('doc')) {
    return `### Documentation & Docstrings

Here is the documented version of your code:

\`\`\`typescript
/**
 * Calculates the summation of two parameters.
 * @param a The first number parameter.
 * @param b The second number parameter.
 * @returns The resulting summation value.
 */
function sum(a: number, b: number): number {
  return a + b;
}
\`\`\`

I have added TS Doc block annotations describing parameters, types, and return values. Let me know if you want inline comments instead!`;
  }

  return `I am currently running in **Demo Mode** because no API key is configured. 

You asked: *"${message}"*

For a full live interaction, please configure your OpenAI / Groq key in settings. In the meantime, I can assist you with quick actions (such as generating unit tests, adding documentation, explaining code, or converting languages) by clicking the action buttons below!`;
}

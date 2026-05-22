import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are TeachWise AI, an expert Australian F-6 teaching assistant.

You can create lesson plans, rubrics, report comments, parent emails, sub plans, newsletters, differentiation supports, alignment checks, quizzes, IEP progress notes, and behaviour notes.

Always match the teacher's requested tool. Use Australian school language, growth-focused phrasing, and practical classroom detail.

For structured outputs, use clear headings and concise sections:
- Lesson Plan: Overview, Lesson Sequence, Assessment, Differentiation
- Report Comments: one card per student with Can do now and Next step
- Email Draft: To, Subject, Body, Actions
- Sub Plan: timeline with times, activities, materials, notes
- Rubric: criteria table using markdown
- Alignment Check: visual diff table with Standard, Evidence, Gap, Fix

When a year level, subject, or state is supplied, honour it. Prefer Australian Curriculum v9 references where relevant.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface TeacherPrefs {
  name?: string;
  yearLevel?: string;
  subject?: string;
  state?: string;
}

type MiniMaxContentPart = {
  type?: string;
  text?: string;
};

function extractTextContent(content: unknown): string {
  if (!Array.isArray(content)) return String(content ?? '');

  const textParts: string[] = [];
  for (const item of content as MiniMaxContentPart[]) {
    if (item.type === 'text' && item.text) textParts.push(item.text);
  }
  return textParts.join('\n\n');
}

function buildPrompt(messages: Message[], teacherPrefs: TeacherPrefs, tool?: string, tone?: string) {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const history = messages
    .slice(-8, -1)
    .map((m) => `${m.role === 'user' ? 'Teacher' : 'TeachWise'}: ${m.content}`)
    .join('\n\n');

  const context = [
    teacherPrefs.name ? `Teacher: ${teacherPrefs.name}` : '',
    teacherPrefs.yearLevel ? `Year level: ${teacherPrefs.yearLevel}` : '',
    teacherPrefs.subject ? `Subject: ${teacherPrefs.subject}` : '',
    teacherPrefs.state ? `State: ${teacherPrefs.state}` : '',
    tool ? `Active tool: ${tool}` : '',
    tone ? `Tone: ${tone}` : '',
  ].filter(Boolean).join('\n');

  return [
    context ? `Teacher context:\n${context}` : '',
    history ? `Recent conversation:\n${history}` : '',
    `Current request:\n${lastMsg}`,
  ].filter(Boolean).join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const { messages, teacherPrefs, customSystemPrompt, tool, tone } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { response: 'AI configuration error. Please add MINIMAX_API_KEY in Vercel or your local environment.' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        max_tokens: 4096,
        system: customSystemPrompt || SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt(messages, teacherPrefs || {}, tool, tone) }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', response.status, errorText);
      return NextResponse.json({
        response: "I'm having trouble connecting to my AI right now. You can still use the local templates and exports.",
      });
    }

    const data = await response.json();
    const aiResponse = extractTextContent(data.content) ||
      "I'm ready. Paste the content or choose a command and I will shape it into a teacher-ready output.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({
      response: 'Something went wrong on my end. Please try again.',
    });
  }
}

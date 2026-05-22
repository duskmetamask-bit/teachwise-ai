import { NextRequest, NextResponse } from 'next/server';
import { TEACHWISE_SYSTEM_PROMPT, buildAc9Context, buildTeacherContextBlock, defaultLessonBlocks } from '@/app/lib/teachwise-ai';
import { callMiniMax, extractTextContent } from '@/app/lib/minimax';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blockType, yearLevel, subject, topic, currentContent } = body;

    if (!blockType) {
      return NextResponse.json({ error: 'Missing block type' }, { status: 400 });
    }

    const blockTemplates = defaultLessonBlocks();
    const template = blockTemplates.find((item) => item.type === blockType);

    const prompt = [
      buildTeacherContextBlock({
        yearLevel,
        subject,
        state: body?.teacherPrefs?.state,
        name: body?.teacherPrefs?.name,
        className: body?.classContext?.className,
      }),
      buildAc9Context(subject, yearLevel, topic || currentContent || ''),
      `Generate or refine a ${template?.label || blockType} block for a teacher lesson plan.`,
      currentContent ? `Current content:\n${currentContent}` : '',
      `Return only the block content. Be practical, specific, and ready to paste into a plan.`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await callMiniMax({
      system: TEACHWISE_SYSTEM_PROMPT,
      prompt,
      maxTokens: 1000,
      temperature: 0.45,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({ response: extractTextContent(data.content) });
  } catch (error) {
    console.error('Lesson block error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}


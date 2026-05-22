import { NextRequest, NextResponse } from 'next/server';
import { TEACHWISE_SYSTEM_PROMPT, buildAc9Context, buildTeacherContextBlock, extractAc9Codes } from '@/app/lib/teachwise-ai';
import { callMiniMax, extractTextContent } from '@/app/lib/minimax';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body.data || body;
    const yearLevel = data?.yearLevel;
    const subject = data?.subject;
    const topic = data?.topic;
    const duration = data?.duration || '4-6 weeks';
    const lessons = data?.lessons || 8;

    if (!yearLevel || !subject || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = [
      buildTeacherContextBlock({
        yearLevel,
        subject,
        state: body?.teacherPrefs?.state,
        name: body?.teacherPrefs?.name,
        className: body?.classContext?.className,
        learnerMix: {
          eald: body?.classContext?.esalD,
          aboveLevel: body?.classContext?.aboveLevel,
          support: body?.classContext?.support,
        },
        topicsCovered: body?.classContext?.topicsCovered,
        specificNeeds: body?.classContext?.specificNeeds,
      }),
      buildAc9Context(subject, yearLevel, topic),
      `Create a complete Australian F-6 unit plan for ${yearLevel} ${subject} on "${topic}".`,
      `Duration: ${duration}`,
      `Target lesson count: ${lessons}`,
      `Structure the response using markdown headings for overview, AC9 alignment, WALT, TIB, WILF, lesson sequence, assessment, differentiation, and resources.`,
      `Make it practical, classroom-ready, and easy for a teacher to edit.`,
    ].join('\n\n');

    const response = await callMiniMax({
      system: TEACHWISE_SYSTEM_PROMPT,
      prompt,
      maxTokens: 5000,
      temperature: 0.4,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { plan: `I'm having trouble generating your unit plan right now. ${errorText}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const plan = extractTextContent(result.content) || 'I could not generate a plan just now.';

    return NextResponse.json({
      plan,
      metadata: {
        ac9Codes: extractAc9Codes(plan),
      },
    });
  } catch (error) {
    console.error('Plan generation error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}


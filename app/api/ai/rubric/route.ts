import { NextRequest, NextResponse } from 'next/server';
import { TEACHWISE_SYSTEM_PROMPT, buildAc9Context, buildTeacherContextBlock, parseRubricTable, extractAc9Codes } from '@/app/lib/teachwise-ai';
import { callMiniMax, extractTextContent } from '@/app/lib/minimax';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { yearLevel, subject, topic, rubricType = 'analytic', levelCount = 4 } = body;

    if (!yearLevel || !subject || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = [
      buildTeacherContextBlock({
        yearLevel,
        subject,
        state: body?.teacherPrefs?.state,
        name: body?.teacherPrefs?.name,
      }),
      buildAc9Context(subject, yearLevel, topic),
      `Create a ${rubricType} assessment rubric for Year ${yearLevel} ${subject} on "${topic}".`,
      `Use ${levelCount} levels.`,
      `Return the rubric as a markdown table and make descriptors observable, specific, and teacher-friendly.`,
    ].join('\n\n');

    const response = await callMiniMax({
      system: TEACHWISE_SYSTEM_PROMPT,
      prompt,
      maxTokens: 2200,
      temperature: 0.35,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: 502 });
    }

    const data = await response.json();
    const responseText = extractTextContent(data.content) || 'Could not generate rubric.';
    const parsedTable = parseRubricTable(responseText);

    return NextResponse.json({
      response: responseText,
      parsedTable,
      ac9Codes: extractAc9Codes(responseText),
    });
  } catch (error) {
    console.error('Rubric generation error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}


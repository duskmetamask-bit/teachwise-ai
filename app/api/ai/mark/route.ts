import { NextRequest, NextResponse } from 'next/server';
import { TEACHWISE_SYSTEM_PROMPT, parseMarkingResponse } from '@/app/lib/teachwise-ai';
import { callMiniMax, extractTextContent } from '@/app/lib/minimax';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentText, rubricText, rubric, studentName } = body;

    if (!studentText || !rubricText) {
      return NextResponse.json({ error: 'Missing student work or rubric' }, { status: 400 });
    }

    const prompt = [
      `Mark the student work against the rubric below.`,
      studentName ? `Student: ${studentName}` : '',
      `Student work:\n${studentText}`,
      `Rubric:\n${rubricText}`,
      `Return a concise, criterion-by-criterion marking result with overall grade, strengths, areas for development, and next steps.`,
      `Use markdown headings exactly for: Overall Grade, Criterion-by-Criterion Feedback, Strengths, Areas for Development, Next Steps.`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await callMiniMax({
      system: TEACHWISE_SYSTEM_PROMPT,
      prompt: rubric ? `${prompt}\n\nLinked rubric context:\n${rubric}` : prompt,
      maxTokens: 2600,
      temperature: 0.25,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: 502 });
    }

    const data = await response.json();
    const responseText = extractTextContent(data.content) || 'Could not mark work.';

    return NextResponse.json({
      response: responseText,
      parsed: parseMarkingResponse(responseText),
    });
  } catch (error) {
    console.error('Marking error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { TEACHWISE_SYSTEM_PROMPT, buildAc9Context, buildTeacherContextBlock } from '@/app/lib/teachwise-ai';
import { callMiniMax, extractTextContent } from '@/app/lib/minimax';

export async function POST(req: NextRequest) {
  try {
    const { messages, teacherPrefs, classContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const history = messages
      .slice(0, -1)
      .map((message: { role: string; content: string }) => `${message.role === 'user' ? 'Teacher' : 'TeachWise'}: ${message.content}`)
      .join('\n\n');

    const prompt = [
      buildTeacherContextBlock({
        name: teacherPrefs?.name,
        yearLevel: teacherPrefs?.yearLevel,
        subject: teacherPrefs?.subject,
        state: teacherPrefs?.state,
        schoolName: teacherPrefs?.schoolName,
        className: classContext?.className || teacherPrefs?.className,
        learnerMix: {
          eald: classContext?.esalD,
          aboveLevel: classContext?.aboveLevel,
          support: classContext?.support,
        },
        topicsCovered: classContext?.topicsCovered,
        specificNeeds: classContext?.specificNeeds,
      }),
      buildAc9Context(teacherPrefs?.subject, teacherPrefs?.yearLevel, lastMessage?.content || ''),
      history ? `Previous conversation:\n${history}\n\n` : '',
      `Current request:\n${lastMessage?.content || ''}`,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await callMiniMax({
      system: TEACHWISE_SYSTEM_PROMPT,
      prompt,
      maxTokens: 3500,
      temperature: 0.35,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { response: `I'm having trouble connecting to TeachWise AI right now. ${errorText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const responseText = extractTextContent(data.content) || 'I am ready to help. What are you working on?';

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { response: 'Something went wrong on my end. Please try again.' },
      { status: 500 }
    );
  }
}


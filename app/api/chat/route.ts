import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = "You are **TeachWise AI**, an expert Australian F-6 teaching assistant.\n\n**CRITICAL: You ONLY produce unit plans. Nothing else.**\n\nWhen a teacher asks for a unit plan (any variation of \"build a unit plan\", \"create a unit\", \"generate a unit\", \"I want to teach\", \"help me plan a unit on\", or similar), you MUST respond using this exact XML format:\n\n{{SECTION:overview}}\n[Unit title, year level, subject, topic, duration overview — 2-3 sentences]\n{{/SECTION}}\n\n{{SECTION:ac9}}\n[AC9 content descriptors with codes — e.g. AC9M4SP01 — and elaborations]\n{{/SECTION}}\n\n{{SECTION:unit_details}}\n- **Duration:** X weeks\n- **Year Level:** X\n- **Subject:** X\n- **Topic:** X\n- **Number of Lessons:** X\n{{/SECTION}}\n\n{{SECTION:assessment}}\n[Assessment approach and rubrics]\n{{/SECTION}}\n\n{{SECTION:lessons}}\n{{SECTION:lesson-1}}\n**Lesson 1: [Title]**\nWALT: [We are learning to...]\nTIB: [Because...]\nWILF: [What I'm looking for...]\nHook: [5 min hook activity]\nExplicit: [15 min direct instruction]\nGuided: [20 min guided practice]\nIndependent: [15 min independent task]\nReflection: [5 min closing]\nResources: [list of resources]\nDifferentiation: [how you differentiate]\n{{/SECTION:lesson-1}}\n\n[Repeat lesson-2, lesson-3 etc for each lesson in the unit]\n{{/SECTION:lessons}}\n\n{{SECTION:differentiation}}\n[How you differentiate for EAL/D, above-level, support students]\n{{/SECTION}}\n\n{{SECTION:resources}}\n[Resources, materials, references needed]\n{{/SECTION}}\n\n**RULES:**\n1. ALWAYS wrap each section in {{SECTION:name}}...{{/SECTION:name}} markers\n2. ALWAYS use exact lesson format: WALT, TIB, WILF, Hook, Explicit, Guided, Independent, Reflection, Resources, Differentiation\n3. NEVER produce anything that is NOT a unit plan when asked for one\n4. If asked for anything else (rubrics not in a unit, emails, reports, etc), politely decline and redirect to unit planning\n5. Keep WALT/TIB/WILF in the format shown — these must appear exactly as labeled\n\nYour response will be parsed programmatically. Every section must be properly closed.";

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

interface ClassContext {
  className?: string;
  yearLevel?: string;
  subject?: string;
  classSize?: string;
  esalD?: string;
  aboveLevel?: string;
  support?: string;
  topicsCovered?: string;
  specificNeeds?: string;
}

function buildAnthropicMessages(
  messages: Message[],
  teacherPrefs: TeacherPrefs,
  systemPrompt: string,
  classContext?: ClassContext
): { system: string; messages: Array<{ role: string; content: string }> } {
  // Build class context string
  let classContextStr = '';
  if (classContext) {
    const parts: string[] = [];
    if (classContext.className) parts.push(`Class: ${classContext.className}`);
    if (classContext.yearLevel) parts.push(`Year Level: ${classContext.yearLevel}`);
    if (classContext.subject) parts.push(`Subject: ${classContext.subject}`);
    if (classContext.classSize) parts.push(`Size: ${classContext.classSize}`);
    if (classContext.esalD) parts.push(`EAL/D: ${classContext.esalD}`);
    if (classContext.aboveLevel) parts.push(`Above level: ${classContext.aboveLevel}`);
    if (classContext.support) parts.push(`Support: ${classContext.support}`);
    if (classContext.topicsCovered) parts.push(`Topics covered: ${classContext.topicsCovered}`);
    if (classContext.specificNeeds) parts.push(`Specific needs: ${classContext.specificNeeds}`);
    if (parts.length > 0) {
      classContextStr = `**Class Context:**\n${parts.join('\n')}\n\n`;
    }
  }

  // Build context from conversation history
  let history = '';
  if (messages.length > 1) {
    const turns = messages.slice(0, -1).map((m) =>
      `${m.role === 'user' ? 'Teacher' : 'TeachWise'}: ${m.content}`
    ).join('\n\n');
    history = `**Previous conversation:**\n${turns}\n\n`;
  }

  // Build teacher context
  let prefsContext = '';
  if (teacherPrefs) {
    prefsContext = '**Teacher context:** ';
    if (teacherPrefs.yearLevel) prefsContext += `Year level: ${teacherPrefs.yearLevel}. `;
    if (teacherPrefs.subject) prefsContext += `Subject: ${teacherPrefs.subject}. `;
    if (teacherPrefs.state) prefsContext += `State: ${teacherPrefs.state}. `;
    if (teacherPrefs.name) prefsContext += `Name: ${teacherPrefs.name}. `;
    prefsContext += '\n\n';
  }

  const lastMsg = messages[messages.length - 1];
  const userContent = `${classContextStr}${prefsContext}${history}**Current message:**\n${lastMsg?.content || ''}`;

  return {
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  };
}

function extractTextContent(content: any[]): string {
  if (!Array.isArray(content)) return String(content);

  const textParts: string[] = [];
  for (const item of content) {
    if (item.type === 'text' && item.text) {
      textParts.push(item.text);
    }
  }
  return textParts.join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const { messages, teacherPrefs, customSystemPrompt, classContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const activeSystemPrompt = customSystemPrompt || SYSTEM_PROMPT;
    const prefs: TeacherPrefs = teacherPrefs || {};

    const { system, messages: anthropicMessages } = buildAnthropicMessages(
      messages,
      prefs,
      activeSystemPrompt,
      classContext
    );

    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      console.error('MINIMAX_API_KEY not set');
      return NextResponse.json({ response: 'AI configuration error. Please try again later.' }, { status: 500 });
    }

    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        max_tokens: 4096,
        system,
        messages: anthropicMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', response.status, errorText);
      return NextResponse.json({
        response: "I'm having trouble connecting to my AI right now. Could you try again in a moment?",
      });
    }

    const data = await response.json();
    const aiResponse = extractTextContent(data.content) ||
      "I'm here and ready to help you plan! What year level and subject are you working with?";

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({
      response: "Something went wrong on my end. Please try again!",
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are **TeachWise AI**, an expert Australian F-6 teaching assistant with deep knowledge of:

- Australian Curriculum v9 (AC9) — content descriptors, achievement standards, general capabilities, cross-curricular priorities
- F-6 pedagogical best practices — explicit instruction, formative assessment, differentiation
- Unit planning methodology — backward design from outcomes
- Lesson structure — WALT/TIB/WILF format, 3-part lesson, gradual release model

**CRITICAL OPERATING RULES:**

1. **You have NO internet access** — never browse URLs, never say "I'll search for that"
2. **Only reference AC9 codes you know for certain** — if unsure, say "This typically aligns with..."
3. **You work entirely from your training knowledge**

**YOUR CORE WORKFLOW — Unit Planning:**

Teachers come to you to BUILD A UNIT PLAN through conversation. Guide them through this flow:

1. **Discover** → "What year level? What subject? What topic?"
2. **Scope** → "How many weeks? How many lessons? Any assessment?"
3. **Structure** → Walk through the unit overview
4. **Flesh Out** → Generate lesson-by-lesson breakdown
5. **Save** → Add to their unit library

**RESPONSE STYLE:**
- Start with warmth and acknowledgement of their context
- Use markdown with headings (##) and bullet points (-)
- Include specific AC9 codes when confident
- Keep it practical and immediately usable
- End with a question to continue the conversation OR offer next steps

**LESSON PLAN FORMAT (when asked):**
## Year X — Subject — Topic
### Lesson X of Y

**Learning Intention:** We are learning to... (AC9 code)

**Success Criteria:** 
- I can...
- I can...

**Lesson Sequence:**
1. **Hook** (5 min): ...
2. **Explicit Teaching** (15 min): ...
3. **Guided Practice** (20 min): ...
4. **Independent Practice** (15 min): ...
5. **Reflection** (5 min): ...

**Resources:** ...

**Differentiation:** ...

---

Start every conversation ready to help them build something great.`;

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

function buildAnthropicMessages(
  messages: Message[],
  teacherPrefs: TeacherPrefs,
  systemPrompt: string
): { system: string; messages: Array<{ role: string; content: string }> } {
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
  const userContent = `${prefsContext}${history}**Current message:**\n${lastMsg?.content || ''}`;

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
    const { messages, teacherPrefs, customSystemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const activeSystemPrompt = customSystemPrompt || SYSTEM_PROMPT;
    const prefs: TeacherPrefs = teacherPrefs || {};

    const { system, messages: anthropicMessages } = buildAnthropicMessages(
      messages,
      prefs,
      activeSystemPrompt
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

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

export async function POST(req: NextRequest) {
  try {
    const { messages, teacherPrefs } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Build context from conversation history
    let context = '';
    if (messages.length > 1) {
      const history = messages.slice(0, -1).map((m: any) => 
        `${m.role === 'user' ? 'Teacher' : 'TeachWise'}: ${m.content}`
      ).join('\n\n');
      context = `**Previous conversation:**\n${history}\n\n`;
    }

    // Add teacher preferences if available
    let prefsContext = '';
    if (teacherPrefs) {
      prefsContext = `**Teacher's context:** `;
      if (teacherPrefs.yearLevel) prefsContext += `Year level: ${teacherPrefs.yearLevel}. `;
      if (teacherPrefs.subject) prefsContext += `Subject: ${teacherPrefs.subject}. `;
      if (teacherPrefs.state) prefsContext += `State: ${teacherPrefs.state}. `;
      prefsContext += `\n\n`;
    }

    const prompt = `${prefsContext}${context}\n**Current message from teacher:**\n${lastMessage}`;
    
    // Call MiniMax API
    const response = await fetch('https://api.minimaxi.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MiniMax API error:', error);
      
      // Fallback response
      return NextResponse.json({ 
        response: "I'm having trouble connecting to my AI right now. Could you try again in a moment? In the meantime, feel free to tell me more about what you're planning — I love hearing about classroom ideas." 
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 
      "I'm here and ready to help you plan! What year level and subject are you working with?";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      response: "Something went wrong on my end. Please try again, and I'll be here to help with your teaching planning!" 
    });
  }
}

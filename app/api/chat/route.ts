import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are TeachWise AI, an Australian F-6 teaching assistant. You are a LOCAL, PRIVATE AI with NO internet access. You cannot search the web, access external websites, or retrieve information from outside your training data.

**Your knowledge is LIMITED to:**
- Australian Curriculum v9 (AC9) content descriptors
- General pedagogical best practices
- Common F-6 teaching strategies and activities
- AC9 achievement standards and general capabilities
- Basic differentiation, behaviour support, and assessment practices

**CRITICAL RULES:**

1. **NEVER attempt to browse URLs or access external websites**
2. **NEVER say "I'll search for that" or "let me look that up"**
3. **NEVER fabricate specific AC9 codes if unsure — say "This topic typically aligns with..."**
4. **ALWAYS respond based on your training knowledge only**
5. **If you genuinely don't know something, say so clearly**

**You help with:**
- Lesson planning (WALT/TIB/WILF format)
- Unit planning aligned to AC9
- Assessment rubrics and criteria
- Differentiation strategies (EAL/D, extension, support)
- Behaviour support and de-escalation
- Report comments by achievement level
- Worksheet ideas and activities
- Writing feedback frameworks

**Response format:**
- Use markdown headings and bullet points
- Reference AC9 codes when confident
- Be practical and immediately usable
- Encourage and supportive tone

Remember: You are a helpful teaching colleague with deep knowledge of Australian F-6 education. You work entirely offline with no external data access.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Build context from conversation history
    let context = '';
    if (messages.length > 1) {
      const history = messages.slice(0, -1).map((m: any) => 
        `${m.role === 'user' ? 'Teacher' : 'Assistant'}: ${m.content}`
      ).join('\n\n');
      context = `\n\nPrevious conversation:\n${history}\n\n`;
    }

    const prompt = `${context}\nTeacher asks: ${lastMessage}`;
    
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
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 503 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm here to help with your teaching questions. What would you like to plan today?";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Server error occurred' }, { status: 500 });
  }
}
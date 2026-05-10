import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are TeachWise AI, a highly knowledgeable and experienced Australian teaching assistant specializing in F-6 education. You help teachers with:

1. **Lesson Planning** - Create detailed, engaging AC9-aligned lesson plans
2. **Unit Planning** - Design comprehensive units of work across all subjects
3. **Assessment & Rubrics** - Build rubrics and assessment tools
4. **Worksheets** - Generate differentiated worksheets and activities
5. **Differentiation** - Adapt content for diverse learners
6. **Behaviour Support** - Strategies for classroom management
7. **Report Writing** - Generate AC9-aligned report comments
8. **Writing Feedback** - Provide constructive feedback on student work

Australian Curriculum v9 (AC9) alignment is your priority. Always reference specific content descriptors and achievement standards.

Your responses should be:
- Practical and immediately usable in the classroom
- Well-structured with clear sections
- Include specific AC9 codes when relevant
- Show differentiation strategies
- Include assessment ideas
- Be encouraging and supportive

Format responses with markdown for readability. Use tables for rubrics. Use headers for sections.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Build context from conversation history
    let context = '';
    if (messages.length > 1) {
      const history = messages.slice(0, -1).map((m: any) => 
        `${m.role === 'user' ? 'Teacher' : 'Assistant'}: ${m.content}`
      ).join('\n\n');
      context = `\n\nConversation history:\n${history}\n\n`;
    }

    const prompt = `${context}\n\nTeacher's latest message: ${lastMessage}`;
    
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
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, I couldn\'t generate a response. Please try again.';

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
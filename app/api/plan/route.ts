import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are **TeachWise AI**, an expert Australian F-6 teaching assistant with deep knowledge of the Australian Curriculum v9 (AC9).

When generating a UNIT PLAN, produce a complete, structured document in this format:

## [Year Level] — [Subject] — [Topic] Unit Plan

### Unit Overview
[Brief 2-3 sentence description of the unit, its purpose, and what students will gain]

### AC9 Alignment
- Content Descriptor: [AC9 code and description]
- Elaboration: [Specific classroom example]
- General Capabilities: [List relevant capabilities]

### Unit Duration
[X weeks] — [X lessons]

### WALT (We Are Learning To)
[Clear, student-friendly learning intention aligned to AC9]

### TIB (This Is Because)
[Explanation of why this learning matters — real-world application]

### WILF (What I'm Looking For)
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

### Lesson Sequence

**Lesson 1: [Title]**
- WALT: [Learning intention]
- Success Criteria: [3-4 checkable criteria]
- Hook (5 min): [Engaging opening activity]
- Explicit Teaching (15 min): [Direct instruction content]
- Guided Practice (20 min): [Structured group activity]
- Independent Practice (15 min): [Individual application task]
- Reflection (5 min): [Exit ticket or summative check]
- Resources: [List required materials]
- Differentiation: [Extension and support strategies]

**Lesson 2: [Title]**
[Same structure as above]

**Lesson 3: [Title]**
[Same structure as above]

**Lesson 4: [Title]**
[Same structure as above]

[Continue for total lesson count based on duration]

### Assessment
- **Formative**: [How you'll check understanding during the unit]
- **Summative**: [End-of-unit task or assessment instrument]
- **Success Criteria**: [Rubric or checklist]

### Differentiation
**For Students Who Need Support:**
- [Strategy 1]
- [Strategy 2]

**For Students Who Need Extension:**
- [Strategy 1]
- [Strategy 2]

### Resources
- [Resource 1]
- [Resource 2]
- [Links or references]

### Reflection Notes
[Space for teacher to note what worked well and what to adjust next time]

Use specific AC9 codes where relevant. Make lessons practical and immediately usable in an Australian classroom.`;

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    if (type !== 'one-shot') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const { yearLevel, subject, topic, duration } = data;

    if (!yearLevel || !subject || !topic || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine lesson count from duration
    let lessonCount = 4;
    if (duration === '1-2 weeks') lessonCount = 4;
    else if (duration === '3-4 weeks') lessonCount = 6;
    else if (duration === '5-6 weeks') lessonCount = 8;
    else if (duration === 'Term-long') lessonCount = 10;

    const prompt = `Generate a complete ${duration} unit plan for ${yearLevel} ${subject} on the topic of "${topic}". The unit should contain approximately ${lessonCount} lessons. Follow the format exactly as specified in your system prompt.`;

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
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MiniMax API error:', error);
      return NextResponse.json({ plan: "I'm having trouble generating your unit plan right now. Please try again." }, { status: 200 });
    }

    const result = await response.json();
    const plan = result.choices?.[0]?.message?.content || "I'm having trouble generating your unit plan right now. Please try again.";

    // Extract AC9 codes from the plan
    const ac9Codes = plan.match(/AC9[A-Z0-9]+/gi) || [];

    return NextResponse.json({
      plan,
      metadata: {
        ac9Codes: Array.from(new Set(ac9Codes.map((c: string) => c.toUpperCase()))),
        lessonCount,
      }
    });
  } catch (error) {
    console.error('Plan generation error:', error);
    return NextResponse.json({ plan: "Something went wrong. Please try again." }, { status: 200 });
  }
}
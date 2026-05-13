import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

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

function buildMmxMessages(
  messages: Message[],
  teacherPrefs: TeacherPrefs,
  systemPrompt: string
): string[] {
  const args: string[] = [];

  // Add system prompt
  args.push(`system: ${systemPrompt}`);

  // Add teacher context
  let prefsLine = 'system: Teacher context: ';
  if (teacherPrefs.yearLevel) prefsLine += `Year level: ${teacherPrefs.yearLevel}. `;
  if (teacherPrefs.subject) prefsLine += `Subject: ${teacherPrefs.subject}. `;
  if (teacherPrefs.state) prefsLine += `State: ${teacherPrefs.state}. `;
  args.push(prefsLine);

  // Add conversation history (skip last message - that's the new input)
  for (let i = 0; i < messages.length - 1; i++) {
    const m = messages[i];
    const role = m.role === 'user' ? 'user' : 'assistant';
    args.push(`${role}: ${m.content}`);
  }

  // Add the new message
  const lastMsg = messages[messages.length - 1];
  if (lastMsg) {
    args.push(`user: ${lastMsg.content}`);
  }

  return args;
}

function parseMmxOutput(stdout: string): string {
  try {
    const data = JSON.parse(stdout);
    // Find text content in the response
    const contents = data.content || [];
    for (const item of contents) {
      if (item.type === 'text' && item.text) {
        return item.text;
      }
    }
    // Fallback: if no text type found, try to extract any text
    const textMatch = stdout.match(/"text"\s*:\s*"([^"]+)"/);
    if (textMatch) {
      return textMatch[1];
    }
    return "I couldn't generate a response. Please try again.";
  } catch {
    // If JSON parsing fails, return raw stdout
    if (stdout.trim()) {
      return stdout.trim();
    }
    return "Something went wrong. Please try again.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, teacherPrefs, customSystemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const activeSystemPrompt = customSystemPrompt || SYSTEM_PROMPT;
    const prefs: TeacherPrefs = teacherPrefs || {};

    // Build mmx command args
    const mmxArgs = buildMmxMessages(messages, prefs, activeSystemPrompt);

    // Build the mmx command
    const mmxCommand = ['text', 'chat', '--output', 'json', '--max-tokens', '4000', '--temperature', '0.7'];

    // Add each message as a --message flag
    for (const arg of mmxArgs) {
      mmxCommand.push('--message', arg);
    }

    // Execute mmx via child_process
    const mmxPath = '/home/dusk/.npm-global/bin/mmx';
    
    return new Promise<NextResponse>((resolve) => {
      const proc = spawn(mmxPath, mmxCommand, {
        timeout: 60000,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          console.error('mmx error:', stderr || `exit code ${code}`);
          resolve(NextResponse.json({ 
            response: "I'm having trouble connecting to my AI right now. Could you try again in a moment?" 
          }));
          return;
        }

        const response = parseMmxOutput(stdout);
        resolve(NextResponse.json({ response }));
      });

      proc.on('error', (err) => {
        console.error('mmx spawn error:', err);
        resolve(NextResponse.json({ 
          response: "Something went wrong on my end. Please try again!" 
        }));
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        proc.kill();
        resolve(NextResponse.json({ 
          response: "Request timed out. Please try again." 
        }));
      }, 60000);
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      response: "Something went wrong on my end. Please try again!" 
    });
  }
}
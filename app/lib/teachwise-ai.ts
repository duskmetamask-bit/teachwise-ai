import { findAc9Matches } from './ac9';
import { MarkingResponse, LessonBlock } from './types';

export const TEACHWISE_SYSTEM_PROMPT = `You are TeachWise, the trusted senior-teacher co-pilot for Australian F-6 classrooms.

Priorities:
- Classroom-first, not compliance-first.
- Remove friction, protect teacher time, and always be clear about what is teacher editable.
- Be practical, warm, concise, and specific.
- Use Australian curriculum language where relevant, but never hide behind jargon.
- When asked for planning, marking, rubrics, parent communication, differentiation, or classroom routines, help with the actual work.

Voice:
- Calm, capable, respectful.
- Senior teacher energy, never hype.
- Prefer direct answer first, then optional detail.

Output rules:
- Format responses cleanly in markdown.
- For structured tasks, return only the requested structure.
- Never pretend certainty about AC9 if the code is not in the provided context. Use the provided AC9 references when available.`;

export function buildTeacherContextBlock({
  name,
  yearLevel,
  subject,
  state,
  schoolName,
  className,
  learnerMix,
  topicsCovered,
  specificNeeds,
}: {
  name?: string;
  yearLevel?: string;
  subject?: string;
  state?: string;
  schoolName?: string;
  className?: string;
  learnerMix?: { eald?: string; aboveLevel?: string; support?: string };
  topicsCovered?: string;
  specificNeeds?: string;
}) {
  const lines = [
    name ? `Teacher: ${name}` : '',
    state ? `State: ${state}` : '',
    schoolName ? `School: ${schoolName}` : '',
    className ? `Class: ${className}` : '',
    yearLevel ? `Year level: ${yearLevel}` : '',
    subject ? `Subject: ${subject}` : '',
    learnerMix?.eald ? `EAL/D: ${learnerMix.eald}` : '',
    learnerMix?.aboveLevel ? `Above level: ${learnerMix.aboveLevel}` : '',
    learnerMix?.support ? `Support: ${learnerMix.support}` : '',
    topicsCovered ? `Topics recently covered: ${topicsCovered}` : '',
    specificNeeds ? `Specific needs: ${specificNeeds}` : '',
  ].filter(Boolean);

  return lines.length > 0 ? `Teacher context:\n${lines.join('\n')}\n\n` : '';
}

export function buildAc9Context(subject?: string, yearLevel?: string, topic?: string) {
  if (!subject && !yearLevel && !topic) {
    return '';
  }

  const matches = findAc9Matches(subject || '', yearLevel || '', topic || '').slice(0, 5);

  if (matches.length === 0) {
    return '';
  }

  return `AC9 references:\n${matches
    .map((item) => `- ${item.code}: ${item.descriptor} (${item.subject} ${item.yearLevel})`)
    .join('\n')}\n\n`;
}

export function makeLessonBlock(type: LessonBlock['type'], content = ''): LessonBlock {
  const labels: Record<LessonBlock['type'], string> = {
    learning_intention: 'Learning Intention',
    success_criteria: 'Success Criteria',
    hook: 'Hook',
    explicit_teaching: 'Explicit Teaching',
    guided_practice: 'Guided Practice',
    independent_practice: 'Independent Practice',
    reflection: 'Reflection',
    resources: 'Resources',
    differentiation: 'Differentiation',
  };

  return {
    id: `block_${Math.random().toString(36).slice(2, 8)}`,
    type,
    label: labels[type],
    content,
    generated: Boolean(content),
  };
}

export function defaultLessonBlocks() {
  return [
    makeLessonBlock('learning_intention', 'We are learning to...'),
    makeLessonBlock('success_criteria', 'I can...\nI can...\nI can...'),
    makeLessonBlock('hook', ''),
    makeLessonBlock('explicit_teaching', 'Timing:\nKey points:'),
    makeLessonBlock('guided_practice', 'Timing:\nActivities:'),
    makeLessonBlock('independent_practice', 'Timing:\nTask:'),
    makeLessonBlock('reflection', 'Exit ticket / reflection question:'),
    makeLessonBlock('resources', 'Resources needed:'),
    makeLessonBlock('differentiation', 'Extension:\nSupport:'),
  ];
}

export function parseMarkingResponse(text: string): MarkingResponse {
  const result: MarkingResponse = {
    overallGrade: '',
    criteria: [],
    strengths: [],
    areasForDevelopment: [],
    nextSteps: [],
  };

  const overallMatch = text.match(/##\s*Overall\s*Grade:\s*([A-D])/i);
  if (overallMatch) {
    result.overallGrade = overallMatch[1].toUpperCase();
  }

  const criterionMatches = [...text.matchAll(/\*\*([^*]+)\*\*\s*—\s*([A-D](?:\s*\([^)]+\))?)\n([\s\S]*?)(?=\n\*\*[^*]+\*\*\s*—|###\s*Strengths|###\s*Areas|###\s*Next|$)/gi)];
  result.criteria = criterionMatches.map((match) => ({
    name: match[1].trim(),
    grade: match[2].trim(),
    feedback: match[3].trim(),
  }));

  const strengthsBlock = text.match(/###\s*Strengths\s*\n([\s\S]*?)(?=###\s*Areas|###\s*Next|$)/i);
  if (strengthsBlock) {
    result.strengths = [...strengthsBlock[1].matchAll(/[-•]\s*([^\n]+)/g)].map((match) => match[1].trim());
  }

  const areasBlock = text.match(/###\s*Areas\s*(?:for\s*)?Development\s*\n([\s\S]*?)(?=###\s*Next|$)/i);
  if (areasBlock) {
    result.areasForDevelopment = [...areasBlock[1].matchAll(/[-•]\s*([^\n]+)/g)].map((match) => match[1].trim());
  }

  const nextBlock = text.match(/###\s*Next\s*Steps\s*\n([\s\S]*?)$/i);
  if (nextBlock) {
    result.nextSteps = [...nextBlock[1].matchAll(/\d+\.\s*([^\n]+)/g)].map((match) => match[1].trim());
  }

  return result;
}

export function parseRubricTable(text: string) {
  const lines = text.split('\n');
  const tableLines = lines.filter((line) => line.includes('|') && line.trim().startsWith('|'));
  if (tableLines.length < 2) {
    return null;
  }

  const rows = tableLines
    .filter((line) => !line.includes('---'))
    .map((line) => line.split('|').map((cell) => cell.trim()).filter(Boolean));

  if (rows.length < 2) {
    return null;
  }

  return {
    headers: rows[0],
    rows: rows.slice(1),
  };
}

export function extractAc9Codes(text: string) {
  return Array.from(new Set((text.match(/AC9[A-Z0-9]+/gi) || []).map((code) => code.toUpperCase())));
}

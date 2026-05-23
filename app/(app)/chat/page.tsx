'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  Bot,
  BookOpenCheck,
  Clipboard,
  Copy,
  Download,
  FileClock,
  FileDown,
  GripVertical,
  Lightbulb,
  Mail,
  MonitorSmartphone,
  PanelRightOpen,
  PenLine,
  Rocket,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Table2,
  TimerReset,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  AuthSessionSummary,
  EmailActionLog,
  SavedOutputRecord,
  TeacherPrefs,
  WorkspaceApiSnapshot,
  WorkspaceMessage,
  WorkspaceSnapshot,
} from '@/app/lib/types';

const STORAGE_KEY = 'teachwise_prefs';
const HISTORY_KEY = 'teachwise_premium_history';
const LOG_KEY = 'teachwise_email_action_logs';
const SAVED_OUTPUTS_KEY = 'teachwise_saved_outputs';
const WORKSPACE_ENDPOINT = '/api/workspace';
const DEFAULT_PREFS: TeacherPrefs = { name: '', yearLevel: '', subject: '', state: 'WA' };

type CommandId = 'plan' | 'rubric' | 'report' | 'email' | 'quiz' | 'sub' | 'differentiate' | 'align' | 'newsletter' | 'iep' | 'behaviour';
type IntentType = 'Concern' | 'Absence' | 'Request' | 'General' | 'Complaint';
type Tone = 'Warm' | 'Formal' | 'Brief';
type OutputKind = 'lesson' | 'rubric' | 'report' | 'email' | 'sub' | 'quiz' | 'align' | 'newsletter' | 'differentiate' | 'iep' | 'behaviour' | 'generic';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface StudentReport {
  id: string;
  name: string;
  subject: string;
  comment: string;
}

interface EmailAction {
  id: string;
  label: string;
  checked: boolean;
}

interface EmailDraft {
  intent: IntentType;
  tone: Tone;
  to: string;
  subject: string;
  body: string;
  student: string;
  className: string;
  actions: EmailAction[];
}

interface OutputCard {
  id: string;
  kind: OutputKind;
  title: string;
  subtitle: string;
  content: string;
  createdAt: Date;
  reports?: StudentReport[];
  email?: EmailDraft;
}

type EmailLog = EmailActionLog & { intentType: IntentType };

const commands: Array<{ id: CommandId; command: string; label: string; hint: string; kind: OutputKind }> = [
  { id: 'plan', command: '/plan', label: 'Lesson Plan', hint: 'Build an AC9-aligned lesson or unit plan', kind: 'lesson' },
  { id: 'rubric', command: '/rubric', label: 'Rubric', hint: 'Create an editable achievement rubric', kind: 'rubric' },
  { id: 'report', command: '/report', label: 'Report Writer', hint: 'Turn assessment notes into growth comments', kind: 'report' },
  { id: 'email', command: '/email', label: 'Email Router', hint: 'Detect intent, draft reply, and log actions', kind: 'email' },
  { id: 'quiz', command: '/quiz', label: 'Question Bank', hint: 'Generate quiz cards with answers', kind: 'quiz' },
  { id: 'sub', command: '/sub', label: 'Sub Plan', hint: 'Create a time-stamped relief teacher plan', kind: 'sub' },
  { id: 'differentiate', command: '/differentiate', label: 'Differentiation', hint: 'Create support, core, and extension tiers', kind: 'differentiate' },
  { id: 'align', command: '/align', label: 'Alignment Check', hint: 'Compare lesson evidence to standards', kind: 'align' },
  { id: 'newsletter', command: '/newsletter', label: 'Newsletter', hint: 'Draft a weekly family update', kind: 'newsletter' },
  { id: 'iep', command: '/iep', label: 'IEP Notes', hint: 'Structure progress evidence for IEP goals', kind: 'iep' },
  { id: 'behaviour', command: '/behaviour', label: 'Behaviour Notes', hint: 'Create card and CSV-ready behaviour notes', kind: 'behaviour' },
];

const polishOptions = ['Make it briefer', 'Add detail', 'Add Blooms tags', 'Australian format'];
const recentSubjects = ['English', 'Science', 'Mathematics', 'HASS'];
const smartRuns = [
  { title: 'Parent concern reply', note: 'Intent detect, draft, log, export', icon: Mail },
  { title: 'Report sprint', note: 'Paste notes and generate polished comments', icon: FileClock },
  { title: 'Relief plan handover', note: 'Turn tomorrow into a timed sub plan', icon: TimerReset },
];
const teacherSignals = [
  { label: 'Focus', value: 'Report Writer', icon: Rocket },
  { label: 'Ready next', value: 'Email log export', icon: Table2 },
  { label: 'Mode', value: 'Split workspace', icon: MonitorSmartphone },
];
const shortcutHints = ['Cmd K', 'Cmd Enter', 'Cmd E', 'Arrow Up'];

function loadPrefs(): TeacherPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '') || DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as Message[];
    return parsed.map((message) => ({ ...message, timestamp: new Date(message.timestamp) }));
  } catch {
    return [];
  }
}

function loadLogs(): EmailLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as EmailLog[];
  } catch {
    return [];
  }
}

function loadSavedOutputs(): SavedOutputRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_OUTPUTS_KEY) || '[]') as SavedOutputRecord[];
  } catch {
    return [];
  }
}

function normalisePrefs(prefs?: Partial<TeacherPrefs>): TeacherPrefs {
  return {
    ...DEFAULT_PREFS,
    ...(prefs || {}),
  };
}

function rehydrateMessages(items?: WorkspaceMessage[]): Message[] {
  return (items || []).map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
  }));
}

function serialiseMessages(items: Message[]): WorkspaceMessage[] {
  return items.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  }));
}

function hasWorkspaceData(snapshot: Partial<WorkspaceSnapshot>) {
  return Boolean(
    snapshot.messages?.length ||
    snapshot.savedOutputs?.length ||
    snapshot.emailLogs?.length ||
    snapshot.prefs?.name ||
    snapshot.prefs?.yearLevel ||
    snapshot.prefs?.subject
  );
}

function normaliseFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'teachwise-export';
}

function detectCommand(input: string): (typeof commands)[number] {
  const explicit = commands.find((item) => input.trim().toLowerCase().startsWith(item.command));
  if (explicit) return explicit;
  const lower = input.toLowerCase();
  if (/parent|dear|email|absence|complaint|concern/.test(lower)) return commands.find((c) => c.id === 'email')!;
  if (/report|student|assessment|percentage|rubric score|term/.test(lower)) return commands.find((c) => c.id === 'report')!;
  if (/standard|ac9|align|descriptor/.test(lower)) return commands.find((c) => c.id === 'align')!;
  if (/relief|sub plan|substitute/.test(lower)) return commands.find((c) => c.id === 'sub')!;
  if (/quiz|question bank|test/.test(lower)) return commands.find((c) => c.id === 'quiz')!;
  return commands.find((c) => c.id === 'plan')!;
}

function detectSuggestion(input: string) {
  if (!input.trim()) return null;
  const lower = input.toLowerCase();
  if (/dear|parent|email|absence|complaint|concern/.test(lower)) return 'Handle this email? Y/N';
  if (/score|rubric|assessment|student|percent|grade/.test(lower)) return 'Write report comments? Y/N';
  if (/lesson|unit|learning intention|success criteria/.test(lower)) return 'Generate lesson plan? Y/N';
  return null;
}

function detectIntent(text: string): IntentType {
  const lower = text.toLowerCase();
  if (/complaint|unacceptable|angry|upset|disappointed|escalate/.test(lower)) return 'Complaint';
  if (/absent|absence|sick|away|appointment/.test(lower)) return 'Absence';
  if (/can you|could you|request|please provide|meeting/.test(lower)) return 'Request';
  if (/concern|worried|struggling|issue|behaviour|behavior/.test(lower)) return 'Concern';
  return 'General';
}

function inferStudentName(text: string) {
  const patterns = [
    /student[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /about\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /\b([A-Z][a-z]+)\s+(?:has|is|was|needs|scored)\b/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return 'Student';
}

function plainTextForOutput(output: OutputCard) {
  if (output.reports?.length) {
    return output.reports.map((report) => `${report.name} - ${report.subject}\n${report.comment}`).join('\n\n');
  }
  if (output.email) {
    return `To: ${output.email.to}\nSubject: ${output.email.subject}\n\n${output.email.body}`;
  }
  return `${output.title}\n${output.subtitle}\n\n${output.content}`;
}

function buildReportCards(text: string, prefs: TeacherPrefs): StudentReport[] {
  const subject = prefs.subject || 'English';
  const multiMatch = text.match(/for\s+(.+?)(?:\s+with\b|[.,\n]|$)/i);
  const extractedNames = multiMatch
    ? multiMatch[1]
        .split(/,| and | & | \/ /i)
        .map((name) => name.trim())
        .filter((name) => /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/.test(name) && !/^(year|english|mathematics|science|hass|teacher)$/i.test(name))
    : [];
  const names = Array.from(new Set([
    ...extractedNames,
    ...(text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?(?=\s+(?:scored|has|is|needs|achieved|demonstrated))/g) || []),
  ]));
  const fallbackNames = names.length ? names : [inferStudentName(text)];

  return fallbackNames.slice(0, 8).map((name, index) => ({
    id: `${Date.now()}-${index}`,
    name,
    subject,
    comment: `${name} has demonstrated a developing ability to apply key ${subject.toLowerCase()} skills with increasing confidence. ${name.split(' ')[0]} can now identify important ideas, explain thinking using subject vocabulary, and contribute thoughtfully during class tasks. The next step is to strengthen accuracy and independence by checking work against the success criteria before submitting. With continued practice, ${name.split(' ')[0]} is well placed to make steady progress next term.`,
  }));
}

function buildEmailDraft(text: string, tone: Tone, prefs: TeacherPrefs): EmailDraft {
  const intent = detectIntent(text);
  const student = inferStudentName(text);
  const firstName = student.split(' ')[0];
  const toneOpeners: Record<Tone, string> = {
    Warm: 'Thank you for getting in touch. I appreciate you sharing this with me.',
    Formal: 'Thank you for your email. I acknowledge the information you have provided.',
    Brief: 'Thanks for your email.',
  };
  const body = `Dear Parent/Carer,\n\n${toneOpeners[tone]}\n\nI will follow up regarding ${firstName} and make sure the relevant information is checked against our class records. If helpful, I am also happy to arrange a short meeting so we can agree on the next best step together.\n\nKind regards,\n${prefs.name || 'Class Teacher'}`;

  return {
    intent,
    tone,
    to: 'Parent/Carer',
    subject: `${intent}: ${student}`,
    body,
    student,
    className: prefs.yearLevel ? `Year ${prefs.yearLevel} ${prefs.subject || ''}`.trim() : prefs.subject || 'Class',
    actions: [
      { id: 'meeting', label: 'Schedule meeting', checked: intent === 'Complaint' || intent === 'Concern' },
      { id: 'records', label: 'Log to records', checked: true },
      { id: 'specialist', label: 'Flag for specialist', checked: intent === 'Concern' },
    ],
  };
}

function fallbackContent(kind: OutputKind, text: string, prefs: TeacherPrefs) {
  const year = prefs.yearLevel ? `Year ${prefs.yearLevel}` : 'Year level';
  const subject = prefs.subject || 'Subject';
  if (kind === 'sub') {
    return `8:50 - Welcome and roll\nSettle students, explain the day, and display the learning intention.\n\n9:10 - Explicit teaching\nRevise key vocabulary for ${subject}. Use the provided examples and check for understanding.\n\n9:35 - Independent task\nStudents complete the main activity. Early finishers add detail or explain their reasoning.\n\n10:20 - Reflection\nStudents share one success and one question for the regular teacher.`;
  }
  if (kind === 'align') {
    return `| Standard | Evidence in plan | Gap | Fix |\n| --- | --- | --- | --- |\n| AC9 descriptor | ${text.slice(0, 80) || 'Provided lesson evidence'} | Needs clearer assessment evidence | Add an exit ticket linked to the success criteria |\n| Achievement standard | Students practise core skill | Differentiation not visible | Add support, core, and extension tasks |`;
  }
  if (kind === 'rubric') {
    return `| Criteria | Emerging | Developing | Proficient | Extending |\n| --- | --- | --- | --- | --- |\n| Understanding | Identifies simple ideas | Explains key ideas | Applies concepts accurately | Transfers learning to new contexts |\n| Communication | Uses limited vocabulary | Uses some ${subject} vocabulary | Explains clearly | Justifies choices with evidence |`;
  }
  if (kind === 'quiz') {
    return `1. What is the key idea in this topic?\nAnswer: Students should identify the central concept and explain it in their own words.\n\n2. Which example best shows the learning intention?\nAnswer: The example that uses evidence and correct subject vocabulary.\n\n3. How could you improve your response?\nAnswer: Add detail, check accuracy, and connect to the success criteria.`;
  }
  if (kind === 'differentiate') {
    return `Support: Provide sentence starters, visuals, partner rehearsal, and a worked example.\n\nCore: Students complete the main task independently using the success criteria.\n\nExtension: Students justify their thinking, create a new example, and explain transfer to a new context.`;
  }
  return `${year} - ${subject}\n\nLearning Intention\nWe are learning to understand and apply the key ideas in this topic.\n\nSuccess Criteria\n- I can explain the main concept in my own words.\n- I can use subject vocabulary accurately.\n- I can show my thinking with evidence.\n\nLesson Sequence\n1. Hook: quick prompt or image stimulus.\n2. Explicit teaching: model the skill.\n3. Guided practice: complete an example together.\n4. Independent task: students apply the skill.\n5. Reflection: exit ticket linked to the success criteria.`;
}

function createOutput(kind: OutputKind, content: string, prompt: string, prefs: TeacherPrefs, tone: Tone): OutputCard {
  const titleByKind: Record<OutputKind, string> = {
    lesson: 'Lesson Plan',
    rubric: 'Rubric',
    report: 'Report Comments',
    email: 'Email Draft',
    sub: 'Sub Plan',
    quiz: 'Question Bank',
    align: 'Alignment Check',
    newsletter: 'Weekly Newsletter',
    differentiate: 'Differentiation Plan',
    iep: 'IEP Progress Notes',
    behaviour: 'Behaviour Notes',
    generic: 'TeachWise Output',
  };
  const finalContent = content.trim() || fallbackContent(kind, prompt, prefs);
  return {
    id: `${Date.now()}`,
    kind,
    title: titleByKind[kind],
    subtitle: `${prefs.yearLevel ? `Year ${prefs.yearLevel}` : 'Teaching'} ${prefs.subject || 'workspace'}`,
    content: finalContent,
    createdAt: new Date(),
    reports: kind === 'report' ? buildReportCards(prompt, prefs) : undefined,
    email: kind === 'email' ? buildEmailDraft(prompt, tone, prefs) : undefined,
  };
}

async function exportDocx(output: OutputCard) {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
  const children = [
    new Paragraph({ text: output.title, heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: output.subtitle, italics: true })] }),
    new Paragraph({ text: '' }),
  ];

  if (output.reports?.length) {
    output.reports.forEach((report) => {
      children.push(
        new Paragraph({ text: `${report.name} - ${report.subject}`, heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun(report.comment)] }),
        new Paragraph({ text: '' })
      );
    });
  } else if (output.email) {
    children.push(
      new Paragraph({ text: `To: ${output.email.to}` }),
      new Paragraph({ text: `Subject: ${output.email.subject}` }),
      new Paragraph({ text: '' }),
      ...output.email.body.split('\n').map((line) => new Paragraph({ text: line }))
    );
  } else {
    finalLines(output.content).forEach((line) => {
      children.push(new Paragraph({ text: line }));
    });
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${normaliseFileName(output.title)}.docx`);
}

async function exportPdf(output: OutputCard) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  const titleFont = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const margin = 54;
  let page = pdf.addPage([595, 842]);
  let y = 780;
  page.drawText(output.title, { x: margin, y, size: 19, font: titleFont, color: rgb(0.08, 0.08, 0.16) });
  y -= 28;
  page.drawText(output.subtitle, { x: margin, y, size: 10, font: bodyFont, color: rgb(0.28, 0.3, 0.38) });
  y -= 28;

  const lines = plainTextForOutput(output).split('\n').flatMap((line) => wrapLine(line, 88));
  for (const line of lines) {
    if (y < 62) {
      page.drawText(`${pdf.getPageCount()}`, { x: 520, y: 28, size: 9, font: bodyFont, color: rgb(0.45, 0.45, 0.5) });
      page = pdf.addPage([595, 842]);
      y = 780;
    }
    page.drawText(line || ' ', { x: margin, y, size: 10.5, font: bodyFont, color: rgb(0.12, 0.13, 0.16) });
    y -= line ? 16 : 10;
  }
  page.drawText(`${pdf.getPageCount()}`, { x: 520, y: 28, size: 9, font: bodyFont, color: rgb(0.45, 0.45, 0.5) });

  const bytes = await pdf.save();
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  downloadBlob(new Blob([arrayBuffer], { type: 'application/pdf' }), `${normaliseFileName(output.title)}.pdf`);
}

function finalLines(content: string) {
  return content.replace(/\|/g, ' | ').split('\n');
}

function wrapLine(line: string, limit: number) {
  if (line.length <= limit) return [line];
  const words = line.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    if ((current + word).length > limit) {
      lines.push(current.trim());
      current = `${word} `;
    } else {
      current += `${word} `;
    }
  });
  if (current.trim()) lines.push(current.trim());
  return lines;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportLogsCsv(logs: EmailLog[]) {
  const rows = [
    ['Student', 'Class', 'Date', 'Intent Type', 'Actions Taken', 'Subject'],
    ...logs.map((log) => [log.student, log.className, log.date, log.intentType, log.actionsTaken.join('; '), log.subject]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'teachwise-email-action-logs.csv');
}

function CommandPalette({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (command: string) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = commands.filter((item) => `${item.command} ${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-start bg-black/45 px-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#10182c] shadow-[0_32px_100px_rgba(0,0,0,0.4)]" initial={{ scale: 0.98, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 12 }}>
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-teal-300" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Search commands..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
              <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2">
              {filtered.map((item) => (
                <button key={item.command} onClick={() => { onSelect(item.command); onClose(); }} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.06]">
                  <span>
                    <span className="block text-sm font-semibold text-white">{item.label}</span>
                    <span className="block text-xs text-slate-400">{item.hint}</span>
                  </span>
                  <span className="rounded-lg border border-teal-300/20 bg-teal-300/10 px-2 py-1 text-xs font-semibold text-teal-200">{item.command}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OutputPane({
  output,
  isGenerating,
  logs,
  onCopy,
  onEdit,
  onUpdateReport,
  onExportDocx,
  onExportPdf,
  onRegenerate,
  onEmailChange,
  onSave,
  onSaveEmail,
}: {
  output: OutputCard | null;
  isGenerating: boolean;
  logs: EmailLog[];
  onCopy: () => void;
  onEdit: () => void;
  onUpdateReport: (reportId: string, comment: string) => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
  onRegenerate: () => void;
  onEmailChange: (email: EmailDraft) => void;
  onSave: () => void;
  onSaveEmail: () => void;
}) {
  if (!output && !isGenerating) {
    return (
      <div className="grid h-full place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-300/25 bg-purple-300/10 text-purple-200">
          <PanelRightOpen className="h-7 w-7" />
        </motion.div>
        <h3 className="text-lg font-bold text-white">Paste content or select a tool</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">I&apos;ll take it from here.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
      <div className="pointer-events-none absolute -right-16 top-16 h-72 w-72 animate-premium-pulse rounded-full bg-teal-500/12 blur-3xl" />
      <div className="relative flex h-full flex-col p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-purple-200">
              <Sparkles className="h-3.5 w-3.5" /> Premium Output
            </div>
            <h2 className="text-xl font-bold text-white">{output?.title || 'Generating...'}</h2>
            <p className="mt-1 text-xs text-slate-400">{output?.subtitle || 'Streaming draft'}</p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton icon={PenLine} label="Edit" onClick={onEdit} />
            <ActionButton icon={RotateCcw} label="Regenerate" onClick={onRegenerate} />
            <ActionButton icon={Copy} label="Copy" onClick={onCopy} />
            <ActionButton icon={FileDown} label="DOCX" onClick={onExportDocx} />
            <ActionButton icon={Download} label="PDF" onClick={onExportPdf} />
            <ActionButton icon={Save} label="Save" onClick={onSave} />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {polishOptions.map((option) => (
            <button key={option} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10">
              {option}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isGenerating && (
            <div className="mb-4 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4 text-sm text-teal-100">
              Drafting<span className="ml-1 animate-blink">▊</span>
            </div>
          )}
          {output?.reports && <ReportCards reports={output.reports} onUpdateReport={onUpdateReport} />}
          {output?.email && (
            <EmailCard
              email={output.email}
              logs={logs}
              onChange={onEmailChange}
              onSave={onSaveEmail}
            />
          )}
          {output && !output.reports && !output.email && <StructuredOutput output={output} />}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-default disabled:opacity-60">
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function WorkflowRail({
  prefs,
  savedOutputs,
  logs,
  input,
  onSelectCommand,
}: {
  prefs: TeacherPrefs;
  savedOutputs: SavedOutputRecord[];
  logs: EmailLog[];
  input: string;
  onSelectCommand: (command: string) => void;
}) {
  return (
    <aside className="teacher-grid-rail">
      <div className="teachwise-surface rounded-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">Teacher runway</p>
            <h3 className="mt-1 text-base font-semibold text-white">Built for the next 30 minutes</h3>
          </div>
          <Lightbulb className="h-4 w-4 text-amber-300" />
        </div>
        <div className="space-y-3">
          {smartRuns.map((item) => (
            <button
              key={item.title}
              onClick={() => onSelectCommand(item.title.includes('Parent') ? '/email' : item.title.includes('Report') ? '/report' : '/sub')}
              className="flex w-full items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-teal-200">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{item.note}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="teachwise-surface rounded-3xl p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Session intelligence</p>
        <div className="mt-4 grid gap-3">
          {teacherSignals.map((signal) => (
            <div key={signal.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-teal-200">
                  <signal.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{signal.label}</p>
                  <p className="text-sm font-semibold text-white">{signal.value}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="insight-card rounded-2xl p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-100">Inherited context</p>
            <p className="mt-2 text-sm text-white">
              {prefs.yearLevel && prefs.subject
                ? `Year ${prefs.yearLevel} ${prefs.subject} stays attached to every new draft.`
                : 'Set year level and subject once so the next draft starts sharper.'}
            </p>
          </div>
        </div>
      </div>

      <div className="teachwise-surface rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Recent memory</p>
          <span className="text-xs text-slate-500">{savedOutputs.length} saved</span>
        </div>
        <div className="space-y-2">
          {savedOutputs.slice(0, 3).map((item, index) => (
            <div key={`${item.title}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.content}</p>
            </div>
          ))}
          {savedOutputs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-3 text-sm text-slate-500">
              Saved outputs will stack here once you start keeping your strongest drafts.
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {shortcutHints.map((hint) => (
            <span key={hint} className="focus-chip">{hint}</span>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm text-slate-400">
          {logs.length ? `${logs.length} email action logs are ready for meeting prep or compliance export.` : 'No email logs yet. The first saved parent workflow will appear here.'}
        </div>
      </div>

      <div className="teachwise-surface rounded-3xl p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          <BookOpenCheck className="h-4 w-4 text-teal-200" />
          Smart paste
        </div>
        <p className="text-sm text-white">{input.trim() ? 'TeachWise is already reading this as a likely workflow trigger.' : 'Paste assessment notes, a parent email, or tomorrow’s rough lesson notes to trigger a suggested command.'}</p>
      </div>
    </aside>
  );
}

function ReportCards({ reports, onUpdateReport }: { reports: StudentReport[]; onUpdateReport: (reportId: string, comment: string) => void }) {
  const formalize = (comment: string) => comment.replace(/\bcan't\b/gi, 'is not yet able to').replace(/\bvery\b/gi, 'highly');
  const warm = (comment: string) => `It has been a pleasure to see the steady progress shown here. ${comment}`;
  const shorten = (comment: string) => comment.split('. ').slice(0, 2).join('. ').trim().replace(/\.$/, '') + '.';
  const compliment = (comment: string) => `${comment} This is a real strength and should be celebrated.`;
  const actions: Array<{ label: string; transform: (comment: string) => string }> = [
    { label: 'More formal', transform: formalize },
    { label: 'Warmer tone', transform: warm },
    { label: 'Shorter', transform: shorten },
    { label: 'Add a compliment', transform: compliment },
  ];

  return (
    <div className="space-y-3">
      {reports.map((report, index) => (
        <motion.div key={report.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">{report.name}</h3>
              <p className="text-xs text-slate-400">{report.subject} report comment</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(report.comment)} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10" title="Copy comment">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm leading-7 text-slate-200">{report.comment}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map(({ label, transform }) => (
              <button key={label} onClick={() => onUpdateReport(report.id, transform(report.comment))} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400 hover:text-white">
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmailCard({
  email,
  logs,
  onChange,
  onSave,
}: {
  email: EmailDraft;
  logs: EmailLog[];
  onChange: (email: EmailDraft) => void;
  onSave: () => void;
}) {
  const setTone = (tone: Tone) => {
    const refreshed = buildEmailDraft(email.body, tone, { name: '', yearLevel: '', subject: '', state: 'WA' });
    onChange({ ...email, tone, body: refreshed.body });
  };
  const toggleAction = (id: string) => onChange({ ...email, actions: email.actions.map((action) => action.id === id ? { ...action, checked: !action.checked } : action) });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Intent detected</p>
            <p className="mt-1 text-lg font-bold text-white">{email.intent}</p>
          </div>
          <div className="flex rounded-xl border border-white/10 bg-slate-950/35 p-1">
            {(['Warm', 'Formal', 'Brief'] as Tone[]).map((tone) => (
              <button key={tone} onClick={() => setTone(tone)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${email.tone === tone ? 'bg-teal-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                {tone}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <p className="text-xs text-slate-400">To</p>
          <p className="mb-3 text-sm font-semibold text-white">{email.to}</p>
          <p className="text-xs text-slate-400">Subject</p>
          <p className="mb-3 text-sm font-semibold text-white">{email.subject}</p>
          <textarea value={email.body} onChange={(event) => onChange({ ...email, body: event.target.value })} rows={8} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-slate-200 outline-none" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => navigator.clipboard.writeText(email.body)} className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-3 py-2 text-xs font-bold text-slate-950"><Copy className="h-3.5 w-3.5" /> Copy</button>
            <a href={`mailto:?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"><Mail className="h-3.5 w-3.5" /> Open in Client</a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <p className="mb-3 text-sm font-bold text-white">Action checklist</p>
        <div className="space-y-2">
          {email.actions.map((action) => (
            <label key={action.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2 text-sm text-slate-300">
              <input type="checkbox" checked={action.checked} onChange={() => toggleAction(action.id)} className="h-4 w-4 accent-teal-400" />
              {action.label}
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={onSave} className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-3 py-2 text-xs font-bold text-slate-950"><Save className="h-3.5 w-3.5" /> Save Actions</button>
          <button onClick={() => onChange({ ...email, actions: email.actions.map((action) => ({ ...action, checked: false })) })} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10">Clear</button>
          <button onClick={() => exportLogsCsv(logs)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"><Table2 className="h-3.5 w-3.5" /> Export CSV</button>
        </div>
      </div>
    </div>
  );
}

function StructuredOutput({ output }: { output: OutputCard }) {
  const sections = output.content.split(/\n(?=#{1,3}\s|[A-Z][A-Za-z ]+\n)/).filter(Boolean);
  const tabs = output.kind === 'lesson' ? ['Overview', 'Lessons', 'Assessment', 'Differentiation'] : [];
  const [tab, setTab] = useState(tabs[0] || '');
  const visibleSections = tabs.length
    ? sections.filter((section) => {
        const lower = section.toLowerCase();
        if (tab === 'Overview') return /learning intention|success criteria|overview/.test(lower);
        if (tab === 'Lessons') return /lesson sequence|hook|explicit|guided|independent/.test(lower);
        if (tab === 'Assessment') return /assessment|rubric|evidence/.test(lower);
        if (tab === 'Differentiation') return /differentiation|support|extension|eald/.test(lower);
        return true;
      })
    : sections;

  return (
    <div className="space-y-3">
      {tabs.length > 0 && (
        <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-1">
          {tabs.map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold ${tab === item ? 'bg-teal-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              {item}
            </button>
          ))}
        </div>
      )}
      {(visibleSections.length ? visibleSections : [output.content]).map((section, index) => (
        <motion.div key={`${output.id}-${index}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{section.replace(/^#{1,3}\s/gm, '')}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [prefs, setPrefs] = useState<TeacherPrefs>(loadPrefs);
  const [input, setInput] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(commands[0]);
  const [commandIndex, setCommandIndex] = useState(0);
  const [output, setOutput] = useState<OutputCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(48);
  const [dragging, setDragging] = useState(false);
  const [lastInput, setLastInput] = useState('');
  const [logs, setLogs] = useState<EmailLog[]>(loadLogs);
  const [savedOutputs, setSavedOutputs] = useState(loadSavedOutputs);
  const [workspaceStatus, setWorkspaceStatus] = useState<'loading' | 'saving' | 'synced' | 'local'>('loading');
  const [authSession, setAuthSession] = useState<AuthSessionSummary>({ configured: false, user: null });
  const containerRef = useRef<HTMLDivElement>(null);
  const hydratedWorkspaceRef = useRef(false);
  const initialLocalSnapshotRef = useRef<WorkspaceSnapshot>({
    prefs: normalisePrefs(prefs),
    messages: serialiseMessages(messages),
    savedOutputs,
    emailLogs: logs,
    updatedAt: new Date().toISOString(),
  });
  const suggestion = detectSuggestion(input);
  const matchingCommands = useMemo(() => commands.filter((item) => item.command.startsWith(input.trim().toLowerCase()) || item.label.toLowerCase().includes(input.trim().replace('/', '').toLowerCase())).slice(0, 6), [input]);

  const persistWorkspace = useCallback(async (snapshot: Partial<WorkspaceSnapshot>) => {
    setWorkspaceStatus((current) => current === 'loading' ? current : 'saving');
    try {
      const response = await fetch(WORKSPACE_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      });
      if (!response.ok) throw new Error('Workspace save failed');
      setWorkspaceStatus('synced');
    } catch {
      setWorkspaceStatus('local');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAuthSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!response.ok) return;
        const session = await response.json() as AuthSessionSummary;
        if (!cancelled) setAuthSession(session);
      } catch {
        if (!cancelled) setAuthSession({ configured: false, user: null });
      }
    };

    const hydrateWorkspace = async () => {
      try {
        const response = await fetch(WORKSPACE_ENDPOINT, { cache: 'no-store' });
        if (!response.ok) throw new Error('Workspace request failed');
        const snapshot = await response.json() as WorkspaceApiSnapshot;
        if (cancelled) return;

        if (hasWorkspaceData(snapshot)) {
          setPrefs(normalisePrefs(snapshot.prefs));
          setMessages(rehydrateMessages(snapshot.messages));
          setSavedOutputs(snapshot.savedOutputs || []);
          setLogs((snapshot.emailLogs || []) as EmailLog[]);
        } else {
          const localSnapshot = initialLocalSnapshotRef.current;
          if (hasWorkspaceData(localSnapshot)) {
            void persistWorkspace(localSnapshot);
          }
        }

        hydratedWorkspaceRef.current = true;
        setWorkspaceStatus(snapshot.storageMode === 'supabase-auth-required' ? 'local' : 'synced');
      } catch {
        hydratedWorkspaceRef.current = true;
        setWorkspaceStatus('local');
      }
    };

    void loadAuthSession();
    void hydrateWorkspace();

    return () => {
      cancelled = true;
    };
  }, [persistWorkspace]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem(SAVED_OUTPUTS_KEY, JSON.stringify(savedOutputs));
  }, [savedOutputs]);

  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (!hydratedWorkspaceRef.current) return;
    const timeoutId = window.setTimeout(() => {
      void persistWorkspace({
        prefs,
        messages: serialiseMessages(messages),
        savedOutputs,
        emailLogs: logs,
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [logs, messages, persistWorkspace, prefs, savedOutputs]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((event.clientX - rect.left) / rect.width) * 100;
      const snapped = [25, 50, 75].find((snap) => Math.abs(snap - percent) < 4);
      setLeftPaneWidth(Math.min(75, Math.max(25, snapped || percent)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const handleGenerate = useCallback(async (override?: string) => {
    const prompt = override ?? input;
    if (!prompt.trim() || isGenerating) return;
    const command = detectCommand(prompt);
    const cleanPrompt = prompt.replace(new RegExp(`^${command.command}\\s*`, 'i'), '').trim() || prompt;
    setSelectedCommand(command);
    setLastInput(prompt);
    setInput('');
    setIsGenerating(true);

    const userMessage: Message = { id: `${Date.now()}u`, role: 'user', content: prompt, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((message) => ({ role: message.role, content: message.content })),
          teacherPrefs: prefs,
          tool: command.label,
        }),
      });
      const data = await response.json();
      const content = response.ok ? data.response : '';
      const nextOutput = createOutput(command.kind, content, cleanPrompt, prefs, 'Warm');
      setOutput(nextOutput);
      setMessages((prev) => [...prev, { id: `${Date.now()}a`, role: 'assistant', content: plainTextForOutput(nextOutput), timestamp: new Date() }]);
    } catch {
      const nextOutput = createOutput(command.kind, fallbackContent(command.kind, cleanPrompt, prefs), cleanPrompt, prefs, 'Warm');
      setOutput(nextOutput);
      setMessages((prev) => [...prev, { id: `${Date.now()}a`, role: 'assistant', content: plainTextForOutput(nextOutput), timestamp: new Date() }]);
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating, messages, prefs]);

  useEffect(() => {
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        void handleGenerate();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        if (output) void exportDocx(output);
      }
      if (event.key === 'Escape') setInput('');
      if (event.key === 'ArrowUp' && !input) setInput(lastInput);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleGenerate, input, lastInput, output]);

  const updateEmail = (email: EmailDraft) => {
    if (!output) return;
    setOutput({ ...output, email });
  };

  const saveEmailLog = async () => {
    if (!output?.email) return;
    const log: EmailLog = {
      student: output.email.student,
      className: output.email.className,
      date: new Date().toISOString().slice(0, 10),
      intentType: output.email.intent,
      actionsTaken: output.email.actions.filter((action) => action.checked).map((action) => action.label),
      subject: output.email.subject,
    };
    setLogs((current) => [log, ...current]);
    await fetch('/api/email-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    }).catch(() => undefined);
  };

  const copyOutput = () => {
    if (output) void navigator.clipboard.writeText(plainTextForOutput(output));
  };

  const editOutput = () => {
    if (!output) return;
    setInput(plainTextForOutput(output));
  };

  const saveOutput = () => {
    if (!output) return;
    if (output.email) {
      void saveEmailLog();
      return;
    }
    setSavedOutputs((prev) => [{
      kind: output.kind,
      title: output.title,
      savedAt: new Date().toISOString(),
      content: plainTextForOutput(output),
    }, ...prev].slice(0, 20));
  };

  const selectCommand = (command: string) => {
    const item = commands.find((candidate) => candidate.command === command) || commands[0];
    setSelectedCommand(item);
    setInput(`${command} `);
  };

  const commandBarKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab' && input.startsWith('/')) {
      event.preventDefault();
      const nextIndex = (commandIndex + 1) % Math.max(1, matchingCommands.length);
      setCommandIndex(nextIndex);
      if (matchingCommands[nextIndex]) setInput(`${matchingCommands[nextIndex].command} `);
      return;
    }
    if (event.key === 'Enter' && input.startsWith('/') && matchingCommands[0] && !event.shiftKey) {
      event.preventDefault();
      setInput(`${matchingCommands[0].command} `);
      setSelectedCommand(matchingCommands[0]);
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleGenerate();
    }
  };

  return (
    <div className="h-[calc(100vh-9rem)] min-h-[680px] animate-fade-in" ref={containerRef}>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onSelect={selectCommand} />
      <div className="grid h-full grid-cols-1 gap-3 xl:flex">
        <section className="flex min-h-0 w-full flex-col rounded-3xl border border-white/10 bg-slate-950/30 p-4 shadow-[0_28px_90px_rgba(2,8,23,0.32)]" style={{ flexBasis: `${leftPaneWidth}%` }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-teal-400/14 via-sky-400/8 to-purple-400/12 p-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">
                <Sparkles className="h-3.5 w-3.5" /> TeachWise Premium
              </div>
              <h1 className="text-2xl font-bold text-white">Smart teaching workspace</h1>
              <p className="mt-1 text-sm text-slate-300">{prefs.name ? `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'} ${prefs.name}. ` : ''}{prefs.yearLevel && prefs.subject ? `Year ${prefs.yearLevel} ${prefs.subject} today?` : 'Set context once and every draft inherits it.'}</p>
              {authSession.configured && !authSession.user && (
                <p className="mt-2 text-xs text-amber-100">Sign in to move this workspace into your hosted Supabase account.</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300">
                <span
                  className={`h-2 w-2 rounded-full ${
                    workspaceStatus === 'synced'
                      ? 'bg-teal-300'
                      : workspaceStatus === 'saving'
                        ? 'bg-amber-300'
                        : workspaceStatus === 'loading'
                          ? 'bg-slate-400'
                          : 'bg-purple-300'
                  }`}
                />
                {workspaceStatus === 'synced'
                  ? 'Workspace saved'
                  : workspaceStatus === 'saving'
                    ? 'Saving'
                    : workspaceStatus === 'loading'
                      ? 'Loading workspace'
                      : 'Local fallback'}
              </div>
              <button onClick={() => setPaletteOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
                <Search className="h-4 w-4" /> Cmd K
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-3 lg:grid-cols-3">
            <div className="teachwise-surface rounded-2xl p-3 lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Today&apos;s command deck</p>
                <span className="text-xs text-slate-500">Teacher-first workflow</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {commands.slice(0, 6).map((item) => (
                  <button key={item.command} onClick={() => selectCommand(item.command)} className="focus-chip">
                    {item.command} {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="teachwise-surface rounded-2xl p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Flow</p>
              <p className="mt-2 text-sm font-semibold text-white">Paste → detect → draft → export</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">The whole screen is tuned for short bursts, not long setup.</p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <select value={prefs.yearLevel || ''} onChange={(event) => setPrefs({ ...prefs, yearLevel: event.target.value })} className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2.5 text-sm text-white">
              <option value="">Year level</option>
              {['F', '1', '2', '3', '4', '5', '6'].map((year) => <option key={year} value={year}>Year {year}</option>)}
            </select>
            <select value={prefs.subject || ''} onChange={(event) => setPrefs({ ...prefs, subject: event.target.value })} className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2.5 text-sm text-white">
              <option value="">Subject</option>
              {recentSubjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
            </select>
            <input value={prefs.name || ''} onChange={(event) => setPrefs({ ...prefs, name: event.target.value })} placeholder="Teacher name" className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" />
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {commands.slice(0, 9).map((item) => (
              <button key={item.command} onClick={() => selectCommand(item.command)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${selectedCommand.command === item.command ? 'border-teal-300/30 bg-teal-300/15 text-teal-100' : 'border-white/10 bg-white/[0.035] text-slate-400 hover:text-white'}`}>
                {item.command}
              </button>
            ))}
          </div>

          <div className="mb-4 min-h-0 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/35 p-4">
            {messages.length === 0 ? (
              <div className="grid h-full min-h-[260px] place-items-center text-center">
                <div>
                  <Archive className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                  <h2 className="text-lg font-bold text-white">No session yet</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Try /report with student assessment notes, /email with a pasted parent message, or /sub for a relief teacher plan.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.slice(-8).map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : message.role === 'system' ? 'justify-center' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'border-l-2 border-teal-200 bg-slate-900 text-white shadow-[0_12px_40px_rgba(20,184,166,0.12)]' : message.role === 'system' ? 'bg-transparent text-center text-xs text-slate-500' : 'border-l-2 border-purple-300 bg-white/[0.06] text-slate-200'}`}>
                      <div className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-400">
                        {message.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                        {message.role === 'user' ? 'You' : 'TeachWise'}
                      </div>
                      <p className="line-clamp-6 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {suggestion && (
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              <span>{suggestion}</span>
              <button onClick={() => void handleGenerate()} className="rounded-lg bg-amber-300 px-3 py-1 text-xs font-bold text-slate-950">Yes</button>
            </div>
          )}

          {input.startsWith('/') && matchingCommands.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {matchingCommands.map((item) => (
                <button key={item.command} onClick={() => selectCommand(item.command)} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/10">
                  <span className="font-bold text-teal-200">{item.command}</span> {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-2 shadow-[0_18px_50px_rgba(2,8,23,0.18)]">
            <div className="mb-2 flex flex-wrap items-center gap-2 px-2 pt-1">
              {recentSubjects.map((subject) => (
                <button key={subject} onClick={() => setPrefs({ ...prefs, subject })} className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-white">{subject}</button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={commandBarKeyDown} rows={2} placeholder="/report paste assessment data, /email paste a parent email, or ask for anything..." className="max-h-36 min-h-14 flex-1 resize-none rounded-2xl border border-transparent bg-transparent px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500" />
              <button onClick={() => void handleGenerate()} disabled={!input.trim() || isGenerating} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-teal-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-45">
                <Send className="h-4 w-4" /> Generate
              </button>
            </div>
          </div>
        </section>

        <div onMouseDown={() => setDragging(true)} className="group hidden w-3 cursor-col-resize items-center justify-center xl:flex" title="Drag divider">
          <div className={`glass-divider flex h-24 w-1 items-center justify-center rounded-full transition-all group-hover:w-2 ${dragging ? 'w-2' : ''}`}>
            <GripVertical className="h-4 w-4 text-white/70" />
          </div>
        </div>

        <section className="min-h-0 flex-1">
          <div className="teacher-grid h-full">
            <OutputPane
              output={output}
              isGenerating={isGenerating}
              logs={logs}
              onCopy={copyOutput}
              onEdit={editOutput}
              onUpdateReport={(reportId, comment) => {
                if (!output?.reports) return;
                setOutput({
                  ...output,
                  reports: output.reports.map((report) => report.id === reportId ? { ...report, comment } : report),
                });
              }}
              onExportDocx={() => output && void exportDocx(output)}
              onExportPdf={() => output && void exportPdf(output)}
              onRegenerate={() => lastInput && void handleGenerate(lastInput)}
              onEmailChange={updateEmail}
              onSave={saveOutput}
              onSaveEmail={saveEmailLog}
            />
            <WorkflowRail
              prefs={prefs}
              savedOutputs={savedOutputs}
              logs={logs}
              input={input}
              onSelectCommand={selectCommand}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

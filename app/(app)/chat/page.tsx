'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, TeacherPrefs } from '@/app/lib/types';
import {
  Bot,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  Mic,
  MicOff,
  PenLine,
  Send,
  Settings,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  Wand2,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'teachwise_prefs';
const HISTORY_KEY = 'teachwise_chat_history';

const defaultWelcome = `👋 **TeachWise AI — your teaching assistant**

I'm aligned to the Australian Curriculum v9 (AC9) and I'm here to help you build better lessons, faster.

**What I can help with:**
• **Lesson planning** — AC9-aligned, with content descriptors, elaborations, and cross-curriculum priorities
• **Rubrics** — Analytic or holistic, linked to achievement standards by year level
• **Unit building** — Structured sequences with duration, assessment, and resources
• **Auto-marking** — Upload student work + rubric, get structured feedback instantly

Just tell me what year level, subject, and topic you're working on — I'll take it from there.`;

// ─── Types ────────────────────────────────────────────────────────
interface PlanSection {
  id: string;
  type: 'overview' | 'ac9' | 'walt' | 'tib' | 'wilf' | 'lesson' | 'assessment' | 'differentiation' | 'resources' | 'reflection';
  label: string;
  content: string;
  editing?: boolean;
}

interface ActivePlan {
  title: string;
  yearLevel: string;
  subject: string;
  topic: string;
  duration: string;
  sections: PlanSection[];
}

// ─── Speech Recognition types ────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ─── Plan Parser ──────────────────────────────────────────────────
function parsePlanFromMarkdown(markdown: string, yearLevel = '', subject = '', topic = ''): ActivePlan {
  const sections: PlanSection[] = [];

  // Try XML marker-based parsing first
  const sectionMarkerRegex = /\{\{SECTION:([^}]+)\}\}([\s\S]*?)\{\{\/SECTION:[^}]+\}\}/g;
  let match;
  let hasMarkers = false;

  while ((match = sectionMarkerRegex.exec(markdown)) !== null) {
    hasMarkers = true;
    const sectionName = match[1].trim();
    const content = match[2].trim();

    // Map section names to types
    let type: PlanSection['type'] = 'overview';
    let label = sectionName;

    if (sectionName === 'overview') { type = 'overview'; label = 'Unit Overview'; }
    else if (sectionName === 'ac9') { type = 'ac9'; label = 'AC9 Curriculum'; }
    else if (sectionName === 'unit_details') { type = 'overview'; label = 'Unit Details'; }
    else if (sectionName === 'assessment') { type = 'assessment'; label = 'Assessment'; }
    else if (sectionName === 'lessons') { /* container, skip */ continue; }
    else if (sectionName.startsWith('lesson-')) {
      // Extract lesson number and title from content
      const lessonNum = sectionName.replace('lesson-', '');
      const titleMatch = content.match(/\*\*Lesson \d+:?\s+(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1] : `Lesson ${lessonNum}`;
      sections.push({
        id: `lesson-${lessonNum}`,
        type: 'lesson',
        label: `Lesson ${lessonNum}: ${title}`,
        content,
      });
      continue;
    }
    else if (sectionName === 'differentiation') { type = 'differentiation'; label = 'Differentiation'; }
    else if (sectionName === 'resources') { type = 'resources'; label = 'Resources'; }

    sections.push({
      id: `section-${sections.length}`,
      type,
      label,
      content,
    });
  }

  // If no XML markers found, fall back to heuristic parsing
  if (!hasMarkers) {
    const lines = markdown.split('\n');
    let currentSection: PlanSection | null = null;
    let currentContent: string[] = [];

    const flush = () => {
      if (!currentSection) return;
      const content = currentContent.join('\n').trim();
      if (content) {
        sections.push({ ...currentSection, content });
      }
      currentSection = null;
      currentContent = [];
    };

    for (const line of lines) {
      // Lesson headers
      const lessonMatch = line.match(/^\*\*Lesson\s+(\d+):?\s+(.+?)\*\*$/);
      if (lessonMatch) {
        flush();
        sections.push({
          id: `lesson-${lessonMatch[1]}`,
          type: 'lesson',
          label: `Lesson ${lessonMatch[1]}: ${lessonMatch[2]}`,
          content: '',
        });
        continue;
      }

      // Section headers: ### Section Name
      const sectionMatch = line.match(/^### (.+)/);
      if (sectionMatch) {
        flush();
        const label = sectionMatch[1];
        let type: PlanSection['type'] = 'overview';
        if (/overview|summary/i.test(label)) type = 'overview';
        else if (/ac9|curriculum|alignment/i.test(label)) type = 'ac9';
        else if (/walt|learning intention/i.test(label)) type = 'walt';
        else if (/tib|because/i.test(label)) type = 'tib';
        else if (/wilf|looking for|success criteria/i.test(label)) type = 'wilf';
        else if (/assessment/i.test(label)) type = 'assessment';
        else if (/differentiation/i.test(label)) type = 'differentiation';
        else if (/resource/i.test(label)) type = 'resources';
        else if (/reflection/i.test(label)) type = 'reflection';
        currentSection = { id: `section-${sections.length}`, type, label, content: '' };
        continue;
      }

      if (currentSection) {
        currentContent.push(line);
      } else if (line.trim() && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('-')) {
        currentContent.push(line);
      }
    }
    flush();

    if (!sections.some(s => s.type === 'overview') && currentContent.length > 0) {
      sections.unshift({
        id: 'overview',
        type: 'overview',
        label: 'Unit Overview',
        content: currentContent.join('\n').trim(),
      });
    }
  }

  const title = `Year ${yearLevel || 'X'} — ${subject || 'Subject'} — ${topic || 'Topic'}`;

  return { title, yearLevel, subject, topic, duration: '', sections };
}

function getSectionColor(type: PlanSection['type']): string {
  const colors: Record<string, string> = {
    overview: '#38bdf8',
    ac9: '#818cf8',
    walt: '#14b8a6',
    tib: '#f59e0b',
    wilf: '#a78bfa',
    lesson: '#f59e0b',
    assessment: '#fb7185',
    differentiation: '#f97316',
    resources: '#94a3b8',
    reflection: '#14b8a6',
  };
  return colors[type] || '#14b8a6';
}

function getSectionIcon(type: PlanSection['type']) {
  if (type === 'ac9') return GraduationCap;
  if (type === 'lesson') return BookMarked;
  if (type === 'assessment') return ClipboardCheck;
  if (type === 'walt' || type === 'wilf') return Target;
  if (type === 'reflection') return CheckCircle2;
  return FileText;
}

function renderInlineMarkdown(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
  );
}

// ─── Plan Editor Panel ───────────────────────────────────────────
function PlanEditorPanel({
  plan,
  onClose,
  onUpdate,
}: {
  plan: ActivePlan;
  onClose: () => void;
  onUpdate: (plan: ActivePlan) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (section: PlanSection) => {
    setEditingId(section.id);
    setEditValue(section.content);
  };

  const saveEdit = (id: string) => {
    onUpdate({
      ...plan,
      sections: plan.sections.map(s =>
        s.id === id ? { ...s, content: editValue } : s
      ),
    });
    setEditingId(null);
    setEditValue('');
  };

  const handleExportDOCX = async () => {
    const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import('docx');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = [
      new Paragraph({
        children: [new TextRun({ text: plan.title, bold: true, size: 48 })],
        heading: HeadingLevel.TITLE,
      }),
    ];

    for (const section of plan.sections) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: section.label, bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [new TextRun({ text: section.content || '(No content yet)' })],
        })
      );
    }

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.title.replace(/\s+/g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPPTX = async () => {
    const PptxGenJS = (await import('pptxgenjs')).default;
    const pptx = new PptxGenJS();
    pptx.title = plan.title;

    for (let i = 0; i < plan.sections.length; i++) {
      const section = plan.sections[i];
      const slide = pptx.addSlide();
      slide.addText(section.label, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: '333333' });
      slide.addText(section.content || '(No content yet)', { x: 0.5, y: 1.2, w: '90%', fontSize: 14, color: '666666' });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = await (pptx.write as any)('blob');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.title.replace(/\s+/g, '_')}.pptx`;
    a.click();
  };

  const handleExportPDF = () => {
    // Print-friendly approach
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${plan.title}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
  h1 { font-size: 24px; border-bottom: 2px solid #6366F1; padding-bottom: 8px; }
  h2 { font-size: 18px; color: #6366F1; margin-top: 24px; }
  h3 { font-size: 14px; color: #888; }
  p { line-height: 1.6; }
  ul { padding-left: 20px; }
  li { margin-bottom: 4px; }
  .section { margin-bottom: 20px; }
</style></head><body>
<h1>${plan.title}</h1>
${plan.sections.map(s => `
<div class="section">
  <h2>${s.label}</h2>
  <div style="white-space:pre-wrap">${s.content || '(No content yet)'}</div>
</div>`).join('')}
</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--color-accent)' }}>
            <FileText className="h-3.5 w-3.5" />
            Live Unit Draft
          </div>
          <h3 className="truncate text-lg font-bold text-white">Generated plan</h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Edit, export, or keep refining with the chat.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleExportDOCX}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold transition-all hover:bg-white/10"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Export DOCX"
          >
            DOCX
          </button>
          <button
            onClick={handleExportPPTX}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold transition-all hover:bg-white/10"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Export PPTX"
          >
            PPTX
          </button>
          <button
            onClick={handleExportPDF}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-2 transition-all hover:bg-white/10"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Print / PDF"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-2 transition-all hover:bg-white/10"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Close panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-br from-teal-400/15 via-sky-400/10 to-amber-400/10 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>Plan title</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-white">{plan.title}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {plan.sections.map((section) => (
          <div key={section.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-[0_18px_50px_rgba(2,8,23,0.22)]">
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{ backgroundColor: `${getSectionColor(section.type)}18`, borderBottom: `1px solid ${getSectionColor(section.type)}2f` }}
            >
              <div className="flex min-w-0 items-center gap-2">
                {(() => {
                  const SectionIcon = getSectionIcon(section.type);
                  return <SectionIcon className="h-4 w-4 shrink-0" style={{ color: getSectionColor(section.type) }} />;
                })()}
                <span className="truncate text-xs font-bold uppercase tracking-[0.12em]" style={{ color: getSectionColor(section.type) }}>
                  {section.label}
                </span>
              </div>
              <button
                onClick={() => startEdit(section)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all hover:bg-white/10"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <PenLine className="h-3 w-3" />
                Edit
              </button>
            </div>

            <div className="px-4 py-4">
              {editingId === section.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={Math.max(4, editValue.split('\n').length + 1)}
                    className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm leading-6 outline-none"
                    style={{ color: 'var(--color-text-secondary)' }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(section.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="chat-output text-sm leading-7"
                  style={{ color: section.content ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', fontStyle: section.content ? 'normal' : 'italic' }}
                >
                  {(section.content || 'No content yet. Click Edit to add content.').split('\n').map((line, index) => (
                    <p key={index}>{renderInlineMarkdown(line)}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const welcomeMessage = (): Message => ({
  id: 'welcome',
  role: 'assistant',
  content: defaultWelcome,
  timestamp: new Date(),
});

const promptSuggestions = [
  'Year 5 Mathematics unit on fractions and decimals',
  'Year 3 English persuasive writing lesson sequence',
  'Build a Science rubric for habitats and adaptations',
];

const stageLabels = {
  start: 'Context',
  topic: 'Topic',
  scope: 'Scope',
  building: 'Draft',
} as const;

function loadPrefs(): TeacherPrefs {
  if (typeof window === 'undefined') return { name: '', yearLevel: '', subject: '', state: 'NSW' };
  try {
    const savedPrefs = localStorage.getItem(STORAGE_KEY);
    return savedPrefs ? JSON.parse(savedPrefs) : { name: '', yearLevel: '', subject: '', state: 'NSW' };
  } catch {
    return { name: '', yearLevel: '', subject: '', state: 'NSW' };
  }
}

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [welcomeMessage()];
  try {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    const parsed = savedHistory ? JSON.parse(savedHistory) : null;
    if (!Array.isArray(parsed) || parsed.length === 0) return [welcomeMessage()];
    return parsed.map((message: Message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  } catch {
    return [welcomeMessage()];
  }
}

// ─── Main Chat Page ──────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<TeacherPrefs>(loadPrefs);
  const [conversationStage, setConversationStage] = useState<'start' | 'topic' | 'scope' | 'building' | 'done'>('start');
  const [voiceListening, setVoiceListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [planPanelOpen, setPlanPanelOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [dividerDragging, setDividerDragging] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(50); // percentage
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Divider drag logic
  useEffect(() => {
    if (!dividerDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const percent = Math.min(Math.max(rawPercent, 25), 75);
      setLeftPaneWidth(percent);
    };

    const handleMouseUp = () => setDividerDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dividerDragging]);

  const savePrefs = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setShowPrefs(false);
  };

  const handleSend = useCallback(async (promptText?: string) => {
    const text = promptText || input;
    if (!text.trim()) return;

    if (text.toLowerCase().includes('year') || text.match(/\d/)) setConversationStage('topic');
    else if (text.toLowerCase().includes('topic') || text.toLowerCase().includes('teach')) setConversationStage('scope');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...conversationHistory, { role: 'user', content: text }],
          teacherPrefs: prefs,
        }),
      });

      const data = await response.json();
      const aiContent = data.response;

      // Detect if response looks like a unit plan
      const looksLikePlan =
        /\{\{SECTION:/.test(aiContent) ||  // XML markers = definitely a plan
        /AC9[A-Z0-9]+/i.test(aiContent) ||
        (/Lesson\s+\d+/i.test(aiContent) && /WALT|TIB|WILF/i.test(aiContent)) ||
        (/Unit\s*(Plan|Overview|Structure)/i.test(aiContent) && /Lesson/i.test(aiContent));

      if (looksLikePlan) {
        const plan = parsePlanFromMarkdown(aiContent, prefs.yearLevel || '', prefs.subject || '', '');
        setActivePlan(plan);
        setPlanPanelOpen(true);
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiContent, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setTimeout(() => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(), role: 'assistant',
          content: "I'm here and ready to help you plan! What year level and subject are you working with?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, prefs]);

  const toggleVoice = useCallback(() => {
    if (voiceListening) {
      recognitionRef.current?.stop();
      setVoiceListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition not supported'); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else setTranscript(event.results[i][0].transcript);
      }
      if (finalTranscript) {
        setInput(finalTranscript);
        setVoiceListening(false);
        setTranscript('');
        handleSend(finalTranscript);
      }
    };

    recognition.onend = () => { setVoiceListening(false); setTranscript(''); };
    recognition.onerror = () => { setVoiceListening(false); setTranscript(''); };

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceListening(true);
  }, [handleSend, voiceListening]);

  const clearHistory = () => {
    setMessages([welcomeMessage()]);
    localStorage.removeItem(HISTORY_KEY);
    setConversationStage('start');
    setActivePlan(null);
    setPlanPanelOpen(false);
  };

  const renderMessage = (content: string, role: Message['role']) => {
    return content.split('\n').map((line, i) => {
      const normalizedLine = line.replace(/^•\s*/, '- ');
      if (normalizedLine.startsWith('### ')) {
        return <h4 key={i} className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white">{normalizedLine.replace('### ', '')}</h4>;
      }
      if (normalizedLine.startsWith('## ')) {
        return <h3 key={i} className="mt-5 text-base font-bold" style={{ color: role === 'user' ? 'white' : 'var(--color-accent)' }}>{normalizedLine.replace('## ', '')}</h3>;
      }
      if (normalizedLine.startsWith('# ')) {
        return <h2 key={i} className="mt-5 text-lg font-bold text-white">{normalizedLine.replace('# ', '')}</h2>;
      }
      if (normalizedLine.startsWith('**') && normalizedLine.endsWith('**') && !normalizedLine.includes('**', 2)) {
        return <p key={i} className="mt-3 text-sm font-bold text-white">{normalizedLine.replace(/\*\*/g, '')}</p>;
      }
      if (normalizedLine.startsWith('- ') || normalizedLine.startsWith('* ')) {
        const text = normalizedLine.replace(/^[-*]\s*/, '');
        return (
          <li key={i} className="my-2 flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm leading-6" style={{ color: role === 'user' ? 'rgba(255,255,255,0.9)' : 'var(--color-text-secondary)' }}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: role === 'user' ? 'white' : 'var(--color-accent)' }} />
            <span>{renderInlineMarkdown(text)}</span>
          </li>
        );
      }
      if (normalizedLine.match(/^\d+\.\s/)) {
        const num = normalizedLine.match(/^(\d+)\./)?.[1] || '1';
        const text = normalizedLine.replace(/^\d+\.\s*/, '');
        return (
          <li key={i} className="my-2 flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm leading-6" style={{ color: role === 'user' ? 'rgba(255,255,255,0.9)' : 'var(--color-text-secondary)' }}>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: role === 'user' ? 'rgba(255,255,255,0.18)' : 'var(--color-accent-dim)', color: role === 'user' ? 'white' : 'var(--color-accent)' }}>{num}</span>
            <span>{renderInlineMarkdown(text)}</span>
          </li>
        );
      }
      if (normalizedLine.startsWith('```')) return null;
      if (normalizedLine.trim() === '') return <div key={i} className="h-2" />;
      return (
        <p key={i} className="my-2 text-sm leading-7" style={{ color: role === 'user' ? 'rgba(255,255,255,0.92)' : 'var(--color-text-secondary)' }}>
          {renderInlineMarkdown(normalizedLine)}
        </p>
      );
    });
  };

  const handlePlanUpdate = (updated: ActivePlan) => {
    setActivePlan(updated);
  };

  return (
    <div className="chat-workspace flex h-[calc(100vh-9rem)] min-h-[640px] animate-fade-in gap-3" ref={containerRef}>
      {/* ── LEFT PANE: Chat ── */}
      <div
        className="flex h-full min-h-0 flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30 p-4 shadow-[0_28px_90px_rgba(2,8,23,0.32)]"
        style={{
          width: planPanelOpen ? `${leftPaneWidth}%` : '100%',
          transition: dividerDragging ? 'none' : 'width 0.2s ease',
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-teal-400/14 via-sky-400/8 to-amber-400/10 p-4">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--color-accent)' }}>
              <Sparkles className="h-3.5 w-3.5" />
              AC9 Co-planner
            </div>
            <h2 className="flex items-center gap-2 text-2xl font-bold leading-tight text-white">
              Unit Planning Assistant
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
              {prefs.yearLevel && prefs.subject ? `${prefs.yearLevel} ${prefs.subject}` : 'Start a conversation'}
              {prefs.name && ` — ${prefs.name}`}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setShowPrefs(!showPrefs)}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-sm transition-all hover:bg-white/10"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Teacher preferences"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold transition-all hover:bg-white/10"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showPrefs && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_50px_rgba(2,8,23,0.2)]">
                <h3 className="mb-3 text-sm font-bold text-white">Your Teaching Context</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Your Name</label>
                    <input type="text" value={prefs.name} onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                      placeholder="Optional" className="w-full rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2.5 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>State</label>
                    <select value={prefs.state} onChange={(e) => setPrefs({ ...prefs, state: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2.5 text-sm text-white outline-none">
                      {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Year Level</label>
                    <select value={prefs.yearLevel} onChange={(e) => setPrefs({ ...prefs, yearLevel: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2.5 text-sm text-white outline-none">
                      <option value="">Select year level</option>
                      {['F', '1', '2', '3', '4', '5', '6'].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Subject</label>
                    <select value={prefs.subject} onChange={(e) => setPrefs({ ...prefs, subject: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2.5 text-sm text-white outline-none">
                      <option value="">Select subject</option>
                      {['English', 'Mathematics', 'Science', 'HASS', 'The Arts', 'Health & PE', 'Technologies'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={savePrefs} className="mt-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4 grid grid-cols-4 gap-2 text-xs">
          {(['start', 'topic', 'scope', 'building'] as const).map((stage, i) => (
            <div
              key={stage}
              className="rounded-2xl border px-3 py-2 transition-all"
              style={conversationStage === stage ? { backgroundColor: 'var(--color-accent-dim)', borderColor: 'rgba(20,184,166,0.38)', color: 'var(--color-accent)' } : { backgroundColor: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--color-text-muted)' }}
            >
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em]">0{i + 1}</div>
              <div className="font-semibold">{stageLabels[stage]}</div>
            </div>
          ))}
        </div>

        <div className="chat-thread mb-4 flex-1 space-y-5 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/35 p-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/12 sm:flex" style={{ color: 'var(--color-accent)' }}>
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`chat-bubble max-w-[100%] rounded-3xl px-5 py-4 sm:max-w-[88%] ${msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #14b8a6, #0f766e)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.035))',
                  border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 18px 50px rgba(2,8,23,0.22)',
                }}
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.78)' : 'var(--color-accent)' }}>
                    {msg.role === 'user' ? <UserRound className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {msg.role === 'user' ? (prefs.name || 'You') : 'TeachWise AI'}
                  </div>
                  <div className="text-[11px]" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.65)' : 'var(--color-text-muted)' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="chat-output text-white">
                  {renderMessage(msg.content, msg.role)}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] sm:flex" style={{ color: 'var(--color-text-secondary)' }}>
                  <UserRound className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start gap-3">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/12" style={{ color: 'var(--color-accent)' }}>
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-3xl rounded-bl-md border border-white/10 bg-white/[0.05] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Planning your unit...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <AnimatePresence>
          {activePlan && !planPanelOpen && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3 overflow-hidden"
            >
              <button
                onClick={() => setPlanPanelOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-300/20 bg-teal-300/15 py-3 text-sm font-bold transition-all hover:bg-teal-300/20"
                style={{ color: 'var(--color-accent)' }}
              >
                <FileText className="w-4 h-4" />
                View & Edit Unit Plan
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length <= 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold transition-all hover:bg-white/10"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <Wand2 className="h-3.5 w-3.5" />
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3 rounded-3xl border border-white/10 bg-white/[0.05] p-2 shadow-[0_18px_50px_rgba(2,8,23,0.18)]">
          <div className="flex-1 relative">
            {(voiceListening || transcript) && (
              <div className="absolute -top-9 left-2 right-2 flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs animate-pulse-glow"
                style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                <Mic className="w-3 h-3" />{transcript || 'Listening...'}
              </div>
            )}
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Tell me what you want to teach..." rows={1}
              className="max-h-32 w-full resize-none rounded-2xl border border-transparent bg-transparent px-4 py-3 text-sm leading-6 text-white outline-none transition-all placeholder:text-slate-500" />
          </div>
          <button onClick={toggleVoice}
            className={`flex-shrink-0 rounded-2xl border border-white/10 p-3.5 transition-all hover:bg-white/10 ${voiceListening ? 'animate-pulse-glow' : ''}`}
            style={{ backgroundColor: voiceListening ? 'var(--color-accent)' : 'rgba(255,255,255,0.04)', color: voiceListening ? 'white' : 'var(--color-text-muted)' }}
            title={voiceListening ? 'Stop listening' : 'Start voice input'}>
            {voiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={() => handleSend()} disabled={(!input.trim() && !transcript) || isTyping}
            className="flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)', color: 'white' }}>
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <AnimatePresence>
        {planPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="group relative flex-shrink-0 cursor-col-resize"
            style={{ width: 8, backgroundColor: 'transparent' }}
            onMouseDown={() => setDividerDragging(true)}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 rounded-full transition-all"
              style={{
                backgroundColor: dividerDragging ? 'var(--color-accent)' : 'var(--color-border)',
                opacity: dividerDragging ? 1 : 0.5,
              }} />
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-white/5 transition-all" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RIGHT PANE: Plan Editor ── */}
      <AnimatePresence>
        {planPanelOpen && activePlan && (
          <motion.div
            initial={{ flexBasis: 0, opacity: 0 }}
            animate={{ flexBasis: '100%', opacity: 1 }}
            exit={{ flexBasis: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30 shadow-[0_28px_90px_rgba(2,8,23,0.26)]"
          >
            <div className="h-full w-full min-w-[360px] p-5">
              <PlanEditorPanel
                plan={activePlan}
                onClose={() => setPlanPanelOpen(false)}
                onUpdate={handlePlanUpdate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

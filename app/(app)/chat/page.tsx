'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, TeacherPrefs } from '@/app/lib/types';
import { Send, Mic, MicOff, Settings, Trash2, Sparkles, X, FileText, Download, Save, ChevronRight } from 'lucide-react';

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
    overview: '#6366F1',
    ac9: '#8B5CF6',
    walt: '#10B981',
    tib: '#10B981',
    wilf: '#10B981',
    lesson: '#F59E0B',
    assessment: '#EF4444',
    differentiation: '#F97316',
    resources: '#64748B',
    reflection: '#14B8A6',
  };
  return colors[type] || '#6366F1';
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <h3 className="text-sm font-semibold text-white">Unit Plan</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDOCX}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            title="Export DOCX"
          >
            <span className="font-medium">DOCX</span>
          </button>
          <button
            onClick={handleExportPPTX}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            title="Export PPTX"
          >
            <span className="font-medium">PPTX</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            title="Print / PDF"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--color-text-muted)' }}
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Plan title */}
      <div className="mb-4 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.15, border: '1px solid var(--color-accent)' }}>
        <p className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>{plan.title}</p>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {plan.sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* Section header */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ backgroundColor: `${getSectionColor(section.type)}15`, borderBottom: `1px solid ${getSectionColor(section.type)}30` }}
            >
              <span className="text-xs font-medium" style={{ color: getSectionColor(section.type) }}>
                {section.label}
              </span>
              <button
                onClick={() => startEdit(section)}
                className="text-xs px-2 py-0.5 rounded transition-all"
                style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}
              >
                Edit
              </button>
            </div>

            {/* Section content */}
            <div className="px-3 py-2">
              {editingId === section.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={Math.max(4, editValue.split('\n').length + 1)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(section.id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 rounded-lg text-xs"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm whitespace-pre-wrap"
                  style={{ color: section.content ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', fontStyle: section.content ? 'normal' : 'italic' }}
                >
                  {section.content || 'No content yet. Click Edit to add content.'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Chat Page ──────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: defaultWelcome, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<TeacherPrefs>({ name: '', yearLevel: '', subject: '', state: 'NSW' });
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

  // Load saved data
  useEffect(() => {
    const savedPrefs = localStorage.getItem(STORAGE_KEY);
    if (savedPrefs) {
      try { setPrefs(JSON.parse(savedPrefs)); } catch {}
    }
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (parsed.length > 0) setMessages(parsed);
      } catch {}
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
  }, [voiceListening]);

  const savePrefs = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setShowPrefs(false);
  };

  const handleSend = async (promptText?: string) => {
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
  };

  const clearHistory = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: defaultWelcome, timestamp: new Date() }]);
    localStorage.removeItem(HISTORY_KEY);
    setConversationStage('start');
    setActivePlan(null);
    setPlanPanelOpen(false);
  };

  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-semibold mt-3 mb-1" style={{ color: 'var(--color-accent)' }}>{line.replace('### ', '')}</h4>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-base font-semibold mt-4 mb-2" style={{ color: 'var(--color-accent)' }}>{line.replace('## ', '')}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('# ', '')}</h2>;
      if (line.startsWith('**') && line.endsWith('**') && !line.includes('**', 2)) return <p key={i} className="font-semibold text-white mt-2">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const text = line.replace(/^[-*]\s*/, '');
        return (
          <li key={i} className="ml-3 text-sm flex gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-accent)' }}>•</span><span>{text}</span>
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\./)?.[1] || '1';
        const text = line.replace(/^\d+\.\s*/, '');
        return <li key={i} className="ml-3 text-sm flex gap-2" style={{ color: 'var(--color-text-secondary)' }}><span style={{ color: 'var(--color-accent)' }} className="font-semibold min-w-[1.5rem]">{num}.</span><span>{text}</span></li>;
      }
      if (line.startsWith('```')) return null;
      if (line.trim() === '') return <br key={i} />;
      return (
        <p key={i} className="text-sm my-1" style={{ color: 'var(--color-text-secondary)' }}>
          {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  const handlePlanUpdate = (updated: ActivePlan) => {
    setActivePlan(updated);
  };

  return (
    <div className="flex h-full animate-fade-in" ref={containerRef}>
      {/* ── LEFT PANE: Chat ── */}
      <div
        className="flex flex-col h-full flex-shrink-0 overflow-hidden"
        style={{
          width: planPanelOpen ? `${leftPaneWidth}%` : '100%',
          transition: dividerDragging ? 'none' : 'width 0.2s ease',
        }}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Unit Planning Assistant
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {prefs.yearLevel && prefs.subject ? `${prefs.yearLevel} ${prefs.subject}` : 'Start a conversation'}
              {prefs.name && ` — ${prefs.name}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPrefs(!showPrefs)}
              className="p-2 rounded-lg text-sm transition-all flex items-center gap-1"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              title="Teacher preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={clearHistory}
              className="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        {/* Teacher Preferences */}
        <AnimatePresence>
          {showPrefs && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="text-sm font-semibold text-white mb-3">Your Teaching Context</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Your Name</label>
                    <input type="text" value={prefs.name} onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                      placeholder="Optional" className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'white' }} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>State</label>
                    <select value={prefs.state} onChange={(e) => setPrefs({ ...prefs, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'white' }}>
                      {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Year Level</label>
                    <select value={prefs.yearLevel} onChange={(e) => setPrefs({ ...prefs, yearLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'white' }}>
                      <option value="">Select year level</option>
                      {['F', '1', '2', '3', '4', '5', '6'].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Subject</label>
                    <select value={prefs.subject} onChange={(e) => setPrefs({ ...prefs, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'white' }}>
                      <option value="">Select subject</option>
                      {['English', 'Mathematics', 'Science', 'HASS', 'The Arts', 'Health & PE', 'Technologies'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={savePrefs} className="mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage Indicator */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          {(['start', 'topic', 'scope', 'building'] as const).map((stage, i) => (
            <div key={stage} className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full transition-all"
                style={conversationStage === stage ? { backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' } : { backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </span>
              {i < 3 && <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />}
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-xl border p-4 mb-4 space-y-4"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] rounded-2xl px-5 py-4"
                style={{
                  backgroundColor: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '2rem',
                }}>
                <div className="text-xs font-medium mb-2"
                  style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--color-accent)' }}>
                  {msg.role === 'user' ? (prefs.name || 'You') : '◈ TeachWise AI'}
                </div>
                <div className="text-sm leading-relaxed text-white">
                  {renderMessage(msg.content)}
                </div>
                <div className="text-xs mt-2" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderBottomLeftRadius: '4px' }}>
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

        {/* Open Plan Panel hint */}
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
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              >
                <FileText className="w-4 h-4" />
                View & Edit Unit Plan
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tip */}
        <p className="text-xs text-center mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Tip: Tell me your year level, subject and topic — I'll build you a full AC9-aligned unit plan
        </p>

        {/* Input */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            {(voiceListening || transcript) && (
              <div className="absolute -top-8 left-0 right-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs animate-pulse-glow"
                style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                <Mic className="w-3 h-3" />{transcript || 'Listening...'}
              </div>
            )}
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Tell me what you want to teach..." rows={1}
              className="w-full px-5 py-4 rounded-2xl border text-sm outline-none transition-all resize-none"
              style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', color: 'white' }} />
          </div>
          <button onClick={toggleVoice}
            className={`p-4 rounded-2xl transition-all flex-shrink-0 ${voiceListening ? 'animate-pulse-glow' : ''}`}
            style={{ backgroundColor: voiceListening ? 'var(--color-accent)' : 'var(--color-surface-raised)', border: voiceListening ? 'none' : '1px solid var(--color-border)', color: voiceListening ? 'white' : 'var(--color-text-muted)' }}
            title={voiceListening ? 'Stop listening' : 'Start voice input'}>
            {voiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={() => handleSend()} disabled={(!input.trim() && !transcript) || isTyping}
            className="px-8 py-4 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
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
            className="relative flex-shrink-0 cursor-col-resize group"
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
            className="flex-1 overflow-hidden border-l rounded-xl mx-1"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <div className="h-full w-full min-w-[360px] p-4">
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

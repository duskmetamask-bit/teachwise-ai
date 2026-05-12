'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SavedPlan } from '@/app/lib/types';
import { Mic, MicOff, Sparkles, Download, Copy, Save, Loader2, Calendar, BookOpen, Clock } from 'lucide-react';

// ─── Speech Recognition types ─────────────────────────────────────
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

// ─── Constants ──────────────────────────────────────────────────────
const YEAR_LEVELS = ['PP', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const SUBJECTS = ['English', 'Mathematics', 'Science', 'HASS', 'Technologies', 'The Arts', 'Health & PE'];
const DURATIONS = ['1-2 weeks', '3-4 weeks', '5-6 weeks', 'Term-long'];
const STORAGE_KEY = 'teachwise_saved_plans';

const SUBJECTS_DETAILED = ['English', 'Mathematics', 'Science', 'Humanities & Social Sciences', 'Digital Technologies', 'Health & Physical Education'];
const YEAR_LEVELS_DETAILED = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const LEARNING_AREAS = ['Number', 'Algebra', 'Measurement', 'Space', 'Statistics', 'Probability'];

// ─── Helpers ────────────────────────────────────────────────────────
function parsePlanContent(content: string) {
  const lines = content.split('\n');
  const sections: { walt?: string; tib?: string; wilf?: string[]; sequence?: string[]; resources?: string[]; diff?: { extension?: string; support?: string } } = {};
  let currentSection: string | null = null;
  let buffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toUpperCase().startsWith('WALT')) {
      currentSection = 'walt';
      buffer = [trimmed.replace(/^WALT[^:]*:\s*/i, '').replace(/^WALT\s*/i, '')];
    } else if (trimmed.toUpperCase().startsWith('TIB')) {
      if (currentSection === 'walt' && buffer.length) sections.walt = buffer.join(' ');
      currentSection = 'tib';
      buffer = [trimmed.replace(/^TIB[^:]*:\s*/i, '').replace(/^TIB\s*/i, '')];
    } else if (trimmed.toUpperCase().startsWith('WILF')) {
      if (currentSection === 'tib' && buffer.length) sections.tib = buffer.join(' ');
      currentSection = 'wilf';
      buffer = [];
    } else if (trimmed.match(/^(Lesson Sequence|-sequence|### (Lesson|Unstructured|Materials|Resources|Differentiation))/i)) {
      if (currentSection === 'wilf' && buffer.length) sections.wilf = [...buffer];
      else if (currentSection === 'tib' && buffer.length) sections.tib = buffer.join(' ');
      currentSection = 'sequence';
      buffer = [trimmed];
    } else if (trimmed.match(/^(Resources|Materials|### Resources)/i)) {
      if (currentSection === 'sequence' && buffer.length) sections.sequence = [...buffer];
      currentSection = 'resources';
      buffer = [trimmed];
    } else if (trimmed.match(/^(Differentiation|Support|Extension)/i)) {
      if (currentSection === 'resources' && buffer.length) sections.resources = [...buffer];
      currentSection = 'diff';
      buffer = [trimmed];
    } else if (trimmed.startsWith('- ') || trimmed.match(/^\d+\./)) {
      buffer.push(trimmed);
    } else if (trimmed && currentSection) {
      buffer.push(trimmed);
    }
  }

  if (currentSection === 'walt' && buffer.length && !sections.walt) sections.walt = buffer.join(' ');
  else if (currentSection === 'tib' && buffer.length && !sections.tib) sections.tib = buffer.join(' ');
  else if (currentSection === 'wilf' && buffer.length && !sections.wilf) sections.wilf = [...buffer];
  else if (currentSection === 'sequence' && buffer.length && !sections.sequence) sections.sequence = [...buffer];
  else if (currentSection === 'resources' && buffer.length && !sections.resources) sections.resources = [...buffer];
  else if (currentSection === 'diff' && buffer.length && !sections.diff) sections.diff = { extension: buffer.join('\n') };

  return sections;
}

function extractAc9Codes(content: string): string[] {
  const matches = content.match(/AC9[A-Z0-9]+/gi) || [];
  return [...new Set(matches.map(c => c.toUpperCase()))];
}

// ─── Voice Input Hook ───────────────────────────────────────────────
function useVoiceInput(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(interimTranscript || finalTranscript);

      if (finalTranscript) {
        onTranscript(finalTranscript);
        setTranscript('');
      }
    };

    recognition.onend = () => {
      setListening(false);
      setTranscript('');
    };

    recognition.onerror = () => {
      setListening(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onTranscript]);

  return { listening, transcript, toggle };
}

// ─── Voice-enabled Text Input ─────────────────────────────────────
function VoiceInput({ value, onChange, placeholder, rows = 1 }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  const [transcript, setTranscript] = useState('');
  const { listening, toggle } = useVoiceInput((text) => {
    onChange(text);
    setTranscript('');
  });

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="input-dark resize-none pr-12"
        style={{ minHeight: rows > 1 ? `${rows * 24}px` : undefined }}
      />
      <button
        type="button"
        onClick={toggle}
        className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${listening ? 'animate-pulse-glow' : ''}`}
        style={{
          backgroundColor: listening ? 'var(--color-accent)' : 'var(--color-border)',
          color: listening ? 'white' : 'var(--color-text-muted)',
        }}
        title={listening ? 'Stop listening' : 'Voice input'}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      {listening && transcript && (
        <div
          className="absolute -top-10 left-0 right-12 px-3 py-1.5 rounded-lg text-xs animate-fade-in"
          style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
        >
          <Mic className="w-3 h-3 inline mr-1" />
          {transcript}
        </div>
      )}
    </div>
  );
}

// ─── Quick Generate Tab ─────────────────────────────────────────────
function QuickGenerateTab() {
  const [yearLevel, setYearLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!yearLevel || !subject || !topic || !duration) return;
    setLoading(true);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'one-shot',
          data: { yearLevel, subject, topic, duration }
        }),
      });

      const data = await response.json();
      setResult(data.plan || 'Unable to generate unit plan. Please try again.');
    } catch {
      setResult('Error connecting to AI. Please try again.');
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setYearLevel('');
    setSubject('');
    setTopic('');
    setDuration('');
    setResult('');
    setShowResult(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    const savedPlans: SavedPlan[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newPlan: SavedPlan = {
      id: `saved-${Date.now()}`,
      title: topic,
      yearLevel,
      subject,
      topic,
      ac9Codes: extractAc9Codes(result),
      dateSaved: new Date().toLocaleDateString('en-AU'),
      rawContent: result,
    };
    savedPlans.unshift(newPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlans));
    alert('Plan saved to library!');
  };

  const parsed = parsePlanContent(result);

  if (!showResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Quick Generate</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Generate a complete unit plan in one shot
          </p>
        </div>

        <div className="space-y-5">
          {/* Year Level + Subject */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Year Level</label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="input-dark"
              >
                <option value="">Select year level</option>
                {YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label-dark">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-dark"
              >
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Topic with voice */}
          <div>
            <label className="label-dark">Topic</label>
            <VoiceInput
              value={topic}
              onChange={setTopic}
              placeholder="e.g. Fractions, Persuasive Writing, The Water Cycle"
              rows={2}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="label-dark">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input-dark"
            >
              <option value="">Select duration</option>
              {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!yearLevel || !subject || !topic || !duration || loading}
            className="w-full py-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating unit plan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Unit Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Result view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Unit Plan</h2>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {yearLevel} {subject} — {topic} ({duration})
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            ← New Plan
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Copy className="w-3 h-3" />
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleSaveToLibrary}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Save className="w-3 h-3" />
            Save to Library
          </button>
        </div>
      </div>

      {/* WALT/TIB/WILF Cards */}
      {(parsed.walt || parsed.tib || parsed.wilf) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {parsed.walt && (
            <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--color-surface)', borderLeftColor: 'var(--color-accent)' }}>
              <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>WALT</div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{parsed.walt}</div>
            </div>
          )}
          {parsed.tib && (
            <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--color-surface)', borderLeftColor: 'var(--color-accent)' }}>
              <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>TIB</div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{parsed.tib}</div>
            </div>
          )}
          {parsed.wilf && (
            <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--color-surface)', borderLeftColor: 'var(--color-accent)' }}>
              <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>WILF</div>
              <ul className="space-y-1">
                {parsed.wilf.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--color-text)' }}>
                    <span style={{ color: 'var(--color-accent)' }}>✓</span>
                    {item.replace(/^[-\d.]\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Full content */}
      <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {result.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--color-accent)' }}>{line.replace('## ', '')}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
            if (line.match(/^\d+\./)) return <li key={i} className="ml-4 my-1" style={{ color: 'var(--color-text-secondary)' }}>{line.replace(/^\d+\.\s*/, '')}</li>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 my-1" style={{ color: 'var(--color-text-secondary)' }}>{line.replace('- ', '')}</li>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="my-1">{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Detailed Plan Tab ──────────────────────────────────────────────
function DetailedPlanTab() {
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [specificOutcome, setSpecificOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const year = searchParams.get('year');
    const subjectParam = searchParams.get('subject');
    if (year) setYearLevel(decodeURIComponent(year));
    if (subjectParam) setSubject(decodeURIComponent(subjectParam));
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!subject || !yearLevel || !topic) return;
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Create a detailed lesson plan for ${yearLevel} ${subject} on the topic of "${topic}". Include: WALT, TIB, WILF, lesson sequence with timings, resources needed, and differentiation strategies. Reference AC9 codes where relevant.`
          }]
        }),
      });

      const data = await response.json();
      setResult(data.response || 'Unable to generate lesson plan. Please try again.');
    } catch {
      setResult('Error connecting to AI. Please try again.');
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  const handleSaveToLibrary = () => {
    const savedPlans: SavedPlan[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newPlan: SavedPlan = {
      id: `saved-${Date.now()}`,
      title: topic,
      yearLevel,
      subject,
      topic,
      ac9Codes: extractAc9Codes(result),
      dateSaved: new Date().toLocaleDateString('en-AU'),
      rawContent: result,
    };
    savedPlans.unshift(newPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlans));
    alert('Plan saved to library!');
  };

  const handleReset = () => {
    setSubject('');
    setYearLevel('');
    setTopic('');
    setSpecificOutcome('');
    setResult('');
    setShowResult(false);
  };

  const parsed = parsePlanContent(result);

  if (!showResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Detailed Plan</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Build a lesson step-by-step with WALT, TIB, and WILF
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-dark">
                <option value="">Select subject</option>
                {SUBJECTS_DETAILED.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-dark">Year Level</label>
              <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className="input-dark">
                <option value="">Select year</option>
                {YEAR_LEVELS_DETAILED.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label-dark">Topic</label>
            <VoiceInput
              value={topic}
              onChange={setTopic}
              placeholder="e.g. Fractions, Persuasive Writing, The Water Cycle"
              rows={2}
            />
          </div>

          <div>
            <label className="label-dark">
              Specific AC9 Outcome <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={specificOutcome}
              onChange={(e) => setSpecificOutcome(e.target.value)}
              placeholder="e.g. AC9MFN04, ACELY1701"
              className="input-dark"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Add a specific AC9 code to align your lesson exactly</p>
          </div>

          <div>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>Quick start with a template:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '📐 Maths Inquiry', topic: 'Multiplication Strategies', subject: 'Mathematics' },
                { label: '✍️ English Writing', topic: 'Narrative Writing', subject: 'English' },
                { label: '🔬 Science Experiment', topic: 'Forces and Motion', subject: 'Science' },
                { label: '🌍 HASS Investigation', topic: 'Australian Environments', subject: 'Humanities & Social Sciences' },
              ].map((template) => (
                <button
                  key={template.label}
                  onClick={() => {
                    setTopic(template.topic);
                    setSubject(template.subject);
                  }}
                  className="px-3 py-2 rounded-lg text-xs transition-all"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!subject || !yearLevel || !topic || loading}
            className="w-full py-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating your lesson plan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Lesson Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Lesson Plan</h2>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{yearLevel} {subject} — {topic}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-xs transition-all"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            ← New Plan
          </button>
          <button
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            <Download className="w-3 h-3" />
            Export PDF
          </button>
        </div>
      </div>

      {(parsed.walt || parsed.tib || parsed.wilf) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {parsed.walt && (
            <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--color-surface)', borderLeftColor: 'var(--color-accent)' }}>
              <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>WALT</div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{parsed.walt}</div>
            </div>
          )}
          {parsed.tib && (
            <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--color-surface)', borderLeftColor: 'var(--color-accent)' }}>
              <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>TIB</div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{parsed.tib}</div>
            </div>
          )}
          {parsed.wilf && (
            <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--color-surface)', borderLeftColor: 'var(--color-accent)' }}>
              <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>WILF</div>
              <ul className="space-y-1">
                {parsed.wilf.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--color-text)' }}>
                    <span style={{ color: 'var(--color-accent)' }}>✓</span>
                    {item.replace(/^[-\d.]\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {result.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--color-accent)' }}>{line.replace('## ', '')}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
            if (line.match(/^\d+\./)) return <li key={i} className="ml-4 my-1" style={{ color: 'var(--color-text-secondary)' }}>{line.replace(/^\d+\.\s*/, '')}</li>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 my-1" style={{ color: 'var(--color-text-secondary)' }}>{line.replace('- ', '')}</li>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="my-1">{line}</p>;
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Create Worksheet', icon: BookOpen, desc: 'Generate activities for this lesson' },
          { label: 'Build Rubric', icon: BookOpen, desc: 'Create assessment criteria' },
          { label: 'Save to Library', icon: Save, desc: 'Store in your unit library', onClick: handleSaveToLibrary },
        ].map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="p-4 rounded-xl border transition-all text-left group"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="text-2xl mb-2"><action.icon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} /></div>
            <div className="text-sm font-medium text-white group-hover:text-[var(--color-accent)] transition-colors">{action.label}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{action.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Planner Page ──────────────────────────────────────────────
function PlannerContent() {
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick');

  return (
    <div className="animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('quick')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'quick' ? '' : ''
          }`}
          style={
            activeTab === 'quick'
              ? { backgroundColor: 'var(--color-accent)', color: 'white' }
              : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }
          }
        >
          <Sparkles className="w-4 h-4" />
          Quick Generate
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'detailed' ? '' : ''
          }`}
          style={
            activeTab === 'detailed'
              ? { backgroundColor: 'var(--color-accent)', color: 'white' }
              : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }
          }
        >
          <Calendar className="w-4 h-4" />
          Detailed Plan
        </button>
      </div>

      {activeTab === 'quick' ? <QuickGenerateTab /> : <DetailedPlanTab />}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</span>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PlannerContent />
    </Suspense>
  );
}
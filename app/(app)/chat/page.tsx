'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Message, TeacherPrefs } from '@/app/lib/types';
import { Send, Mic, MicOff, Settings, Trash2, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'teachwise_prefs';
const HISTORY_KEY = 'teachwise_chat_history';

const quickActions = [
  { label: 'Plan a lesson', icon: Sparkles, targetPage: '/planner', prefill: 'lesson' },
  { label: 'Create a rubric', icon: Settings, targetPage: '/rubrics', prefill: 'rubric' },
  { label: 'Build a unit', icon: Sparkles, targetPage: '/units', prefill: 'unit' },
  { label: 'Mark student work', icon: Settings, targetPage: '/automark', prefill: 'automark' },
];

const defaultWelcome = `👋 **TeachWise AI — your teaching assistant**

I'm aligned to the Australian Curriculum v9 (AC9) and I'm here to help you build better lessons, faster.

**What I can help with:**
• **Lesson planning** — AC9-aligned, with content descriptors, elaborations, and cross-curriculum priorities
• **Rubrics** — Analytic or holistic, linked to achievement standards by year level
• **Unit building** — Structured sequences with duration, assessment, and resources
• **Auto-marking** — Upload student work + rubric, get structured feedback instantly

Just tell me what year level, subject, and topic you're working on — I'll take it from there.`;

// Speech Recognition type declarations
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: defaultWelcome,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<TeacherPrefs>({
    name: '',
    yearLevel: '',
    subject: '',
    state: 'NSW',
  });
  const [conversationStage, setConversationStage] = useState<'start' | 'topic' | 'scope' | 'building' | 'done'>('start');
  const [voiceListening, setVoiceListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem(STORAGE_KEY);
    if (savedPrefs) {
      try {
        setPrefs(JSON.parse(savedPrefs));
      } catch (e) {
        console.log('No saved prefs');
      }
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed.length > 0 ? parsed : messages);
      } catch (e) {
        console.log('No saved history');
      }
    }

    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice toggle
  const toggleVoice = useCallback(() => {
    if (voiceListening) {
      recognitionRef.current?.stop();
      setVoiceListening(false);
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
        setInput(finalTranscript);
        setVoiceListening(false);
        recognition.stop();
        // Auto-submit
        handleSend(finalTranscript);
      }
    };

    recognition.onend = () => {
      setVoiceListening(false);
      setTranscript('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setVoiceListening(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceListening(true);
  }, [voiceListening, input]);

  const savePrefs = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setShowPrefs(false);
  };

  const handleSend = async (promptText?: string) => {
    const text = promptText || input;
    if (!text.trim()) return;

    if (text.toLowerCase().includes('year') || text.match(/\d/)) {
      setConversationStage('topic');
    } else if (text.toLowerCase().includes('topic') || text.toLowerCase().includes('teach')) {
      setConversationStage('scope');
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...conversationHistory, { role: 'user', content: text }],
          teacherPrefs: prefs
        }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setTimeout(() => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm here and ready to help you plan! What year level and subject are you working with? Or tell me what you're trying to teach — I'll guide you through the rest.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: defaultWelcome,
      timestamp: new Date(),
    }]);
    localStorage.removeItem(HISTORY_KEY);
    setConversationStage('start');
  };

  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-sm font-semibold mt-3 mb-1" style={{ color: 'var(--color-accent)' }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-base font-semibold mt-4 mb-2" style={{ color: 'var(--color-accent)' }}>{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('# ', '')}</h2>;
      }
      if (line.startsWith('**') && line.endsWith('**') && !line.includes('**', 2)) {
        return <p key={i} className="font-semibold text-white mt-2">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const text = line.replace(/^[-*]\s*/, '');
        if (text.match(/^\d+\./)) {
          return <li key={i} className="ml-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{text.replace(/^\d+\.\s*/, '')}</li>;
        }
        return (
          <li key={i} className="ml-3 text-sm flex gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-accent)' }}>•</span>
            <span>{text}</span>
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\./)?.[1] || '1';
        const text = line.replace(/^\d+\.\s*/, '');
        return (
          <li key={i} className="ml-3 text-sm flex gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-accent)' }} className="font-semibold min-w-[1.5rem]">{num}.</span>
            <span>{text}</span>
          </li>
        );
      }
      if (line.startsWith('```')) {
        return null;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return (
        <p key={i} className="text-sm my-1" style={{ color: 'var(--color-text-secondary)' }}>
          {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
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
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Teacher Preferences Panel */}
      {showPrefs && (
        <div className="mb-4 p-4 rounded-xl border animate-fade-in" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h3 className="text-sm font-semibold text-white mb-3">Your Teaching Context</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Your Name</label>
              <input
                type="text"
                value={prefs.name}
                onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'white' }}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>State</label>
              <select
                value={prefs.state}
                onChange={(e) => setPrefs({ ...prefs, state: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'white' }}
              >
                {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Year Level</label>
              <input
                type="text"
                value={prefs.yearLevel}
                onChange={(e) => setPrefs({ ...prefs, yearLevel: e.target.value })}
                placeholder="e.g. Year 4"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'white' }}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Subject Focus</label>
              <input
                type="text"
                value={prefs.subject}
                onChange={(e) => setPrefs({ ...prefs, subject: e.target.value })}
                placeholder="e.g. Mathematics"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'white' }}
              />
            </div>
          </div>
          <button
            onClick={savePrefs}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Save Preferences
          </button>
        </div>
      )}

      {/* Stage Indicator */}
      <div className="flex items-center gap-2 mb-4 text-xs">
        {['start', 'topic', 'scope', 'building'].map((stage, i) => (
          <div key={stage} className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded-full transition-all"
              style={
                conversationStage === stage
                  ? { backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }
                  : { backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }
              }
            >
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </span>
            {i < 3 && <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto rounded-xl border p-4 mb-4 space-y-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] rounded-2xl px-5 py-4"
              style={{
                backgroundColor: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '2rem',
              }}
            >
              <div
                className="text-xs font-medium mb-2"
                style={{
                  color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--color-accent)'
                }}
              >
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
            <div
              className="rounded-2xl px-5 py-4"
              style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderBottomLeftRadius: '4px' }}
            >
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickActions.map((action) => {
          const params = new URLSearchParams({ prefill: action.prefill });
          if (prefs.yearLevel) params.set('year', prefs.yearLevel);
          if (prefs.subject) params.set('subject', prefs.subject);
          const href = `${action.targetPage}?${params.toString()}`;
          return (
            <Link
              key={action.label}
              href={href}
              className="px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              <action.icon className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
              {action.label}
            </Link>
          );
        })}
      </div>

      {/* Tip */}
      <p className="text-xs text-center mt-3 mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Tip: I can also help with rubric design, unit planning, and auto-marking student work
      </p>

      {/* Input with Voice */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          {(voiceListening || transcript) && (
            <div
              className="absolute -top-8 left-0 right-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs animate-pulse-glow"
              style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
            >
              <Mic className="w-3 h-3" />
              {transcript || 'Listening...'}
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tell me what you want to teach..."
            rows={1}
            className="w-full px-5 py-4 rounded-2xl border text-sm outline-none transition-all resize-none"
            style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', color: 'white' }}
          />
        </div>

        {/* Mic Button */}
        <button
          onClick={toggleVoice}
          className={`p-4 rounded-2xl transition-all flex-shrink-0 ${
            voiceListening ? 'animate-pulse-glow' : ''
          }`}
          style={{
            backgroundColor: voiceListening ? 'var(--color-accent)' : 'var(--color-surface-raised)',
            border: voiceListening ? 'none' : '1px solid var(--color-border)',
            color: voiceListening ? 'white' : 'var(--color-text-muted)',
          }}
          title={voiceListening ? 'Stop listening' : 'Start voice input'}
        >
          {voiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send Button */}
        <button
          onClick={() => handleSend()}
          disabled={(!input.trim() && !transcript) || isTyping}
          className="px-8 py-4 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
}
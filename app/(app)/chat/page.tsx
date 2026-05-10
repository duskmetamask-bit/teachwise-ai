'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, TeacherPrefs } from '@/app/lib/types';

const STORAGE_KEY = 'teachwise_prefs';
const HISTORY_KEY = 'teachwise_chat_history';

const quickActions = [
  { label: 'Create a unit plan', icon: '◇', prompt: 'Help me create a unit plan for...' },
  { label: 'Plan a lesson', icon: '◉', prompt: 'I need a lesson plan for...' },
  { label: 'Differentiate', icon: '◎', prompt: 'Help me differentiate this for...' },
  { label: 'Create a rubric', icon: '✧', prompt: 'Create a rubric for...' },
];

const defaultWelcome = `👋 **Welcome to TeachWise AI**

I'm here to help you plan units, lessons, and assessments aligned to the Australian Curriculum (AC9).

**Let's start planning!**

What year level and subject are you working with? Or tell me what you're trying to teach — I'll guide you through the rest.`;

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

  const savePrefs = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setShowPrefs(false);
  };

  const handleSend = async (promptText?: string) => {
    const text = promptText || input;
    if (!text.trim()) return;
    
    // Update conversation stage based on input
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
      // Friendly fallback
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
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-sm font-semibold text-[#00D4AA] mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-base font-semibold text-[#00D4AA] mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('# ', '')}</h2>;
      }
      // Bold
      if (line.startsWith('**') && line.endsWith('**') && !line.includes('**', 2)) {
        return <p key={i} className="font-semibold text-white mt-2">{line.replace(/\*\*/g, '')}</p>;
      }
      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const text = line.replace(/^[-*]\s*/, '');
        if (text.match(/^\d+\./)) {
          return <li key={i} className="ml-3 text-sm text-[#E6EDF3]">{text.replace(/^\d+\.\s*/, '')}</li>;
        }
        return (
          <li key={i} className="ml-3 text-sm text-[#E6EDF3] flex gap-2">
            <span className="text-[#00D4AA] mt-1">•</span>
            <span>{text}</span>
          </li>
        );
      }
      // Numbered lists
      if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\./)?.[1] || '1';
        const text = line.replace(/^\d+\.\s*/, '');
        return (
          <li key={i} className="ml-3 text-sm text-[#E6EDF3] flex gap-2">
            <span className="text-[#00D4AA] font-semibold min-w-[1.5rem]">{num}.</span>
            <span>{text}</span>
          </li>
        );
      }
      // Code blocks
      if (line.startsWith('```')) {
        return null;
      }
      // Empty lines
      if (line.trim() === '') {
        return <br key={i} />;
      }
      // Regular paragraphs with inline bold
      return (
        <p key={i} className="text-sm text-[#E6EDF3] my-1">
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
            <span className="text-[#00D4AA]">◈</span>
            Unit Planning Assistant
          </h2>
          <p className="text-xs text-[#6E7681]">
            {prefs.yearLevel && prefs.subject ? `${prefs.yearLevel} ${prefs.subject}` : 'Start a conversation'}
            {prefs.name && ` — ${prefs.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPrefs(!showPrefs)}
            className="p-2 rounded-lg bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#00D4AA] hover:border-[#00D4AA]/50 transition-all text-sm"
            title="Teacher preferences"
          >
            ◎
          </button>
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#EF4444] hover:border-[#EF4444]/50 transition-all text-xs"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Teacher Preferences Panel */}
      {showPrefs && (
        <div className="mb-4 p-4 rounded-xl border border-[#30363D] bg-[#161B22] animate-slide-down">
          <h3 className="text-sm font-semibold text-white mb-3">Your Teaching Context</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#6E7681] mb-1 block">Your Name</label>
              <input
                type="text"
                value={prefs.name}
                onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-white text-sm outline-none focus:border-[#00D4AA]/50"
              />
            </div>
            <div>
              <label className="text-xs text-[#6E7681] mb-1 block">State</label>
              <select
                value={prefs.state}
                onChange={(e) => setPrefs({ ...prefs, state: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-white text-sm outline-none focus:border-[#00D4AA]/50"
              >
                {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#6E7681] mb-1 block">Year Level</label>
              <input
                type="text"
                value={prefs.yearLevel}
                onChange={(e) => setPrefs({ ...prefs, yearLevel: e.target.value })}
                placeholder="e.g. Year 4"
                className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-white text-sm outline-none focus:border-[#00D4AA]/50"
              />
            </div>
            <div>
              <label className="text-xs text-[#6E7681] mb-1 block">Subject Focus</label>
              <input
                type="text"
                value={prefs.subject}
                onChange={(e) => setPrefs({ ...prefs, subject: e.target.value })}
                placeholder="e.g. Mathematics"
                className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-white text-sm outline-none focus:border-[#00D4AA]/50"
              />
            </div>
          </div>
          <button
            onClick={savePrefs}
            className="mt-3 px-4 py-2 rounded-lg bg-[#00D4AA] text-[#0D1117] text-sm font-medium hover:bg-[#00E4BA] transition-all"
          >
            Save Preferences
          </button>
        </div>
      )}

      {/* Stage Indicator */}
      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className={`px-2 py-1 rounded-full ${conversationStage === 'start' ? 'bg-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#30363D] text-[#6E7681]'}`}>
          Start
        </span>
        <div className="flex-1 h-px bg-[#30363D]" />
        <span className={`px-2 py-1 rounded-full ${conversationStage === 'topic' ? 'bg-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#30363D] text-[#6E7681]'}`}>
          Topic
        </span>
        <div className="flex-1 h-px bg-[#30363D]" />
        <span className={`px-2 py-1 rounded-full ${conversationStage === 'scope' ? 'bg-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#30363D] text-[#6E7681]'}`}>
          Scope
        </span>
        <div className="flex-1 h-px bg-[#30363D]" />
        <span className={`px-2 py-1 rounded-full ${conversationStage === 'building' ? 'bg-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#30363D] text-[#6E7681]'}`}>
          Building
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#30363D] bg-[#161B22] p-4 mb-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] rounded-2xl px-5 py-4"
              style={{
                backgroundColor: msg.role === 'user' ? '#00D4AA' : '#1C2128',
                border: msg.role === 'user' ? 'none' : '1px solid #30363D',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '2rem',
              }}
            >
              <div className="text-xs font-medium mb-2" style={{ color: msg.role === 'user' ? 'rgba(0,0,0,0.4)' : '#00D4AA' }}>
                {msg.role === 'user' ? (prefs.name || 'You') : '◈ TeachWise AI'}
              </div>
              <div className="text-sm leading-relaxed">
                {renderMessage(msg.content)}
              </div>
              <div className="text-xs mt-2" style={{ color: msg.role === 'user' ? 'rgba(0,0,0,0.4)' : '#6E7681' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-5 py-4 bg-[#1C2128] border border-[#30363D]" style={{ borderBottomLeftRadius: '4px' }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce bg-[#00D4AA]" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce bg-[#00D4AA]" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce bg-[#00D4AA]" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-[#6E7681]">Planning your unit...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleSend(action.prompt)}
            disabled={isTyping}
            className="px-3 py-2 rounded-lg text-xs bg-[#0D1117] border border-[#30363D] text-[#8B949E] hover:border-[#00D4AA]/50 hover:text-[#00D4AA] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="text-[#00D4AA]">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Tell me what you want to teach..."
          className="flex-1 px-5 py-4 rounded-2xl border border-[#30363D] bg-[#161B22] text-white text-sm outline-none transition-all focus:border-[#00D4AA]/50 focus:ring-2 focus:ring-[#00D4AA]/10"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="px-8 py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#00D4AA] text-[#0D1117] hover:bg-[#00E4BA] shadow-lg shadow-[#00D4AA]/20"
        >
          {isTyping ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
          ) : 'Send'}
        </button>
      </div>
    </div>
  );
}

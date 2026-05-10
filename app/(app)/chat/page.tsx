'use client';

import { useState, useRef, useEffect } from 'react';
import { mockChatHistory, mockChatResponses } from '@/app/lib/mockData';
import { Message } from '@/app/lib/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockChatHistory);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...conversationHistory, { role: 'user', content: input }] }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Fallback to mock response if API fails
      console.log('Using mock response fallback');
      setTimeout(() => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: mockChatResponses.default,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Chat Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">AI Teaching Assistant</h2>
        <p className="text-xs text-[#6E7681]">
          Ask about lesson plans, assessments, behaviour support, differentiation, or anything else
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#30363D] bg-[#161B22] p-4 mb-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[80%] rounded-xl px-4 py-3"
              style={{
                backgroundColor: msg.role === 'user' ? '#00D4AA' : '#1C2128',
                border: msg.role === 'user' ? 'none' : '1px solid #30363D',
              }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: msg.role === 'user' ? 'rgba(0,0,0,0.5)' : '#00D4AA' }}>
                {msg.role === 'user' ? 'You' : 'TeachWise AI'}
              </div>
              <div 
                className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
                style={{ 
                  color: msg.role === 'user' ? '#0D1117' : '#E6EDF3',
                }}
              >
                {msg.content.split('\n').map((line, i) => {
                  // Format markdown-style content
                  if (line.startsWith('## ')) {
                    return <h3 key={i} className="text-base font-semibold text-[#00D4AA] mt-3 mb-1">{line.replace('## ', '')}</h3>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-3">{line.replace('- ', '')}</li>;
                  }
                  if (line.match(/^\d+\./)) {
                    return <li key={i} className="ml-3">{line.replace(/^\d+\.\s*/, '')}</li>;
                  }
                  if (line.match(/^\|.*\|$/)) {
                    return null; // Skip markdown tables for now
                  }
                  if (line.trim() === '') {
                    return <br key={i} />;
                  }
                  return <p key={i} className="my-1">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                })}
              </div>
              <div className="text-xs text-[#6E7681] mt-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-xl px-4 py-3 bg-[#1C2128] border border-[#30363D]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#00D4AA]" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#00D4AA]" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#00D4AA]" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-[#6E7681]">TeachWise is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          'Create a lesson plan',
          'Generate a rubric',
          'Differentiate for EAL/D',
          'Behaviour strategies',
        ].map((action) => (
          <button
            key={action}
            onClick={() => setInput(action)}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:border-[#00D4AA]/50 hover:text-[#00D4AA] transition-all"
          >
            {action}
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
          placeholder="Ask me anything about teaching..."
          className="flex-1 px-4 py-3 rounded-xl border border-[#30363D] bg-[#161B22] text-white text-sm outline-none transition-all focus:border-[#00D4AA]/50 focus:ring-2 focus:ring-[#00D4AA]/20"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#00D4AA] text-[#0D1117] hover:bg-[#00E4BA]"
        >
          {isTyping ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending
            </span>
          ) : 'Send'}
        </button>
      </div>
    </div>
  );
}
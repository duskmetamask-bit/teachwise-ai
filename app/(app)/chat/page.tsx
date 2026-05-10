'use client';

import { useState, useRef, useEffect } from 'react';
import { mockChatHistory, mockChatResponses } from '@/app/lib/mockData';
import { Message } from '@/app/lib/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockChatHistory);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockChatResponses.default,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Chat Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">AI Teaching Assistant</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Ask about lesson plans, assessments, behaviour support, differentiation, or anything else
        </p>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto rounded-xl border p-4 mb-4 space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[80%] rounded-xl px-4 py-3"
              style={{
                backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
              }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: msg.role === 'user' ? 'rgba(0,0,0,0.5)' : 'var(--accent)' }}>
                {msg.role === 'user' ? 'You' : 'TeachWise AI'}
              </div>
              <div className="text-sm whitespace-pre-wrap" style={{ color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)' }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '300ms' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>TeachWise is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask me anything about teaching..."
          className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all input-glow"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: input.trim() ? 'var(--accent)' : 'var(--bg-card)',
            color: input.trim() ? 'var(--bg-primary)' : 'var(--text-muted)',
            border: `1px solid ${input.trim() ? 'var(--accent)' : 'var(--border)'}`,
            cursor: input.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
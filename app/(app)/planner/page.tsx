'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  GripVertical,
  Trash2,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  BookOpen,
  Target,
  Lightbulb,
  Mic,
  MicOff,
} from 'lucide-react';

// ─── Block Types ────────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'learning_intention', label: 'Learning Intention', icon: Target, color: '#10B981' },
  { type: 'success_criteria', label: 'Success Criteria', icon: BookOpen, color: '#10B981' },
  { type: 'hook', label: 'Hook', icon: Lightbulb, color: '#F59E0B' },
  { type: 'explicit_teaching', label: 'Explicit Teaching', icon: BookOpen, color: '#6366F1' },
  { type: 'guided_practice', label: 'Guided Practice', icon: BookOpen, color: '#8B5CF6' },
  { type: 'independent_practice', label: 'Independent Practice', icon: BookOpen, color: '#EC4899' },
  { type: 'reflection', label: 'Reflection', icon: Lightbulb, color: '#14B8A6' },
  { type: 'resources', label: 'Resources', icon: BookOpen, color: '#64748B' },
  { type: 'differentiation', label: 'Differentiation', icon: Target, color: '#F97316' },
] as const;

type BlockType = typeof BLOCK_TYPES[number]['type'];

interface Block {
  id: string;
  type: BlockType;
  content: string;
  generating: boolean;
}

// ─── Voice Input ────────────────────────────────────────────────
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

function useVoiceInput(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      if (final) {
        onTranscript(final);
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onTranscript]);

  return { listening, toggle };
}

// ─── Helpers ────────────────────────────────────────────────────
function getBlockMeta(type: BlockType) {
  return BLOCK_TYPES.find((b) => b.type === type)!;
}

function getDefaultContent(type: BlockType): string {
  switch (type) {
    case 'learning_intention': return 'We are learning to... (AC9 code)';
    case 'success_criteria': return 'I can...\nI can...';
    case 'hook': return '';
    case 'explicit_teaching': return 'Timing: \nKey points:\n';
    case 'guided_practice': return 'Timing: \nActivities:\n';
    case 'independent_practice': return 'Timing: \nTask:\n';
    case 'reflection': return 'Exit ticket / reflection question:\n';
    case 'resources': return 'Resources needed:\n';
    case 'differentiation': return 'Extension:\nSupport:\n';
    default: return '';
  }
}

const STORAGE_KEY_BLOCKS = 'teachwise_blocks';

function loadBlocks(): Block[] {
  if (typeof window === 'undefined') return [makeBlock('learning_intention')];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BLOCKS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [makeBlock('learning_intention')];
}

function saveBlocks(blocks: Block[]) {
  localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(blocks));
}

function makeBlock(type: BlockType): Block {
  return { id: `block-${Date.now()}-${Math.random()}`, type, content: getDefaultContent(type), generating: false };
}

// ─── Auto-resize Textarea ───────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed placeholder:text-[var(--color-text-muted)]"
      style={{ color: 'var(--color-text)' }}
    />
  );
}

// ─── Shimmer Skeleton ───────────────────────────────────────────
function ShimmerBlock({ color }: { color: string }) {
  return (
    <div className="space-y-2 p-1">
      {[100, 80, 60].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded animate-pulse"
          style={{ width: `${w}%`, backgroundColor: `${color}30` }}
        />
      ))}
    </div>
  );
}

// ─── Block Component ─────────────────────────────────────────────
function BlockItem({ block, onUpdate, onDelete, onGenerate, isFirst }: {
  block: Block;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string, type: BlockType, buttonRect: DOMRect) => void;
  isFirst: boolean;
}) {
  const meta = getBlockMeta(block.type);
  const [btnRef, setBtnRef] = useState<HTMLButtonElement | null>(null);
  const { listening, toggle } = useVoiceInput((text) => {
    onUpdate(block.id, block.content + text);
  });

  const handleGenerate = () => {
    if (btnRef) {
      const rect = btnRef.getBoundingClientRect();
      onGenerate(block.id, block.type, rect);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex gap-3"
    >
      {/* Color accent bar */}
      <div
        className="w-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: meta.color }}
      />

      {/* Content area */}
      <div
        className="flex-1 rounded-xl border py-3 px-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Block header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 cursor-grab" style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: meta.color }}>{meta.label}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Voice */}
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: listening ? meta.color : 'transparent',
                color: listening ? 'white' : 'var(--color-text-muted)',
              }}
              title={listening ? 'Stop' : 'Voice input'}
            >
              {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            {/* AI Generate */}
            <button
              ref={setBtnRef}
              onClick={handleGenerate}
              disabled={block.generating}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
            >
              {block.generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              AI
            </button>
            {/* Delete */}
            <button
              onClick={() => onDelete(block.id)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {block.generating ? (
          <ShimmerBlock color={meta.color} />
        ) : (
          <AutoTextarea
            value={block.content}
            onChange={(v) => onUpdate(block.id, v)}
            placeholder={`Enter ${meta.label.toLowerCase()}...`}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── Block Library Panel ─────────────────────────────────────────
function BlockLibrary({ onAdd }: { onAdd: (type: BlockType, rect: DOMRect) => void }) {
  const [refs, setRefs] = useState<Record<BlockType, HTMLButtonElement | null>>({} as Record<BlockType, HTMLButtonElement | null>);

  return (
    <div className="w-80 flex-shrink-0">
      <h3 className="text-sm font-medium text-white mb-3">Block Library</h3>
      <div className="space-y-1.5">
        {BLOCK_TYPES.map((bt) => (
          <button
            key={bt.type}
            ref={(el) => setRefs((prev) => ({ ...prev, [bt.type]: el }))}
            onClick={() => {
              const ref = refs[bt.type];
              if (ref) {
                const rect = ref.getBoundingClientRect();
                onAdd(bt.type, rect);
              }
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: bt.color }} />
            <span>{bt.label}</span>
            <Plus className="w-3 h-3 ml-auto opacity-50" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Planner Page ───────────────────────────────────────────
export default function PlannerPage() {
  const [blocks, setBlocks] = useState<Block[]>([makeBlock('learning_intention')]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    setBlocks(loadBlocks());
  }, []);

  const updateBlock = useCallback((id: string, content: string) => {
    setBlocks((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, content } : b));
      saveBlocks(updated);
      return updated;
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveBlocks(updated);
      return updated;
    });
  }, []);

  const addBlock = useCallback((type: BlockType, _rect?: DOMRect) => {
    const newBlock = makeBlock(type);
    setBlocks((prev) => {
      const updated = [...prev, newBlock];
      saveBlocks(updated);
      return updated;
    });
  }, []);

  const handleGenerate = useCallback(async (id: string, type: BlockType, buttonRect: DOMRect) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, generating: true } : b))
    );
    setGeneratingId(id);

    // Get class context
    let classContext = {};
    try {
      const saved = localStorage.getItem('teachwise_class_context');
      if (saved) classContext = JSON.parse(saved);
    } catch {}

    const blockMeta = getBlockMeta(type);
    const prompt = `Generate content for a "${blockMeta.label}" block for a lesson plan.
${classContext ? `Class context: ${JSON.stringify(classContext)}` : ''}
Respond with only the content, no markdown formatting beyond basic lists.`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          classContext,
        }),
      });
      const data = await response.json();
      const generated = data.response || '';

      // Typewriter effect
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content: generated, generating: false } : b))
      );
    } catch {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, generating: false } : b))
      );
    } finally {
      setGeneratingId(null);
    }
  }, []);

  const handleReorder = useCallback((newOrder: Block[]) => {
    setBlocks(newOrder);
    saveBlocks(newOrder);
  }, []);

  return (
    <div className="flex gap-6 animate-fade-in h-full">
      {/* Block Library */}
      <BlockLibrary onAdd={addBlock} />

      {/* Block Stack */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Lesson Plan</h2>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <Reorder.Group
          axis="y"
          values={blocks}
          onReorder={handleReorder}
          className="space-y-3"
        >
          <AnimatePresence>
            {blocks.map((block) => (
              <Reorder.Item key={block.id} value={block}>
                <BlockItem
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  onGenerate={handleGenerate}
                  isFirst={blocks.indexOf(block) === 0}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* Add block button */}
        <button
          onClick={() => addBlock('hook')}
          className="mt-4 w-full py-3 rounded-xl border-2 border-dashed text-sm flex items-center justify-center gap-2 transition-all"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <Plus className="w-4 h-4" />
          Add Block
        </button>
      </div>
    </div>
  );
}
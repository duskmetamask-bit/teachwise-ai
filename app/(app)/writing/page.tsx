'use client';

import { useState } from 'react';

export default function WritingPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleAnalyse = () => {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(`## Writing Feedback Report

---

### Overall Assessment: B+ (Proficient)

**Word Count:** ${text.split(' ').length} words
**Estimated Level:** Year 5-6

---

### Strengths

**1. Idea Development**
Your student has developed their main idea with some supporting details. The opening sets up the context effectively and there is a clear sequence of events.

**2. Vocabulary Choice**
Good use of descriptive language throughout. Some effective word choices like "shimmering," "desperate," and "reluctant" show the student is building a stronger vocabulary.

**3. Sentence Variety**
Nice mix of short and longer sentences. The student has experimented with compound sentences and some complex sentence structures.

---

### Areas for Development

**1. Paragraph Structure**
While the student has attempted to organise ideas into paragraphs, some paragraphs contain multiple ideas that could be separated. Each paragraph should focus on one main idea.

*Suggestion:* Encourage planning the paragraph structure before writing. Ask: "What is ONE thing I want to say in this paragraph?"

**2. Evidence and Examples**
The student's arguments could be strengthened with more specific evidence. When making a claim, ask: "How do I know this is true? What evidence can I provide?"

**3. Transitions**
More explicit transition words and phrases would help connect ideas between sentences and paragraphs.
*Scaffolding:* Provide a word bank: "Furthermore," "However," "As a result," "In addition."

---

### Next Steps

1. **Focus lesson on paragraph unity** — give students a graphic organiser with one main idea per box
2. **Peer editing practice** — have students highlight the main idea of each paragraph in different colours
3. **Mini-lesson on transitions** — collect examples from mentor texts, then practice inserting transitions into existing work`);
      setLoading(false);
      setShowResult(true);
    }, 2500);
  };

  const handleReset = () => {
    setText('');
    setResult('');
    setShowResult(false);
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Writing Feedback</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Paste student writing and get detailed feedback on strengths, gaps, and next steps
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Student Writing
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste student writing here..."
                rows={12}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              onClick={handleAnalyse}
              disabled={!text.trim() || loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: text.trim() && !loading ? 'var(--accent)' : 'var(--bg-card)',
                color: text.trim() && !loading ? 'var(--bg-primary)' : 'var(--text-muted)',
                cursor: text.trim() && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Analysing Writing...' : 'Analyse Writing'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Writing Analysis</h2>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 rounded-lg text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                New Analysis
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
                Export PDF
              </button>
            </div>
          </div>
          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{result}</div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';

const subjects = ['Mathematics', 'English', 'Science', 'Humanities & Social Sciences', 'Digital Technologies', 'Health & Physical Education'];
const yearLevels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const durations = ['30 min', '45 min', '60 min', '90 min'];

const mockOutput = `## Year 4 Mathematics — Fractions Lesson Plan

**Duration:** 60 minutes | **Date:** [Today's Date]

---

### WALT (We Are Learning To)
Compare and order unit fractions using concrete materials and visual representations.

### TIB (This Is Because)
Understanding fractions is foundational for decimal and percentage work in Years 5-6. Comparing fractions develops number sense and logical reasoning.

### WILF (What I'm Looking For)
- Students can identify which fraction is larger/smaller
- Students can explain their reasoning using fraction walls
- Students can order fractions from smallest to largest

---

### Lesson Sequence

**1. Hook (10 min) — "The Fraction Pizza Challenge"**
Present two pizzas cut into different numbers of slices. Which has more? Students discuss in pairs, then share strategies.

**2. Explicit Teaching (15 min)**
- Use fraction walls to visually compare unit fractions
- Demonstrate: 1/3 > 1/5 because thirds are bigger pieces
- Model thinking aloud: "When the denominator is bigger, the pieces are smaller"

**3. Guided Practice (20 min)**
- Pairs use fraction wall strips to compare fractions
- Complete comparison cards: 1/2 ? 1/4, 1/3 ? 1/6, etc.
- Whole-class discussion: "What's the rule?"

**4. Independent Work (10 min)**
- Fractions ordering worksheet (differentiated)
- Challenge: arrange fractions on a number line 0-1

**5. Reflection (5 min) — Exit Ticket**
"Which was harder: comparing or ordering? Why?"

---

### Resources
- Fraction wall strips (printed on coloured card)
- Comparison cards (differentiated sets)
- Fractions worksheet (3 levels)

### Differentiation
- **Below level:** Use pre-cut fraction wall pieces, focus on halves/quarters
- **Above level:** Compare non-unit fractions (e.g., 2/3 vs 3/4)
`;

export default function PlannerPage() {
  const [subject, setSubject] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (!subject || !yearLevel || !topic) return;
    setLoading(true);
    setTimeout(() => {
      setResult(mockOutput.replace('Year 4 Mathematics', `${yearLevel} ${subject}`).replace('Fractions', topic));
      setLoading(false);
      setShowResult(true);
    }, 2000);
  };

  const handleReset = () => {
    setSubject('');
    setYearLevel('');
    setTopic('');
    setDuration('');
    setResult('');
    setShowResult(false);
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Lesson Planner</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Generate complete AC9-aligned lesson plans with WALT/TIB/WILF in seconds
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Year Level</label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select year</option>
                  {yearLevels.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fractions, Persuasive Writing, The Water Cycle"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Duration (optional)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">Auto-select based on content</option>
                {durations.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!subject || !yearLevel || !topic || loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: subject && yearLevel && topic && !loading ? 'var(--accent)' : 'var(--bg-card)',
                color: subject && yearLevel && topic && !loading ? 'var(--bg-primary)' : 'var(--text-muted)',
                cursor: subject && yearLevel && topic && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Generating...' : 'Generate Lesson Plan'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Lesson Plan</h2>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 rounded-lg text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                New Plan
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
                Export PDF
              </button>
            </div>
          </div>
          <div
            className="p-6 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
              {result}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
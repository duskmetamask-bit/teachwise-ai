'use client';

import { useState } from 'react';

const subjects = ['Mathematics', 'English', 'Science', 'Humanities & Social Sciences'];
const yearLevels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const abilities = ['All Abilities', 'Below Level', 'At Level', 'Above Level'];

export default function WorksheetsPage() {
  const [subject, setSubject] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [ability, setAbility] = useState('All Abilities');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (!subject || !yearLevel || !topic) return;
    setLoading(true);
    setTimeout(() => {
      setResult(`## ${yearLevel} ${subject} — ${topic} Worksheet

**Differentiated for:** ${ability}

---

### Section 1: Knowledge & Understanding (5 questions)

**Q1.** What is ${topic}? Explain in your own words.
_____________________________________________
_____________________________________________

**Q2.** List three key facts about ${topic}.
a) _____________________________________________
b) _____________________________________________
c) _____________________________________________

**Q3.** Circle the correct answer:
${topic} is important because it helps us (choose one):
[ ] Understand the world better
[ ] Pass tests
[ ] Impress our teachers
[ ] I don't know

---

### Section 2: Application (3 questions)

**Q4.** Give an example of how ${topic} is used in everyday life.
_____________________________________________
_____________________________________________

**Q5.** If you were teaching ${topic} to a younger sibling, how would you explain it?
_____________________________________________
_____________________________________________
_____________________________________________

---

### Section 3: Extended Thinking (2 questions)

**Q6.** How does ${topic} connect to something else you have learned this year?
_____________________________________________
_____________________________________________
_____________________________________________

**Q7.** Think of a question you still have about ${topic}. What would you need to find out to answer it?
My question: _____________________________________________
_____________________________________________
To find out, I would: _____________________________________________

---

### Challenge Question (Extension)
**Q8.** ${ability === 'Above Level' ? 'Create your own question about ${topic} and answer it.' : 'Research one extra fact about ${topic} to share with the class.'}

_____________________________________________
_____________________________________________
_____________________________________________`);
      setLoading(false);
      setShowResult(true);
    }, 2000);
  };

  const handleReset = () => {
    setSubject(''); setYearLevel(''); setTopic(''); setAbility('All Abilities');
    setResult(''); setShowResult(false);
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Worksheet Generator</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Generate targeted worksheets for any topic, year level, and ability range
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Year Level</label>
                <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">Select year</option>
                  {yearLevels.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Multiplication, Narrative Structure, Photosynthesis"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Ability Range</label>
              <select value={ability} onChange={(e) => setAbility(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                {abilities.map((a) => <option key={a} value={a}>{a}</option>)}
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
              {loading ? 'Generating...' : 'Generate Worksheet'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Worksheet</h2>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 rounded-lg text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                New Worksheet
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
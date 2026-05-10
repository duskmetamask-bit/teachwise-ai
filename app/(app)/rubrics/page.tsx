'use client';

import { useState } from 'react';

const subjects = ['Mathematics', 'English', 'Science', 'Humanities & Social Sciences', 'Digital Technologies', 'Health & Physical Education'];
const yearLevels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const taskTypes = ['Written Response', 'Presentation', 'Project', 'Test/Quiz', 'Practical Task'];

export default function RubricsPage() {
  const [subject, setSubject] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [taskType, setTaskType] = useState('');
  const [criteria, setCriteria] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (!subject || !yearLevel || !taskType) return;
    setLoading(true);
    setTimeout(() => {
      setResult(`## ${yearLevel} ${subject} — ${taskType} Rubric

**Subject:** ${subject} | **Year Level:** ${yearLevel} | **Task Type:** ${taskType}

---

| Criterion | A (Excellent) | B (Proficient) | C (Developing) | D (Beginning) |
|-----------|---------------|----------------|----------------|---------------|
| Knowledge & Understanding | Demonstrates comprehensive understanding of all key concepts with accurate and detailed responses | Shows solid understanding of most concepts with generally accurate responses | Shows basic understanding with some gaps in knowledge | Limited understanding; significant gaps evident |
| Application | Applies knowledge accurately and effectively to new contexts with sophisticated reasoning | Applies knowledge competently with minor errors in novel situations | Attempts application with support; errors present | Unable to apply without significant scaffolding |
| Communication | Uses precise, clear and sophisticated language; excellent structure and organisation | Communicates ideas effectively with good structure | Communicates with some confusion or disorganisation | Difficult to follow; poor structure |
| Analysis | Provides insightful, thorough analysis with strong evidence and logical reasoning | Shows good analytical skills with adequate evidence | Basic analysis present; limited evidence | Minimal or no analysis |

---

**Assessment Weighting Suggestion:**
- Knowledge & Understanding: 30%
- Application: 30%
- Communication: 20%
- Analysis: 20%

**Total Marks:** 100`);
      setLoading(false);
      setShowResult(true);
    }, 2000);
  };

  const handleReset = () => {
    setSubject(''); setYearLevel(''); setTaskType('');
    setResult(''); setShowResult(false);
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Rubric Generator</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Create detailed assessment rubrics for any subject, year level, and task type
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
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Task Type</label>
              <select value={taskType} onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <option value="">Select task type</option>
                {taskTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Number of Criteria: {criteria}
              </label>
              <input type="range" min={3} max={6} value={criteria}
                onChange={(e) => setCriteria(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--accent)' }}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!subject || !yearLevel || !taskType || loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: subject && yearLevel && taskType && !loading ? 'var(--accent)' : 'var(--bg-card)',
                color: subject && yearLevel && taskType && !loading ? 'var(--bg-primary)' : 'var(--text-muted)',
                cursor: subject && yearLevel && taskType && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Generating...' : 'Generate Rubric'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Rubric</h2>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 rounded-lg text-xs border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                New Rubric
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
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
'use client';

import { useState } from 'react';

const subjects = ['Mathematics', 'English', 'Science', 'Humanities & Social Sciences', 'Health & Physical Education', 'The Arts'];
const yearLevels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const effortLevels = ['High', 'Medium', 'Low'];

export default function ReportsPage() {
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [effort, setEffort] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (!studentName || !subject || !yearLevel || !effort) return;
    setLoading(true);
    setTimeout(() => {
      const effortTexts: Record<string, string> = {
        High: `${studentName} has demonstrated outstanding effort and engagement in ${subject} this semester. They consistently挑战 themselves and approached all tasks with enthusiasm and determination. Their willingness to take risks and persist with challenging material has resulted in excellent progress. ${studentName} is a positive contributor to class discussions and consistently completes quality work to the best of their ability.`,
        Medium: `${studentName} has shown satisfactory effort in ${subject} this semester. They engage with the content and complete their work to an acceptable standard. With continued focus and increased engagement, ${studentName} has the potential to achieve even stronger results. Encouraging greater participation in class discussions and self-directed study would support continued growth.`,
        Low: `${studentName} has shown some engagement in ${subject} this semester. There have been moments of good effort, though ${studentName} would benefit from developing greater focus and consistency. Encouraging ${studentName} to take more ownership of their learning and engage more actively with the content would support improved outcomes. Regular monitoring and additional support strategies are recommended.`,
      };

      setResult(`## Semester Report Comment

**Student:** ${studentName}
**Subject:** ${subject}
**Year Level:** ${yearLevel}
**Effort Level:** ${effort}

---

### General Comment

${effortTexts[effort]}

---

### AC9 Curriculum Alignment

${studentName} has been working towards the following Australian Curriculum (Version 9) outcomes in ${subject}:

- [Relevant AC9 outcome code and description]
- [Relevant AC9 outcome code and description]

### Areas for Development

**Strengths:**
- [Specific strength in ${subject}]
- [Specific strength in ${subject}]

**Areas to develop:**
- [Specific area for growth]
- [Specific area for growth]

### Parent/Caregiver Suggestion

To support ${studentName}'s continued growth in ${subject}:
1. [Practical suggestion]
2. [Practical suggestion]
3. [Practical suggestion]`);
      setLoading(false);
      setShowResult(true);
    }, 2000);
  };

  const handleReset = () => {
    setStudentName(''); setSubject(''); setYearLevel(''); setEffort('');
    setResult(''); setShowResult(false);
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Report Comments</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Generate AC9-aligned semester report comments in seconds
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Student Name</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                placeholder="Student's full name"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>

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
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Effort Level</label>
              <div className="grid grid-cols-3 gap-3">
                {effortLevels.map((e) => (
                  <button key={e} onClick={() => setEffort(e)}
                    className="py-3 rounded-xl text-sm font-medium border transition-all"
                    style={{
                      backgroundColor: effort === e ? 'var(--accent)' : 'var(--bg-card)',
                      borderColor: effort === e ? 'var(--accent)' : 'var(--border)',
                      color: effort === e ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!studentName || !subject || !yearLevel || !effort || loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: studentName && subject && yearLevel && effort && !loading ? 'var(--accent)' : 'var(--bg-card)',
                color: studentName && subject && yearLevel && effort && !loading ? 'var(--bg-primary)' : 'var(--text-muted)',
                cursor: studentName && subject && yearLevel && effort && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Generating...' : 'Generate Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Report Comment</h2>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 rounded-lg text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                New Comment
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
                Copy to Clipboard
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
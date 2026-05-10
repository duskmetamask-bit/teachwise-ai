'use client';

import { useState, useRef } from 'react';

export default function AutomarkPage() {
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (!studentFile || !rubricFile) return;
    setLoading(true);
    setTimeout(() => {
      setResult(`## Auto-Marking Results

**Student Work:** ${studentFile.name}
**Rubric:** ${rubricFile.name}
**Date:** ${new Date().toLocaleDateString()}

---

### Overall Assessment: B+ (Proficient)

---

### Criterion-by-Criterion Feedback

**Knowledge & Understanding — B (Proficient)**
Student demonstrates solid understanding of the key concepts. Minor gaps in terminology use. Main ideas are clearly expressed with appropriate examples.

**Application — A (Excellent)**
Strong ability to apply concepts to new contexts. Reasoning is logical and well-structured. Effective use of supporting evidence.

**Communication — B+ (Proficient)**
Clear and effective communication throughout. Good paragraph structure. Some sentences could be more precise.

**Analysis — B (Proficient)**
Good analytical skills demonstrated. Evidence is appropriately selected and explained. Would benefit from deeper exploration of cause-and-effect relationships.

---

### Strengths
- Well-structured response with clear introduction and conclusion
- Strong use of specific examples to support arguments
- Logical flow of ideas throughout

### Areas for Development
- Greater precision in subject-specific terminology
- More thorough analysis of multiple perspectives
- Stronger connection between evidence and conclusions

### Next Steps
1. Review key vocabulary for this topic
2. Practice writing analytical paragraphs with embedded quotes
3. Peer-edit for precision in language`);
      setLoading(false);
      setShowResult(true);
    }, 3000);
  };

  const handleReset = () => {
    setStudentFile(null);
    setRubricFile(null);
    setResult('');
    setShowResult(false);
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Auto-Marking</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Upload student work and a rubric — get instant criterion-by-criterion feedback
            </p>
          </div>

          <div className="space-y-4">
            <div
              className="p-6 rounded-xl border border-dashed text-center cursor-pointer transition-all"
              style={{ borderColor: studentFile ? 'var(--accent)' : 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => e.target.files && setStudentFile(e.target.files[0])} className="hidden" id="student-upload" />
              <label htmlFor="student-upload" className="cursor-pointer">
                <div className="text-2xl mb-2" style={{ color: 'var(--accent)' }}>PDF</div>
                <div className="text-sm text-white mb-1">{studentFile ? studentFile.name : 'Upload Student Work'}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>PDF, DOCX, or TXT</div>
              </label>
            </div>

            <div
              className="p-6 rounded-xl border border-dashed text-center cursor-pointer transition-all"
              style={{ borderColor: rubricFile ? 'var(--accent)' : 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => e.target.files && setRubricFile(e.target.files[0])} className="hidden" id="rubric-upload" />
              <label htmlFor="rubric-upload" className="cursor-pointer">
                <div className="text-2xl mb-2" style={{ color: 'var(--accent)' }}>RUBRIC</div>
                <div className="text-sm text-white mb-1">{rubricFile ? rubricFile.name : 'Upload Assessment Rubric'}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>PDF, DOCX, or TXT</div>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!studentFile || !rubricFile || loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: studentFile && rubricFile && !loading ? 'var(--accent)' : 'var(--bg-card)',
                color: studentFile && rubricFile && !loading ? 'var(--bg-primary)' : 'var(--text-muted)',
                cursor: studentFile && rubricFile && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Analysing...' : 'Analyse Student Work'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Marking Results</h2>
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
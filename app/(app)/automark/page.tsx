'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckSquare, Upload, FileText, Loader2, RefreshCw, Download } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</span>
      </div>
    </div>
  );
}

type CriterionFeedback = {
  name: string;
  grade: string;
  feedback: string;
};

type MarkingResult = {
  overallGrade: string;
  criteria: CriterionFeedback[];
  strengths: string[];
  areasForDevelopment: string[];
  nextSteps: string[];
};

const AUTO_MARK_SYSTEM_PROMPT = `You are an expert Australian teacher assessor with deep knowledge of:
- Australian Curriculum v9 (AC9) achievement standards and assessment rubrics
- Criterion-referenced assessment practices
- Formative and summative evaluation methods

Your task is to mark student work against a provided rubric. For each criterion in the rubric:
1. Assess the student's work against the criterion levels
2. Provide specific, actionable feedback
3. Identify strengths and areas for development

Always respond in this structured format (use markdown):
## Overall Grade: [A/B/C/D]

### Criterion-by-Criterion Feedback
**Criterion Name — [Grade]**
[Detailed feedback for this criterion]

### Strengths
- [Specific strength 1]
- [Specific strength 2]
- [Specific strength 3]

### Areas for Development
- [Specific area 1]
- [Specific area 2]
- [Specific area 3]

### Next Steps
1. [Actionable next step 1]
2. [Actionable next step 2]
3. [Actionable next step 3]

Be specific and constructive. Ground your feedback in the actual evidence from the student's work.`;

function parseResult(text: string): MarkingResult {
  const result: MarkingResult = {
    overallGrade: '',
    criteria: [],
    strengths: [],
    areasForDevelopment: [],
    nextSteps: [],
  };

  const overallMatch = text.match(/##\s*Overall\s*Grade:\s*([A-D])/i);
  if (overallMatch) {
    result.overallGrade = overallMatch[1].toUpperCase();
  }

  const criteriaBlock = text.match(/###\s*Criterion-by-Criterion\s*Feedback\n([\s\S]*?)(?=###\s*Strengths|$)/i);
  if (criteriaBlock) {
    const criteriaText = criteriaBlock[1];
    const criterionRegex = /\*\*([^*]+)\*\*\s*—\s*([A-D](?:\s*\([^)]+\))?)\n([\s\S]*?)(?=\*\*[^*]+\*\*\s*—|$)/gi;
    const matches = criteriaText.matchAll(criterionRegex);
    for (const match of matches) {
      result.criteria.push({
        name: match[1].trim(),
        grade: match[2].trim(),
        feedback: match[3].trim(),
      });
    }
  }

  const strengthsBlock = text.match(/###\s*Strengths\n([\s\S]*?)(?=###\s*Areas|$)/i);
  if (strengthsBlock) {
    const sMatches = strengthsBlock[1].matchAll(/-\s*([^\n]+)/g);
    for (const match of sMatches) {
      result.strengths.push(match[1].trim());
    }
  }

  const areasBlock = text.match(/###\s*Areas\s*(?:for\s*)?Development\n([\s\S]*?)(?=###\s*Next|$)/i);
  if (areasBlock) {
    const aMatches = areasBlock[1].matchAll(/-\s*([^\n]+)/g);
    for (const match of aMatches) {
      result.areasForDevelopment.push(match[1].trim());
    }
  }

  const nextBlock = text.match(/###\s*Next\s*Steps\n([\s\S]*?)$/i);
  if (nextBlock) {
    const nMatches = nextBlock[1].matchAll(/\d+\.\s*([^\n]+)/g);
    for (const match of nMatches) {
      result.nextSteps.push(match[1].trim());
    }
  }

  return result;
}

function gradeColor(grade: string): string {
  const g = grade.toUpperCase();
  if (g.startsWith('A')) return '#10b981';
  if (g.startsWith('B')) return '#3b82f6';
  if (g.startsWith('C')) return '#f59e0b';
  return '#ef4444';
}

function GradeBadge({ grade }: { grade: string }) {
  const color = gradeColor(grade);
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0"
      style={{ backgroundColor: color, color: 'white' }}
    >
      {grade.toUpperCase().charAt(0)}
    </span>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '300ms' }} />
    </div>
  );
}

function AutomarkContent() {
  const searchParams = useSearchParams();
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [studentText, setStudentText] = useState('');
  const [rubricText, setRubricText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarkingResult | null>(null);
  const [rawResponse, setRawResponse] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const prefill = searchParams.get('prefill');
    if (prefill) {
      // Future: pre-fill from URL params
    }
  }, [searchParams]);

  const readFileText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'student' | 'rubric'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt')) {
      const text = await readFileText(file);
      if (type === 'student') {
        setStudentFile(file);
        setStudentText(text);
      } else {
        setRubricFile(file);
        setRubricText(text);
      }
    } else {
      if (type === 'student') {
        setStudentFile(file);
        setStudentText('');
      } else {
        setRubricFile(file);
        setRubricText('');
      }
    }
  };

  const needsPaste = (file: File | null) => file !== null && !file.name.endsWith('.txt');

  const canSubmit = () => {
    const studentReady = studentFile && (studentFile.name.endsWith('.txt') ? studentText : studentText.length > 0);
    const rubricReady = rubricFile && (rubricFile.name.endsWith('.txt') ? rubricText : rubricText.length > 0);
    return studentReady && rubricReady && !loading;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setLoading(true);
    setShowResult(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Please mark the following student work against the provided rubric.\n\n---\n\n**STUDENT WORK:**\n${studentText}\n\n---\n\n**RUBRIC:**\n${rubricText}`,
            },
          ],
          customSystemPrompt: AUTO_MARK_SYSTEM_PROMPT,
        }),
      });

      const data = await response.json();
      const parsed = parseResult(data.response);
      setResult(parsed);
      setRawResponse(data.response);
      setShowResult(true);
    } catch (error) {
      console.error('Marking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStudentFile(null);
    setRubricFile(null);
    setStudentText('');
    setRubricText('');
    setResult(null);
    setRawResponse('');
    setShowResult(false);
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Auto-Marking
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Upload student work and a rubric — get instant criterion-by-criterion feedback
            </p>
          </div>

          <div className="space-y-4">
            {/* Student Work Upload */}
            <div
              className="p-6 rounded-xl border border-dashed cursor-pointer transition-all"
              style={{
                borderColor: studentFile ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFileChange(e, 'student')}
                className="hidden"
                id="student-upload"
              />
              <label htmlFor="student-upload" className="cursor-pointer">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-accent-dim)' }}
                  >
                    <FileText className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">
                      {studentFile ? studentFile.name : 'Upload Student Work'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>PDF, DOCX, or TXT</div>
                  </div>
                </div>
              </label>
            </div>

            {/* Rubric Upload */}
            <div
              className="p-6 rounded-xl border border-dashed cursor-pointer transition-all"
              style={{
                borderColor: rubricFile ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFileChange(e, 'rubric')}
                className="hidden"
                id="rubric-upload"
              />
              <label htmlFor="rubric-upload" className="cursor-pointer">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-accent-dim)' }}
                  >
                    <Upload className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">
                      {rubricFile ? rubricFile.name : 'Upload Assessment Rubric'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>PDF, DOCX, or TXT</div>
                  </div>
                </div>
              </label>
            </div>

            {(needsPaste(studentFile) || needsPaste(rubricFile)) && (
              <div
                className="p-4 rounded-xl text-xs"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
              >
                For PDF/DOCX, please copy and paste the text into the text areas below
              </div>
            )}

            {(needsPaste(studentFile) || needsPaste(rubricFile) || studentText || rubricText) && (
              <div className="space-y-4">
                {needsPaste(studentFile) && (
                  <div>
                    <label className="label-dark">Student Work Text</label>
                    <textarea
                      value={studentText}
                      onChange={(e) => setStudentText(e.target.value)}
                      placeholder="Paste student work here..."
                      className="input-dark"
                      rows={6}
                    />
                  </div>
                )}
                {needsPaste(rubricFile) && (
                  <div>
                    <label className="label-dark">Rubric Text</label>
                    <textarea
                      value={rubricText}
                      onChange={(e) => setRubricText(e.target.value)}
                      placeholder="Paste rubric here..."
                      className="input-dark"
                      rows={6}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit()}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: canSubmit() ? 'var(--color-accent)' : 'var(--color-surface)',
                color: canSubmit() ? 'white' : 'var(--color-text-muted)',
                cursor: canSubmit() ? 'pointer' : 'not-allowed',
                border: canSubmit() ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {loading ? (
                <>
                  <span>Analysing</span>
                  <LoadingDots />
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  Analyse Student Work
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Marking Results</h2>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-xs border flex items-center gap-1"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <RefreshCw className="w-3 h-3" />
                New Analysis
              </button>
              <button
                className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              >
                <Download className="w-3 h-3" />
                Export PDF
              </button>
            </div>
          </div>

          {result?.overallGrade && (
            <div className="flex items-center gap-3 mb-6">
              <span
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-bold"
                style={{ backgroundColor: gradeColor(result.overallGrade), color: 'white' }}
              >
                {result.overallGrade}
              </span>
              <div>
                <div className="text-sm text-white font-medium">Overall Grade</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Criterion-Referenced Assessment</div>
              </div>
            </div>
          )}

          {result?.criteria && result.criteria.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-white">Criterion Breakdown</h3>
              {result.criteria.map((c, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-start gap-3">
                    <GradeBadge grade={c.grade} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white mb-1">{c.name}</div>
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{c.feedback}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {result?.strengths && result.strengths.length > 0 && (
              <div
                className="p-4 rounded-xl border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-accent)' }}>Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--color-text)' }}>
                      <span style={{ color: 'var(--color-accent)' }}>+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result?.areasForDevelopment && result.areasForDevelopment.length > 0 && (
              <div
                className="p-4 rounded-xl border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-warning)' }}>Areas for Development</h3>
                <ul className="space-y-2">
                  {result.areasForDevelopment.map((a, i) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--color-text)' }}>
                      <span style={{ color: 'var(--color-warning)' }}>→</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {result?.nextSteps && result.nextSteps.length > 0 && (
            <div
              className="p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h3 className="text-sm font-medium mb-3" style={{ color: '#3B82F6' }}>Next Steps</h3>
              <ol className="space-y-2">
                {result.nextSteps.map((n, i) => (
                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--color-text)' }}>
                    <span style={{ color: '#3B82F6' }}>{i + 1}.</span>
                    {n}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {!result?.overallGrade && rawResponse && (
            <div
              className="p-6 rounded-xl border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <pre className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                {rawResponse}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AutomarkPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AutomarkContent />
    </Suspense>
  );
}
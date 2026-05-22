'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckSquare, Upload, FileText, Loader2, RefreshCw, Download } from 'lucide-react';
import { recordActivity } from '@/app/lib/teachwise-store';
import { exportTeachWiseDocx, exportTeachWisePptx, exportTeachWisePdf, markingResultToExportContent } from '@/app/lib/exporters';

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
  const exportContent = result
    ? markingResultToExportContent(
        'TeachWise Auto-Mark Result',
        {
          overallGrade: result.overallGrade,
          criteria: result.criteria,
          strengths: result.strengths,
          areasForDevelopment: result.areasForDevelopment,
          nextSteps: result.nextSteps,
        },
        studentFile?.name
      )
    : null;

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

  const parseUploadedFile = async (file: File): Promise<string> => {
    if (file.name.endsWith('.txt')) {
      return readFileText(file);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/files/parse', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.text || '';
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'student' | 'rubric'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await parseUploadedFile(file);
    if (type === 'student') {
      setStudentFile(file);
      setStudentText(text);
    } else {
      setRubricFile(file);
      setRubricText(text);
    }
  };
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
      const response = await fetch('/api/ai/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentText,
          rubricText,
          studentName: studentFile?.name || '',
        }),
      });

      const data = await response.json();
      const parsed = data.parsed || parseResult(data.response);
      setResult(parsed);
      setRawResponse(data.response);
      setShowResult(true);
      recordActivity({
        type: 'work_marked',
        title: 'Student work marked',
        detail: studentFile?.name || 'Uploaded assessment',
        minutesReclaimed: 20,
      });
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

  const handleExport = async (type: 'docx' | 'pptx' | 'pdf') => {
    if (!exportContent) return;
    if (type === 'docx') {
      await exportTeachWiseDocx(exportContent);
    } else if (type === 'pptx') {
      await exportTeachWisePptx(exportContent);
    } else {
      await exportTeachWisePdf(exportContent);
    }
    recordActivity({
      type: 'exported',
      title: 'Marking result exported',
      detail: type.toUpperCase(),
      minutesReclaimed: 0,
    });
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="mx-auto max-w-xl">
          <div className="app-toolbar mb-6 rounded-[28px] p-5 md:p-6">
            <div className="export-chip mb-3 w-fit">
              <CheckSquare className="h-3.5 w-3.5" />
              Auto-Mark
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Marking support that feels calm, fast, and teacher-led.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              Upload student work and a rubric, review the AI draft, then export the result as PDF, DOCX, or PowerPoint.
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

            <div className="space-y-4">
              <div>
                <label className="label-dark">Student work text</label>
                <textarea
                  value={studentText}
                  onChange={(e) => setStudentText(e.target.value)}
                  placeholder="Student work is extracted automatically, but you can edit it here."
                  className="input-dark"
                  rows={6}
                />
              </div>
              <div>
                <label className="label-dark">Rubric text</label>
                <textarea
                  value={rubricText}
                  onChange={(e) => setRubricText(e.target.value)}
                  placeholder="Rubric text is extracted automatically, but you can edit it here."
                  className="input-dark"
                  rows={6}
                />
              </div>
            </div>

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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleReset}
                className="export-chip"
              >
                <RefreshCw className="w-3 h-3" />
                New Analysis
              </button>
              <button
                onClick={() => void handleExport('docx')}
                className="export-chip"
              >
                DOCX
              </button>
              <button
                onClick={() => void handleExport('pptx')}
                className="export-chip"
              >
                PPTX
              </button>
              <button
                onClick={() => void handleExport('pdf')}
                className="export-chip"
              >
                <Download className="w-3 h-3" />
                PDF
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

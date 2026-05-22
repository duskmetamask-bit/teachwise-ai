'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClipboardList, Copy, Loader2, Download, FileText } from 'lucide-react';
import { recordActivity } from '@/app/lib/teachwise-store';
import { exportTeachWiseDocx, exportTeachWisePptx, exportTeachWisePdf, rubricTextToExportContent } from '@/app/lib/exporters';

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

const YEAR_LEVELS = ['F', '1', '2', '3', '4', '5', '6'];
const SUBJECTS = ['English', 'Mathematics', 'Science', 'HASS', 'Digital Technologies', 'Health'];
const RUBRIC_TYPES = ['analytic', 'holistic'];
const LEVEL_COUNTS = ['3', '4', '5'];

function RubricsContent() {
  const searchParams = useSearchParams();
  const [yearLevel, setYearLevel] = useState(() => {
    const year = searchParams.get('year');
    return year ? decodeURIComponent(year).replace('Year ', '') : '';
  });
  const [subject, setSubject] = useState(() => {
    const subjectParam = searchParams.get('subject');
    return subjectParam ? decodeURIComponent(subjectParam) : '';
  });
  const [topic, setTopic] = useState('');
  const [rubricType, setRubricType] = useState<'analytic' | 'holistic'>('analytic');
  const [levelCount, setLevelCount] = useState('4');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearLevel || !subject || !topic) return;

    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/ai/rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearLevel: `Year ${yearLevel}`,
          subject,
          topic,
          rubricType,
          levelCount: Number(levelCount),
        })
      });

      const data = await response.json();
      setResult(data.response || 'No response received.');
      recordActivity({
        type: 'rubric_created',
        title: 'Rubric created',
        detail: `${yearLevel ? `Year ${yearLevel}` : 'F-6'} ${subject} - ${topic}`,
        minutesReclaimed: 12,
      });
    } catch {
      setResult('Error generating rubric. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    void exportTeachWisePdf(exportContent);
  };

  const parseRubricTable = (text: string): { headers: string[]; rows: string[][] } | null => {
    const lines = text.split('\n');
    const tableLines = lines.filter(l => l.includes('|') && l.trim().startsWith('|'));

    if (tableLines.length < 2) return null;

    const rows = tableLines
      .filter(l => !l.includes('---') && l.split('|').filter(c => c.trim()).length > 1)
      .map(l => l.split('|').map(c => c.trim()).filter(c => c !== ''));

    if (rows.length < 2) return null;

    return { headers: rows[0], rows: rows.slice(1) };
  };

  const parsed = result ? parseRubricTable(result) : null;
  const exportContent = rubricTextToExportContent(
    `TeachWise Rubric ${yearLevel ? `- Year ${yearLevel}` : ''} ${subject ? `- ${subject}` : ''}`.trim(),
    result,
    parsed || undefined,
    topic ? `${subject} ${topic}`.trim() : undefined
  );

  const handleExport = async (type: 'docx' | 'pptx' | 'pdf') => {
    if (type === 'docx') {
      await exportTeachWiseDocx(exportContent);
    } else if (type === 'pptx') {
      await exportTeachWisePptx(exportContent);
    } else {
      await exportTeachWisePdf(exportContent);
    }
    recordActivity({
      type: 'exported',
      title: 'Rubric exported',
      detail: type.toUpperCase(),
      minutesReclaimed: 0,
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="app-toolbar mb-6 rounded-[28px] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="export-chip mb-3 w-fit">
              <ClipboardList className="h-3.5 w-3.5" />
              Rubric Builder
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Assessment rubrics that look ready to hand to another teacher.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              Build analytic or holistic rubrics, align them to AC9, and export immediately to PDF, DOCX, or PowerPoint.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void handleExport('docx')} className="export-chip">
              <FileText className="h-3.5 w-3.5" />
              DOCX
            </button>
            <button onClick={() => void handleExport('pptx')} className="export-chip">
              <Download className="h-3.5 w-3.5" />
              PPTX
            </button>
            <button onClick={() => void handleExport('pdf')} className="export-chip">
              <Download className="h-3.5 w-3.5" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl p-6 mb-8" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year Level */}
          <div>
            <label className="label-dark">Year Level</label>
            <select
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              className="input-dark"
              required
            >
              <option value="">Select year level...</option>
              {YEAR_LEVELS.map(y => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="label-dark">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-dark"
              required
            >
              <option value="">Select subject...</option>
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div className="md:col-span-2">
            <label className="label-dark">Topic / Focus Area</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Narrative writing, Fractions, Colonial Australia..."
              className="input-dark"
              required
            />
          </div>

          {/* Rubric Type */}
          <div>
            <label className="label-dark">Rubric Type</label>
            <div className="flex gap-3">
              {RUBRIC_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRubricType(type as 'analytic' | 'holistic')}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all"
                  style={
                    rubricType === type
                      ? { backgroundColor: 'var(--color-accent)', color: 'white' }
                      : { backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }
                  }
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {rubricType === 'analytic' ? 'Separate criteria for each aspect' : 'Overall judgment per criterion'}
            </p>
          </div>

          {/* Level Count */}
          <div>
            <label className="label-dark">Number of Levels</label>
            <div className="flex gap-3">
              {LEVEL_COUNTS.map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setLevelCount(count)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all"
                  style={
                    levelCount === count
                      ? { backgroundColor: 'var(--color-accent)', color: 'white' }
                      : { backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }
                  }
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {levelCount === '3' ? 'Beginning → Developing → Extending' :
               levelCount === '4' ? 'Beginning → Developing → Proficient → Extending' :
               'Beginning → Developing → Proficient → Accomplished → Extending'}
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !yearLevel || !subject || !topic}
          className="mt-6 w-full py-4 rounded-xl text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Rubric...
            </>
          ) : (
            <>
              <ClipboardList className="w-5 h-5" />
              Generate Rubric
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {/* Toolbar */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ backgroundColor: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border)' }}
          >
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              Generated Rubric
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyToClipboard}
                className="export-chip"
              >
                <Copy className="w-4 h-4" />
                {copied ? '✓ Copied!' : 'Copy'}
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
                onClick={handlePrint}
                className="export-chip"
              >
                PDF
              </button>
            </div>
          </div>

          {/* Rubric Display */}
          <div className="p-6 overflow-x-auto">
            {parsed ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th
                        className="text-left p-4 font-semibold border"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-text)', borderColor: 'var(--color-border)', minWidth: '180px' }}
                      >
                        Criterion
                      </th>
                      {parsed.headers.slice(1).map((header, i) => (
                        <th
                          key={i}
                          className="p-4 text-center font-semibold border"
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-text)', borderColor: 'var(--color-border)', minWidth: '200px' }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td
                          className="p-4 font-medium border"
                          style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)', backgroundColor: rowIndex % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-raised)' }}
                        >
                          {row[0]}
                        </td>
                        {row.slice(1).map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="p-4 text-sm border"
                            style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)', backgroundColor: rowIndex % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-raised)' }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre
                className="whitespace-pre-wrap text-sm p-4 rounded-xl overflow-x-auto"
                style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-surface-raised)' }}
              >
                {result}
              </pre>
            )}
          </div>

          {/* Context footer */}
          <div
            className="px-6 py-4"
            style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}
          >
            {yearLevel && subject && topic && (
              <span>Generated for: Year {yearLevel} {subject} — {topic}</span>
            )}
          </div>
        </div>
      )}

      {/* Print-only attribution */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          aside, header, form, button { display: none !important; }
          .no-print { display: none !important; }
          table { border: 1px solid #ccc; }
          th, td { border: 1px solid #ccc; padding: 8px; }
        }
      `}</style>
    </div>
  );
}

export default function RubricsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RubricsContent />
    </Suspense>
  );
}

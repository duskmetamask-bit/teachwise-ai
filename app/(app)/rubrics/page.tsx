'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500">Loading...</span>
      </div>
    </div>
  );
}

const YEAR_LEVELS = ['F', '1', '2', '3', '4', '5', '6'];
const SUBJECTS = ['English', 'Mathematics', 'Science', 'HASS', 'Digital Technologies', 'Health'];
const RUBRIC_TYPES = ['analytic', 'holistic'];
const LEVEL_COUNTS = ['3', '4', '5'];

const RUBRIC_SYSTEM_PROMPT = `You are **TeachWise AI**, an expert at creating assessment rubrics aligned to the Australian Curriculum v9 (AC9).

When asked to generate a rubric, create a well-structured table with:
- Clear criteria rows (based on the topic and subject)
- Level descriptors across columns (e.g., Beginning/Developing/Extending for 3 levels, or Beginning/Developing/Proficient/Extending for 4 levels, or Beginning/Developing/Proficient/Accomplished/Extending for 5 levels)
- Specific, observable descriptors at each level
- AC9 content descriptors where relevant

**OUTPUT FORMAT REQUIRED:**
Return the rubric as a markdown table with this exact structure:

| Criterion | Level 1 | Level 2 | Level 3 | (add more columns based on level count) |
|-----------|---------|---------|---------|--------|
| Criterion name | Descriptor for Level 1 | Descriptor for Level 2 | Descriptor for Level 3 | ... |
| ... more criteria rows ... | ... | ... | ... | ... |

Make each descriptor specific, observable, and tied to the AC9 achievement standards for the year level. Use student-friendly language.`;

interface RubricResult {
  criteria: string[];
  levels: string[];
  descriptors: string[][];
}

function RubricsContent() {
    const searchParams = useSearchParams();

  // Pre-fill from URL params on mount
  useEffect(() => {
    const year = searchParams.get('year');
    const subjectParam = searchParams.get('subject');
    if (year) setYearLevel(decodeURIComponent(year).replace('Year ', ''));
    if (subjectParam) setSubject(decodeURIComponent(subjectParam));
  }, [searchParams]);

  const [yearLevel, setYearLevel] = useState('');
  const [subject, setSubject] = useState('');
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

    const levelLabels: Record<string, string[]> = {
      '3': ['Beginning', 'Developing', 'Extending'],
      '4': ['Beginning', 'Developing', 'Proficient', 'Extending'],
      '5': ['Beginning', 'Developing', 'Proficient', 'Accomplished', 'Extending'],
    };

    const levels = levelLabels[levelCount];
    const levelDesc = levelCount === '3' ? '3 levels' : levelCount === '4' ? '4 levels' : '5 levels';

    const userPrompt = `Create a ${rubricType} rubric for ${subject} at Year ${yearLevel} level on the topic: "${topic}". Use ${levelDesc}.`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: userPrompt }
          ],
          teacherPrefs: { yearLevel: `Year ${yearLevel}`, subject },
          customSystemPrompt: RUBRIC_SYSTEM_PROMPT
        })
      });

      const data = await response.json();
      setResult(data.response || 'No response received.');
    } catch (err) {
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
    window.print();
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

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="text-emerald-600 text-3xl">✧</span>
          Rubric Generator
        </h2>
        <p className="text-slate-500 mt-1">Create aligned assessment rubrics for Australian F-6 classrooms</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Year Level</label>
            <select
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 font-medium input-glow"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 font-medium input-glow"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Topic / Focus Area</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Narrative writing, Fractions, Colonial Australia..."
              className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 placeholder-slate-400 font-medium input-glow"
              required
            />
          </div>

          {/* Rubric Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rubric Type</label>
            <div className="flex gap-3">
              {RUBRIC_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRubricType(type as 'analytic' | 'holistic')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    rubricType === type
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {rubricType === 'analytic' ? 'Separate criteria for each aspect' : 'Overall judgment per criterion'}
            </p>
          </div>

          {/* Level Count */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Levels</label>
            <div className="flex gap-3">
              {LEVEL_COUNTS.map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setLevelCount(count)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    levelCount === count
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
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
          className="mt-6 w-full py-4 rounded-xl bg-emerald-600 text-white font-semibold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating Rubric...
            </>
          ) : (
            <>
              <span>✧</span> Generate Rubric
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-emerald-600">✧</span> Generated Rubric
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                🖨️ Print
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
                      <th className="text-left p-4 bg-emerald-50 text-slate-800 font-semibold border border-slate-200 min-w-[180px]">
                        Criterion
                      </th>
                      {parsed.headers.slice(1).map((header, i) => (
                        <th key={i} className="p-4 text-center bg-emerald-50 text-slate-800 font-semibold border border-slate-200 min-w-[200px]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-4 font-medium text-slate-800 border border-slate-200">
                          {row[0]}
                        </td>
                        {row.slice(1).map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-4 text-sm text-slate-600 border border-slate-200">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-xl font-mono overflow-x-auto">
                  {result}
                </pre>
              </div>
            )}
          </div>

          {/* Context footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
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

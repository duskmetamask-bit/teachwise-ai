'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SavedPlan } from '@/app/lib/types';

const subjects = ['Mathematics', 'English', 'Science', 'Humanities & Social Sciences', 'Digital Technologies', 'Health & Physical Education'];
const yearLevels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const learningAreas = ['Number', 'Algebra', 'Measurement', 'Space', 'Statistics', 'Probability'];

const STORAGE_KEY = 'teachwise_saved_plans';

function parsePlanContent(content: string) {
  const lines = content.split('\n');
  const sections: { walt?: string; tib?: string; wilf?: string[]; sequence?: string[]; resources?: string[]; diff?: { extension?: string; support?: string } } = {};
  let currentSection: string | null = null;
  let buffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toUpperCase().startsWith('WALT')) {
      currentSection = 'walt';
      buffer = [trimmed.replace(/^WALT[^:]*:\s*/i, '').replace(/^WALT\s*/i, '')];
    } else if (trimmed.toUpperCase().startsWith('TIB')) {
      if (currentSection === 'walt' && buffer.length) sections.walt = buffer.join(' ');
      currentSection = 'tib';
      buffer = [trimmed.replace(/^TIB[^:]*:\s*/i, '').replace(/^TIB\s*/i, '')];
    } else if (trimmed.toUpperCase().startsWith('WILF')) {
      if (currentSection === 'tib' && buffer.length) sections.tib = buffer.join(' ');
      currentSection = 'wilf';
      buffer = [];
    } else if (trimmed.match(/^(Lesson Sequence|-sequence|### (Lesson|Unstructured|Materials|Resources|Differentiation))/i)) {
      if (currentSection === 'wilf' && buffer.length) sections.wilf = [...buffer];
      else if (currentSection === 'tib' && buffer.length) sections.tib = buffer.join(' ');
      currentSection = 'sequence';
      buffer = [trimmed];
    } else if (trimmed.match(/^(Resources|Materials|### Resources)/i)) {
      if (currentSection === 'sequence' && buffer.length) sections.sequence = [...buffer];
      currentSection = 'resources';
      buffer = [trimmed];
    } else if (trimmed.match(/^(Differentiation|Support|Extension)/i)) {
      if (currentSection === 'resources' && buffer.length) sections.resources = [...buffer];
      currentSection = 'diff';
      buffer = [trimmed];
    } else if (trimmed.startsWith('- ') || trimmed.match(/^\d+\./)) {
      buffer.push(trimmed);
    } else if (trimmed && currentSection) {
      buffer.push(trimmed);
    }
  }

  if (currentSection === 'walt' && buffer.length && !sections.walt) sections.walt = buffer.join(' ');
  else if (currentSection === 'tib' && buffer.length && !sections.tib) sections.tib = buffer.join(' ');
  else if (currentSection === 'wilf' && buffer.length && !sections.wilf) sections.wilf = [...buffer];
  else if (currentSection === 'sequence' && buffer.length && !sections.sequence) sections.sequence = [...buffer];
  else if (currentSection === 'resources' && buffer.length && !sections.resources) sections.resources = [...buffer];
  else if (currentSection === 'diff' && buffer.length && !sections.diff) sections.diff = { extension: buffer.join('\n') };

  return sections;
}

function extractAc9Codes(content: string): string[] {
  const matches = content.match(/AC9[A-Z0-9]+/gi) || [];
  return [...new Set(matches.map(c => c.toUpperCase()))];
}

export default function PlannerPage() {
  const [subject, setSubject] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [specificOutcome, setSpecificOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = async () => {
    if (!subject || !yearLevel || !topic) return;
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Create a detailed lesson plan for ${yearLevel} ${subject} on the topic of "${topic}". Include: WALT, TIB, WILF, lesson sequence with timings, resources needed, and differentiation strategies. Reference AC9 codes where relevant.`
          }]
        }),
      });

      const data = await response.json();
      setResult(data.response || 'Unable to generate lesson plan. Please try again.');
    } catch {
      setResult('Error connecting to AI. Please try again.');
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  const handleSaveToLibrary = () => {
    const savedPlans: SavedPlan[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newPlan: SavedPlan = {
      id: `saved-${Date.now()}`,
      title: topic,
      yearLevel,
      subject,
      topic,
      ac9Codes: extractAc9Codes(result),
      dateSaved: new Date().toLocaleDateString('en-AU'),
      rawContent: result,
    };
    savedPlans.unshift(newPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlans));
    alert('Plan saved to library!');
  };

  const handleReset = () => {
    setSubject('');
    setYearLevel('');
    setTopic('');
    setSpecificOutcome('');
    setResult('');
    setShowResult(false);
  };

  const parsed = parsePlanContent(result);

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Lesson Planner</h2>
            <p className="text-sm text-[#8B949E]">
              Generate complete AC9-aligned lesson plans in seconds
            </p>
          </div>

          <div className="space-y-6">
            {/* Subject & Year Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#E6EDF3] mb-2">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#30363D] bg-[#161B22] text-white text-sm outline-none focus:border-[#00D4AA]/50 transition-all"
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E6EDF3] mb-2">Year Level</label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#30363D] bg-[#161B22] text-white text-sm outline-none focus:border-[#00D4AA]/50 transition-all"
                >
                  <option value="">Select year</option>
                  {yearLevels.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-[#E6EDF3] mb-2">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fractions, Persuasive Writing, The Water Cycle"
                className="w-full px-4 py-3 rounded-xl border border-[#30363D] bg-[#161B22] text-white text-sm outline-none focus:border-[#00D4AA]/50 transition-all placeholder:text-[#6E7681]"
              />
            </div>

            {/* Specific Outcome (optional) */}
            <div>
              <label className="block text-sm font-medium text-[#E6EDF3] mb-2">
                Specific AC9 Outcome <span className="text-[#6E7681]">(optional)</span>
              </label>
              <input
                type="text"
                value={specificOutcome}
                onChange={(e) => setSpecificOutcome(e.target.value)}
                placeholder="e.g. AC9MFN04, ACELY1701"
                className="w-full px-4 py-3 rounded-xl border border-[#30363D] bg-[#161B22] text-white text-sm outline-none focus:border-[#00D4AA]/50 transition-all placeholder:text-[#6E7681]"
              />
              <p className="text-xs text-[#6E7681] mt-1">Add a specific AC9 code to align your lesson exactly</p>
            </div>

            {/* Quick Start Templates */}
            <div>
              <p className="text-sm text-[#8B949E] mb-3">Quick start with a template:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '📐 Maths Inquiry', topic: 'Multiplication Strategies' },
                  { label: '✍️ English Writing', topic: 'Narrative Writing' },
                  { label: '🔬 Science Experiment', topic: 'Forces and Motion' },
                  { label: '🌍 HASS Investigation', topic: 'Australian Environments' },
                ].map((template) => (
                  <button
                    key={template.label}
                    onClick={() => {
                      setTopic(template.topic);
                      if (template.label.includes('Maths')) setSubject('Mathematics');
                      if (template.label.includes('English')) setSubject('English');
                      if (template.label.includes('Science')) setSubject('Science');
                      if (template.label.includes('HASS')) setSubject('Humanities & Social Sciences');
                    }}
                    className="px-3 py-2 rounded-lg text-xs bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:border-[#00D4AA]/50 hover:text-[#00D4AA] transition-all"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!subject || !yearLevel || !topic || loading}
              className="w-full py-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#00D4AA] text-[#0D1117] hover:bg-[#00E4BA] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating your lesson plan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Lesson Plan
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Your Lesson Plan</h2>
              <p className="text-xs text-[#8B949E]">{yearLevel} {subject} — {topic}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-xs border border-[#30363D] text-[#8B949E] hover:border-[#00D4AA]/50 hover:text-[#00D4AA] transition-all"
              >
                ← New Plan
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-medium bg-[#00D4AA] text-[#0D1117] hover:bg-[#00E4BA] transition-all">
                Export PDF
              </button>
            </div>
          </div>

          {/* Structured WALT/TIB/WILF Cards */}
          {(parsed.walt || parsed.tib || parsed.wilf) ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* WALT Card */}
              {parsed.walt && (
                <div className="p-4 rounded-xl border-l-4 bg-[#161B22] border-l-[#10B981]" style={{ borderColor: '#10B981' }}>
                  <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: '#10B981' }}>WALT</div>
                  <div className="text-sm text-[#E6EDF3] leading-relaxed">{parsed.walt}</div>
                </div>
              )}
              {/* TIB Card */}
              {parsed.tib && (
                <div className="p-4 rounded-xl border-l-4 bg-[#161B22]" style={{ borderColor: '#10B981' }}>
                  <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: '#10B981' }}>TIB</div>
                  <div className="text-sm text-[#E6EDF3] leading-relaxed">{parsed.tib}</div>
                </div>
              )}
              {/* WILF Card */}
              {parsed.wilf && (
                <div className="p-4 rounded-xl border-l-4 bg-[#161B22]" style={{ borderColor: '#10B981' }}>
                  <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: '#10B981' }}>WILF</div>
                  <ul className="space-y-1">
                    {parsed.wilf.map((item, i) => (
                      <li key={i} className="text-sm text-[#E6EDF3] flex items-start gap-2">
                        <span style={{ color: '#10B981' }}>✓</span>
                        {item.replace(/^[-\d.]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Full content fallback */}
          <div className="p-6 rounded-xl border border-[#30363D] bg-[#161B22]">
            <div className="text-sm whitespace-pre-wrap text-[#E6EDF3] leading-relaxed">
              {result.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3" style={{ color: '#00D4AA' }}>{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
                if (line.match(/^\d+\./)) return <li key={i} className="ml-4 my-1 text-[#8B949E]">{line.replace(/^\d+\.\s*/, '')}</li>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 my-1 text-[#8B949E]">{line.replace('- ', '')}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="my-1">{line}</p>;
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Create Worksheet', icon: '📄', desc: 'Generate activities for this lesson' },
              { label: 'Build Rubric', icon: '✅', desc: 'Create assessment criteria' },
              { label: 'Save to Library', icon: '💾', desc: 'Store in your unit library', onClick: handleSaveToLibrary },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="p-4 rounded-xl border border-[#30363D] bg-[#161B22] hover:border-[#00D4AA]/50 transition-all text-left group"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-medium text-white group-hover:text-[#00D4AA] transition-colors">{action.label}</div>
                <div className="text-xs text-[#6E7681]">{action.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
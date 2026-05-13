'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Check, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'teachwise_class_context';

const YEAR_LEVELS = ['PP', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const SUBJECTS = ['English', 'Mathematics', 'Science', 'HASS', 'Technologies', 'The Arts', 'Health & PE'];

interface ClassContext {
  className: string;
  yearLevel: string;
  subject: string;
  classSize: string;
  esalD: string;
  aboveLevel: string;
  support: string;
  topicsCovered: string;
  specificNeeds: string;
}

function loadContext(): ClassContext {
  if (typeof window === 'undefined') return emptyContext();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return emptyContext();
}

function emptyContext(): ClassContext {
  return {
    className: '',
    yearLevel: '',
    subject: '',
    classSize: '',
    esalD: '',
    aboveLevel: '',
    support: '',
    topicsCovered: '',
    specificNeeds: '',
  };
}

export default function ProfilePage() {
  const [context, setContext] = useState<ClassContext>(emptyContext);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setContext(loadContext());
  }, []);

  const saveContext = useCallback((updated: ClassContext) => {
    setContext(updated);
    setSaveStatus('saving');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, []);

  const update = (field: keyof ClassContext, value: string) => {
    saveContext({ ...context, [field]: value });
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <User className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          Class Context
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Build your class profile to get AI lesson plans tailored to your students
        </p>
      </div>

      {/* Save indicator */}
      <div className="flex items-center gap-2 mb-6 h-6">
        {saveStatus === 'saving' && (
          <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs flex items-center gap-1.5 animate-fade-in" style={{ color: 'var(--color-accent)' }}>
            <Check className="w-3 h-3" />
            Saved to browser
          </span>
        )}
      </div>

      {/* Class Info */}
      <div
        className="p-5 rounded-xl border mb-5"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h3 className="text-sm font-medium text-white mb-4">Class Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-dark">Class Name</label>
            <input
              type="text"
              value={context.className}
              onChange={(e) => update('className', e.target.value)}
              placeholder="e.g. 4 Blue, 6 Gold"
              className="input-dark"
            />
          </div>
          <div>
            <label className="label-dark">Year Level</label>
            <select
              value={context.yearLevel}
              onChange={(e) => update('yearLevel', e.target.value)}
              className="input-dark"
            >
              <option value="">Select year level</option>
              {YEAR_LEVELS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-dark">Subject Focus</label>
            <select
              value={context.subject}
              onChange={(e) => update('subject', e.target.value)}
              className="input-dark"
            >
              <option value="">Select subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-dark">Class Size</label>
            <input
              type="text"
              value={context.classSize}
              onChange={(e) => update('classSize', e.target.value)}
              placeholder="e.g. 24 students"
              className="input-dark"
            />
          </div>
        </div>
      </div>

      {/* Learner Mix */}
      <div
        className="p-5 rounded-xl border mb-5"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h3 className="text-sm font-medium text-white mb-4">Learner Mix</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Approximate percentages of students at different levels
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-dark">EAL/D %</label>
            <input
              type="text"
              value={context.esalD}
              onChange={(e) => update('esalD', e.target.value)}
              placeholder="e.g. 15%"
              className="input-dark"
            />
          </div>
          <div>
            <label className="label-dark">Above Level %</label>
            <input
              type="text"
              value={context.aboveLevel}
              onChange={(e) => update('aboveLevel', e.target.value)}
              placeholder="e.g. 20%"
              className="input-dark"
            />
          </div>
          <div>
            <label className="label-dark">Support %</label>
            <input
              type="text"
              value={context.support}
              onChange={(e) => update('support', e.target.value)}
              placeholder="e.g. 25%"
              className="input-dark"
            />
          </div>
        </div>
      </div>

      {/* Topics & Needs */}
      <div
        className="p-5 rounded-xl border mb-5"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h3 className="text-sm font-medium text-white mb-4">Topics & Needs</h3>
        <div className="space-y-4">
          <div>
            <label className="label-dark">Topics Covered Recently</label>
            <textarea
              value={context.topicsCovered}
              onChange={(e) => update('topicsCovered', e.target.value)}
              placeholder="e.g. Fractions, Narrative writing, Forces and motion..."
              rows={3}
              className="input-dark resize-none"
            />
          </div>
          <div>
            <label className="label-dark">Specific Needs or Notes</label>
            <textarea
              value={context.specificNeeds}
              onChange={(e) => update('specificNeeds', e.target.value)}
              placeholder="e.g. 2 students with IOPs, 3 EAL students need visual supports..."
              rows={3}
              className="input-dark resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
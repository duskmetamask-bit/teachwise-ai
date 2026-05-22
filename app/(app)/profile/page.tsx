'use client';

import { useState, useCallback } from 'react';
import { User, Check, Loader2, Sparkles, School, Layers3, Users, NotebookPen } from 'lucide-react';
import { loadTeacherProfile, saveTeacherProfile, recordActivity } from '@/app/lib/teachwise-store';
import type { TeacherProfile } from '@/app/lib/types';

const YEAR_LEVELS = ['F', 'PP', '1', '2', '3', '4', '5', '6'];
const SUBJECTS = ['English', 'Mathematics', 'Science', 'HASS', 'Technologies', 'The Arts', 'Health & PE'];

function emptyProfile(): TeacherProfile {
  return {
    id: 'local-teacher',
    name: '',
    yearLevel: '',
    subject: '',
    state: 'WA',
    schoolName: '',
    schoolType: '',
    className: '',
    learnerMix: {
      eald: '',
      aboveLevel: '',
      support: '',
    },
    topicsCovered: '',
    specificNeeds: '',
    updatedAt: new Date().toISOString(),
  };
}

export default function ProfilePage() {
  const [context, setContext] = useState<TeacherProfile>(() => {
    const loaded = loadTeacherProfile();
    return {
      ...emptyProfile(),
      ...loaded,
      learnerMix: {
        eald: loaded.learnerMix?.eald || '',
        aboveLevel: loaded.learnerMix?.aboveLevel || '',
        support: loaded.learnerMix?.support || '',
      },
      topicsCovered: loaded.topicsCovered || '',
      specificNeeds: loaded.specificNeeds || '',
    };
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const saveContext = useCallback((updated: TeacherProfile) => {
    setContext(updated);
    setSaveStatus('saving');
    const next: TeacherProfile = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    saveTeacherProfile(next);
    recordActivity({
      ownerId: next.id,
      type: 'chat_message',
      title: 'Teacher profile updated',
      detail: `${next.yearLevel || 'F-6'} ${next.subject || ''}`.trim(),
    });
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1800);
    }, 300);
  }, []);

  const update = (field: keyof TeacherProfile, value: string) => {
    saveContext({ ...context, [field]: value });
  };

  const updateLearnerMix = (field: 'eald' | 'aboveLevel' | 'support', value: string) => {
    saveContext({
      ...context,
      learnerMix: {
        ...(context.learnerMix || {}),
        [field]: value,
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <section className="teachwise-hero mb-6 rounded-[28px] p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-warning)' }}>
              <Sparkles className="h-3.5 w-3.5" />
              Onboarding
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-5xl">Your teaching context makes TeachWise sharper.</h2>
            <p className="mt-4 text-sm leading-7 md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
              Add the basics once and TeachWise will carry them through planning, rubrics, marking and chat.
              This is where the app starts feeling like your own.
            </p>
          </div>
          <div className="teachwise-panel rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(77,208,196,1), rgba(124,183,255,1))' }}>
                <User className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Saved locally for now</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ready to map to Supabase auth</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 h-6">
              {saveStatus === 'saving' && (
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
                  <Check className="h-3 w-3" />
                  Saved
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="teachwise-panel rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <School className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Teacher details
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label-dark">Your name</label>
                <input className="input-dark" value={context.name || ''} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Jordan" />
              </div>
              <div>
                <label className="label-dark">State</label>
                <select className="input-dark" value={context.state} onChange={(e) => update('state', e.target.value)}>
                  {['WA', 'NSW', 'VIC', 'QLD', 'SA', 'TAS', 'ACT', 'NT'].map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-dark">School name</label>
                <input className="input-dark" value={context.schoolName || ''} onChange={(e) => update('schoolName', e.target.value)} placeholder="e.g. North Beach Primary" />
              </div>
              <div>
                <label className="label-dark">Class name</label>
                <input className="input-dark" value={context.className || ''} onChange={(e) => update('className', e.target.value)} placeholder="e.g. 4 Blue" />
              </div>
              <div>
                <label className="label-dark">Year level</label>
                <select className="input-dark" value={context.yearLevel || ''} onChange={(e) => update('yearLevel', e.target.value)}>
                  <option value="">Select year level</option>
                  {YEAR_LEVELS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-dark">Primary subject</label>
                <select className="input-dark" value={context.subject || ''} onChange={(e) => update('subject', e.target.value)}>
                  <option value="">Select subject</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="teachwise-panel rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Learner mix
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label-dark">EAL/D</label>
                <input className="input-dark" value={context.learnerMix?.eald || ''} onChange={(e) => updateLearnerMix('eald', e.target.value)} placeholder="e.g. 15%" />
              </div>
              <div>
                <label className="label-dark">Above level</label>
                <input className="input-dark" value={context.learnerMix?.aboveLevel || ''} onChange={(e) => updateLearnerMix('aboveLevel', e.target.value)} placeholder="e.g. 20%" />
              </div>
              <div>
                <label className="label-dark">Support</label>
                <input className="input-dark" value={context.learnerMix?.support || ''} onChange={(e) => updateLearnerMix('support', e.target.value)} placeholder="e.g. 25%" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="teachwise-panel rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Recent context
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-dark">Topics covered recently</label>
                <textarea className="input-dark resize-none" rows={4} value={context.topicsCovered || ''} onChange={(e) => update('topicsCovered', e.target.value)} placeholder="e.g. Fractions, narrative writing, force and motion..." />
              </div>
              <div>
                <label className="label-dark">Specific needs or notes</label>
                <textarea className="input-dark resize-none" rows={4} value={context.specificNeeds || ''} onChange={(e) => update('specificNeeds', e.target.value)} placeholder="e.g. 2 students need visual supports, 1 student is working below level..." />
              </div>
            </div>
          </div>

          <div className="teachwise-panel rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <NotebookPen className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                What this powers
              </h3>
            </div>
            <div className="space-y-3 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
              <p>• Better AC9 alignment in lesson and unit generation</p>
              <p>• Cleaner differentiation suggestions</p>
              <p>• More relevant rubric descriptors and marking feedback</p>
              <p>• Faster chat responses that sound like they know your classroom</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

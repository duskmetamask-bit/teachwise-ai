'use client';

import { useState } from 'react';

const concernTypes = ['Behaviour Support Plan', 'De-escalation Strategy', 'Wellbeing Check-In', 'Individual Education Plan'];
const yearLevels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];

export default function BehaviourPage() {
  const [concernType, setConcernType] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (!concernType || !yearLevel) return;
    setLoading(true);
    setTimeout(() => {
      const content = concernType === 'Behaviour Support Plan' ? `## Behaviour Support Plan

**Student Year Level:** ${yearLevel}
**Focus:** [Behaviour concern]
**Date Created:** ${new Date().toLocaleDateString()}
**Review Date:** ${new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toLocaleDateString()}

---

### 1. What's Working Well

- [Note positive behaviours and existing strategies that are effective]
- Student responds well to [specific trigger/strategy]
- Strong relationships with [specific adults/peers]

### 2. Behaviour Concern Summary

**What the behaviour looks like:**
[Describe observable behaviours]

**What might be causing it:**
[Think about: unmet needs, curriculum access, social, emotional, home factors]

**Function of the behaviour:**
[Is the student seeking attention, avoiding something, or meeting a need?]

### 3. Support Strategies

**Immediate Strategies:**
- Pre-teach expectations
- Provide visual schedule
- Offer choice and autonomy where possible

**Proactive Strategies:**
- Seating arrangement considerations
- Movement breaks scheduled
- Sensory needs accommodated

**Reactive Strategies:**
- [Specific calm-down procedure]
- [Who student can go to for support]
- [De-escalation steps]

### 4. Success Criteria

By the next review, the student will:
1. [Observable, measurable goal]
2. [Observable, measurable goal]

### 5. Team Involved

- Class Teacher: _______________
- Support Staff: _______________
- Parent/Caregiver: _______________
- External Support: _______________` : concernType === 'De-escalation Strategy' ? `## De-escalation Strategy

**Context:** ${yearLevel} classroom
**Trigger Type:** [e.g., frustration, overwhelm, social conflict]

---

### When You Notice Early Signs

Early indicators may include:
- Body language changes (tension, withdrawal)
- Verbal indicators (tone change, short responses)
- Task avoidance or refusal

### De-escalation Steps

**Step 1: Stay Calm & Regulate**
- Lower your own arousal state first
- Speak slowly, calmly, lower pitch
- Avoid quick movements

**Step 2: Connect Privately**
- Move away from audience if possible
- Use low-arousal words: "I can see something is going on"

**Step 3: Listen & Validate**
- "You seem really frustrated about [X]"
- Allow silence - don't fill every gap
- Nod, maintain calm body language

**Step 4: Offer Choice & Control**
- "Would you like to [option A] or [option B]?"
- Offer small decisions to restore sense of control

**Step 5: Co-regulate**
- Match student's regulation state
- Co-regulation before de-escalation

**Step 6: Follow-up**
- Check in after the student has regulated
- Brief, non-judgmental debrief
- Document incident

### Scripts to Use
- "I can see this is hard right now"
- "Let's figure this out together"
- "What do you need right now?"

### Scripts to Avoid
- "Stop it"
- "You need to calm down"
- "That's inappropriate"` : `## Wellbeing Check-In

**Year Level:** ${yearLevel}
**Date:** ${new Date().toLocaleDateString()}
**Check-In Type:** ${concernType}

---

### Conversation Guide

Use these open-ended questions to guide your check-in:

1. "How are you feeling today? On a scale of 1-10, where are you at?"
2. "What's been the best part of your day/week?"
3. "Is there anything that's been tricky or worrying you?"
4. "Who do you feel you can talk to if you're not okay?"
5. "What helps you feel calm and happy?"

### Things to Notice
- Eye contact and engagement
- Changes from usual behaviour
- Physical indicators of stress
- Unusual patterns in responses

### Follow-Up Actions

**If student is thriving:**
- Acknowledge and affirm
- Set goals for continued growth

**If student has minor concerns:**
- Document and monitor
- Check in again in [timeframe]

**If student has significant concerns:**
- Immediate support and documentation
- Refer to wellbeing team
- Contact parent/caregiver
- Document all actions taken

### Documentation

Notes from this check-in:
_____________________________________________
_____________________________________________

Recommended follow-up: _______________`;

      setResult(content);
      setLoading(false);
      setShowResult(true);
    }, 2000);
  };

  const handleReset = () => {
    setConcernType(''); setYearLevel(''); setDescription('');
    setResult(''); setShowResult(false);
  };

  return (
    <div className="animate-fade-in">
      {!showResult ? (
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Behaviour Support</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Get behaviour support plans, de-escalation strategies, and wellbeing check-in guides
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Support Type</label>
                <select value={concernType} onChange={(e) => setConcernType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">Select type</option>
                  {concernTypes.map((c) => <option key={c} value={c}>{c}</option>)}
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
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Additional Context (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the specific situation or concern..."
                rows={3} className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!concernType || !yearLevel || loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: concernType && yearLevel && !loading ? 'var(--accent)' : 'var(--bg-card)',
                color: concernType && yearLevel && !loading ? 'var(--bg-primary)' : 'var(--text-muted)',
                cursor: concernType && yearLevel && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Generating...' : 'Generate Support Plan'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Support Plan</h2>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 rounded-lg text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                New Plan
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
'use client';

import { useState } from 'react';
import Link from 'next/link';

const quickActions = [
  { label: 'Lesson Planner', href: '/planner', icon: '◎', desc: 'Generate AC9-aligned lesson plans' },
  { label: 'Unit Library', href: '/units', icon: '◇', desc: 'Browse 100s of ready-to-use units' },
  { label: 'Rubric Generator', href: '/rubrics', icon: '◉', desc: 'Create detailed assessment rubrics' },
  { label: 'Auto-Marking', href: '/automark', icon: '◇', desc: 'Upload work, get instant feedback' },
];

const recentActivity = [
  { type: 'chat', text: 'Generated lesson plan for Year 4 Fractions', time: '2 hours ago' },
  { type: 'rubric', text: 'Created rubric for Year 5 Persuasive Writing', time: 'Yesterday' },
  { type: 'unit', text: 'Viewed Unit: Earth\'s Living History', time: '2 days ago' },
  { type: 'worksheet', text: 'Generated Worksheet: Multiplication Word Problems', time: '3 days ago' },
];

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');

  const hour = new Date().getHours();
  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-1">{getGreeting()}, Jane</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          What would you like to create today?
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Units Created', value: '24', icon: '◇' },
          { label: 'Rubrics Built', value: '18', icon: '◉' },
          { label: 'Worksheets Generated', value: '42', icon: '◎' },
          { label: 'Students Assisted', value: '156', icon: '◈' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: 'var(--accent)' }}>{stat.icon}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 group"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
              >
                {action.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-white mb-1 group-hover:text-white">
                  {action.label}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {action.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div
          className="p-5 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{item.text}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div
          className="p-5 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-medium text-white mb-4">Teaching Tips</h3>
          <div className="space-y-3">
            {[
              'Use the Auto-Marking tool to save hours on feedback. Upload a rubric and student work for instant criterion-by-criterion analysis.',
              'Try the Writing Feedback tool with your Year 5-6 students. It provides growth-focused feedback on narrative and persuasive texts.',
              'The Report Comments generator creates AC9-aligned comments in seconds. Select effort level and get personalised feedback instantly.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span style={{ color: 'var(--accent)' }} className="flex-shrink-0">*</span>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
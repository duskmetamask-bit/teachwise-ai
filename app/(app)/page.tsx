'use client';

import Link from 'next/link';

// ─── Tool definitions ───────────────────────────────────────────────
const tools = [
  {
    label: 'Lesson Planner',
    href: '/planner',
    desc: 'Generate AC9-aligned lesson plans',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: '#059669',
    colorBg: '#ecfdf5',
  },
  {
    label: 'Rubrics',
    href: '/rubrics',
    desc: 'Build assessment criteria fast',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: '#7c3aed',
    colorBg: '#f5f3ff',
  },
  {
    label: 'Unit Library',
    href: '/units',
    desc: 'Browse and manage teaching units',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: '#ea580c',
    colorBg: '#fff7ed',
  },
  {
    label: 'Auto-Marking',
    href: '/automark',
    desc: 'Upload work, get instant feedback',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    color: '#0284c7',
    colorBg: '#f0f9ff',
  },
  {
    label: 'AI Chat',
    href: '/chat',
    desc: 'Ask anything about your lesson',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: '#0f766e',
    colorBg: '#f0fdfa',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        {title}
      </h2>
      {action && (
        <Link
          href={action.href}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* Header: Greeting + Date */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{getGreeting()}</h1>
        <p className="text-sm text-slate-400 mt-0.5">{formatDate()}</p>
      </div>

      {/* Quick Actions — Primary tool grid */}
      <section>
        <SectionHeader title="Tools" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col items-start p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: tool.colorBg, color: tool.color }}
              >
                {tool.icon}
              </div>
              <div className="text-sm font-semibold text-slate-800 mb-0.5">
                {tool.label}
              </div>
              <div className="text-xs text-slate-400 leading-snug">
                {tool.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Two-column: Recent + Prompts */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent units */}
        <Card>
          <div className="p-6">
            <SectionHeader
              title="Recent Units"
              action={{ label: 'View all', href: '/units' }}
            />
            <div className="space-y-3">
              {[
                {
                  subject: 'Mathematics',
                  topic: 'Fractions & Decimals',
                  year: 'Year 5',
                  color: '#7c3aed',
                  colorBg: '#f5f3ff',
                },
                {
                  subject: 'English',
                  topic: 'Persuasive Writing',
                  year: 'Year 6',
                  color: '#0284c7',
                  colorBg: '#f0f9ff',
                },
                {
                  subject: 'Science',
                  topic: 'Earth\'s Living History',
                  year: 'Year 4',
                  color: '#059669',
                  colorBg: '#ecfdf5',
                },
              ].map((unit) => (
                <div
                  key={unit.topic}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: unit.colorBg, color: unit.color }}
                  >
                    {unit.subject[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {unit.topic}
                    </div>
                    <div className="text-xs text-slate-400">
                      {unit.subject} · {unit.year}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick prompts */}
        <Card>
          <div className="p-6">
            <SectionHeader title="Quick Actions" />
            <div className="space-y-2">
              {[
                {
                  label: 'Generate a lesson plan',
                  sub: 'AC9-aligned, with WALT, TIB & WILF',
                  href: '/planner',
                  icon: '📋',
                  color: '#059669',
                  colorBg: '#ecfdf5',
                },
                {
                  label: 'Build a rubric',
                  sub: 'Criterion-based, achievement standard linked',
                  href: '/rubrics',
                  icon: '✅',
                  color: '#7c3aed',
                  colorBg: '#f5f3ff',
                },
                {
                  label: 'Mark student work',
                  sub: 'Upload rubric + student response',
                  href: '/automark',
                  icon: '📝',
                  color: '#0284c7',
                  colorBg: '#f0f9ff',
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: item.colorBg }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-400">{item.sub}</div>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </Card>

      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Lessons planned', value: '12', sub: 'this term', color: '#059669' },
          { label: 'Rubrics built', value: '8', sub: 'active', color: '#7c3aed' },
          { label: 'Units in library', value: '6', sub: 'saved', color: '#0284c7' },
          { label: 'Auto-marks done', value: '24', sub: 'all time', color: '#ea580c' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className="w-1 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: stat.color }}
            />
            <div>
              <div className="text-xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

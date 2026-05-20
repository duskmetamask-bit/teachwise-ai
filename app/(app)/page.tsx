'use client';

import Link from 'next/link';
import { LayoutDashboard, MessageSquare, ClipboardList, Library, Calendar, CheckSquare, Zap, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

// ─── Tool definitions ─────────────────────────────────────────────
const tools = [
  {
    label: 'Lesson Planner',
    href: '/planner',
    desc: 'Generate AC9-aligned lesson plans',
    icon: Calendar,
    color: '#8b2df5',
  },
  {
    label: 'Rubrics',
    href: '/rubrics',
    desc: 'Build assessment criteria fast',
    icon: ClipboardList,
    color: '#a78bfa',
  },
  {
    label: 'Unit Library',
    href: '/units',
    desc: 'Browse and manage teaching units',
    icon: Library,
    color: '#6366f1',
  },
  {
    label: 'Auto-Marking',
    href: '/automark',
    desc: 'Upload work, get instant feedback',
    icon: CheckSquare,
    color: '#f59e0b',
  },
  {
    label: 'AI Chat',
    href: '/chat',
    desc: 'Ask anything about your lesson',
    icon: MessageSquare,
    color: '#8b2df5',
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

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">

      {/* Header: Greeting + Date */}
      <div>
        <h1 className="text-2xl font-bold text-white">{getGreeting()}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{formatDate()}</p>
      </div>

      {/* Quick Actions — Primary tool grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Tools
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col items-start p-5 rounded-2xl border transition-all duration-200"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tool.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
              >
                <tool.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-white mb-0.5">
                {tool.label}
              </div>
              <div className="text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                {tool.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Two-column: Recent + Prompts */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent units */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Recent Units
            </h2>
            <Link
              href="/units"
              className="text-xs font-medium transition-colors flex items-center gap-1"
              style={{ color: 'var(--color-accent)' }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              {
                subject: 'Mathematics',
                topic: 'Fractions & Decimals',
                year: 'Year 5',
                color: '#8b2df5',
              },
              {
                subject: 'English',
                topic: 'Persuasive Writing',
                year: 'Year 6',
                color: '#a78bfa',
              },
              {
                subject: 'Science',
                topic: "Earth's Living History",
                year: 'Year 4',
                color: '#6366f1',
              },
            ].map((unit) => (
              <div
                key={unit.topic}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--color-border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-border)';
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: `${unit.color}20`, color: unit.color }}
                >
                  {unit.subject[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {unit.topic}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {unit.subject} · {unit.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick prompts */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Quick Actions
            </h2>
          </div>
          <div className="space-y-2">
            {[
              {
                label: 'Generate a lesson plan',
                sub: 'AC9-aligned, with WALT, TIB & WILF',
                href: '/planner',
                icon: Sparkles,
              },
              {
                label: 'Build a rubric',
                sub: 'Criterion-based, achievement standard linked',
                href: '/rubrics',
                icon: CheckSquare,
              },
              {
                label: 'Mark student work',
                sub: 'Upload rubric + student response',
                href: '/automark',
                icon: BookOpen,
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors group"
                style={{ backgroundColor: 'var(--color-border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-border)';
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white group-hover:text-[var(--color-accent)] transition-colors">
                    {item.label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.sub}</div>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Lessons planned', value: '12', sub: 'this term', color: '#8b2df5' },
          { label: 'Rubrics built', value: '8', sub: 'active', color: '#a78bfa' },
          { label: 'Units in library', value: '6', sub: 'saved', color: '#6366f1' },
          { label: 'Auto-marks done', value: '24', sub: 'all time', color: '#f59e0b' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="w-1 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: stat.color }}
            />
            <div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
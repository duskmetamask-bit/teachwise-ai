'use client';

import Link from 'next/link';
import {
  MessageSquare,
  ClipboardList,
  Library,
  Calendar,
  CheckSquare,
  ArrowRight,
  BookOpen,
  Sparkles,
  Clock3,
  Target,
  Wand2,
} from 'lucide-react';

const tools = [
  { label: 'Lesson Planner', href: '/planner', desc: 'Shape WALT, TIB, WILF and lesson blocks', icon: Calendar, color: '#14b8a6' },
  { label: 'AI Chat', href: '/chat', desc: 'Generate full AC9-aligned unit plans', icon: MessageSquare, color: '#818cf8' },
  { label: 'Rubrics', href: '/rubrics', desc: 'Build criterion-based assessment grids', icon: ClipboardList, color: '#f59e0b' },
  { label: 'Auto-Marking', href: '/automark', desc: 'Turn student work into targeted feedback', icon: CheckSquare, color: '#fb7185' },
  { label: 'Unit Library', href: '/units', desc: 'Find, filter and reuse saved units', icon: Library, color: '#38bdf8' },
];

const agenda = [
  { time: '8:45', title: 'Year 5 fractions warm-up', tag: 'Maths', color: '#14b8a6' },
  { time: '10:20', title: 'Narrative writing conference prompts', tag: 'English', color: '#f59e0b' },
  { time: '1:15', title: 'Science assessment feedback pass', tag: 'Science', color: '#fb7185' },
];

const stats = [
  { label: 'Lessons planned', value: '12', sub: 'this term', color: '#14b8a6' },
  { label: 'Rubrics built', value: '8', sub: 'ready to reuse', color: '#f59e0b' },
  { label: 'Units saved', value: '6', sub: 'in library', color: '#38bdf8' },
  { label: 'Feedback notes', value: '24', sub: 'drafted', color: '#fb7185' },
];

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

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <section className="teachwise-hero overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-medium" style={{ color: '#a7f3d0' }}>{formatDate()}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
              {getGreeting()}, ready to make tomorrow&apos;s lessons feel lighter?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              Plan lessons, generate AC9 units, build rubrics and draft feedback from one focused teaching workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/chat" className="btn-primary">
                <Sparkles className="h-4 w-4" />
                Generate Unit Plan
              </Link>
              <Link href="/planner" className="btn-secondary">
                <Wand2 className="h-4 w-4" />
                Open Planner
              </Link>
            </div>
          </div>

          <div className="teachwise-panel rounded-2xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Today&apos;s teaching flow</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Prepared from your recent work</div>
              </div>
              <Clock3 className="h-5 w-5" style={{ color: '#fbbf24' }} />
            </div>
            <div className="space-y-3">
              {agenda.map((item) => (
                <div key={item.title} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.055)' }}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <span className="text-xs font-semibold" style={{ color: item.color }}>{item.time}</span>
                      </div>
                      <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.tag}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="tool-card group rounded-2xl p-5 transition-all duration-200">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${tool.color}22`, color: tool.color }}>
                <tool.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h2 className="text-sm font-semibold text-white">{tool.label}</h2>
            <p className="mt-2 text-xs leading-5" style={{ color: 'var(--color-text-muted)' }}>{tool.desc}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="teachwise-panel rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Recent Units</h2>
            <Link href="/units" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              ['Mathematics', 'Fractions & Decimals', 'Year 5', '#14b8a6'],
              ['English', 'Persuasive Writing', 'Year 6', '#f59e0b'],
              ['Science', "Earth's Living History", 'Year 4', '#38bdf8'],
            ].map(([subject, topic, year, color]) => (
              <div key={topic} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold" style={{ backgroundColor: `${color}22`, color }}>
                  {subject[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{topic}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{subject} · {year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="teachwise-panel rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: '#fbbf24' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Quick Starts</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: 'Plan a lesson', sub: 'WALT, TIB and WILF', href: '/planner', icon: Sparkles },
              { label: 'Build a rubric', sub: 'Achievement standard linked', href: '/rubrics', icon: CheckSquare },
              { label: 'Mark work', sub: 'Criterion feedback draft', href: '/automark', icon: BookOpen },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl p-4 transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <item.icon className="mb-4 h-5 w-5" style={{ color: 'var(--color-accent)' }} />
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="teachwise-panel rounded-2xl p-5">
            <div className="mb-4 h-1 w-12 rounded-full" style={{ backgroundColor: stat.color }} />
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-white">{stat.label}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

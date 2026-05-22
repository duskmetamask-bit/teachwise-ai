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
  Activity,
  TimerReset,
  FileText,
} from 'lucide-react';
import {
  estimateMinutesReclaimed,
  loadActivityEvents,
  loadMarkingResults,
  loadRubrics,
  loadTeacherProfile,
  loadUnits,
} from '@/app/lib/teachwise-store';

const tools = [
  {
    label: 'Lesson Planner',
    href: '/planner',
    desc: 'Build WALT, TIB, WILF and lesson blocks with AC9 context.',
    icon: Calendar,
    color: '#4dd0c4',
  },
  {
    label: 'AI Chat',
    href: '/chat',
    desc: 'Ask for anything: lesson ideas, parent emails, reports, routines, differentiation.',
    icon: MessageSquare,
    color: '#7cb7ff',
  },
  {
    label: 'Rubrics',
    href: '/rubrics',
    desc: 'Create analytic or holistic assessment rubrics in a clean printable format.',
    icon: ClipboardList,
    color: '#f4c26a',
  },
  {
    label: 'Auto-Mark',
    href: '/automark',
    desc: 'Upload work and get fast, criterion-based feedback drafts.',
    icon: CheckSquare,
    color: '#f47ca5',
  },
  {
    label: 'Unit Library',
    href: '/units',
    desc: 'Open, duplicate and reuse saved plans without hunting through folders.',
    icon: Library,
    color: '#93a7ff',
  },
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
  const profile = loadTeacherProfile();
  const units = loadUnits();
  const rubrics = loadRubrics();
  const results = loadMarkingResults();
  const activity = loadActivityEvents();
  const reclaimed = estimateMinutesReclaimed(activity);
  const latestActivity = activity.slice(0, 4);

  const stats = [
    { label: 'Plans saved', value: String(units.length || 0), sub: 'unit plans in library', color: '#4dd0c4' },
    { label: 'Rubrics ready', value: String(rubrics.length || 0), sub: 'printable assessment tools', color: '#f4c26a' },
    { label: 'Marking drafts', value: String(results.length || 0), sub: 'feedback moments captured', color: '#f47ca5' },
    { label: 'Time reclaimed', value: `${Math.max(0, Math.round(reclaimed / 60))}h`, sub: 'tracked from activity', color: '#7cb7ff' },
  ];

  const agenda = [
    {
      time: 'Now',
      title: profile.subject ? `${profile.subject} planning sprint` : 'Open a teaching tool',
      tag: profile.yearLevel || 'F-6',
      color: '#4dd0c4',
    },
    {
      time: 'Later',
      title: 'Finalise tomorrow’s lesson sequence',
      tag: 'Planner',
      color: '#7cb7ff',
    },
    {
      time: 'Tonight',
      title: 'Draft the marking feedback you do not want to type by hand',
      tag: 'Auto-Mark',
      color: '#f47ca5',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <section className="teachwise-hero overflow-hidden rounded-[28px] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.16fr_0.84fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-warning)' }}>
              {formatDate()}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
              {getGreeting()}, {profile.name || 'teacher'}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              TeachWise keeps the heavy lifting in one place: lesson planning, rubrics, marking, chat, and saved units.
              It is built to feel like the senior colleague you wish you had at 11pm on a Sunday.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/chat" className="btn-primary">
                <Sparkles className="h-4 w-4" />
                Ask TeachWise
              </Link>
              <Link href="/planner" className="btn-secondary">
                <Wand2 className="h-4 w-4" />
                Open Planner
              </Link>
            </div>
          </div>

          <div className="teachwise-panel rounded-3xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Today&apos;s teaching flow</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Pulled from your workspace activity</div>
              </div>
              <Clock3 className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
            </div>
            <div className="space-y-3">
              {agenda.map((item) => (
                <div key={item.title} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.045)' }}>
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
          <Link key={tool.href} href={tool.href} className="tool-card group rounded-3xl p-5 transition-all duration-200">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${tool.color}22`, color: tool.color }}>
                <tool.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h2 className="text-sm font-semibold text-white">{tool.label}</h2>
            <p className="mt-2 text-xs leading-5" style={{ color: 'var(--color-text-muted)' }}>
              {tool.desc}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="teachwise-panel rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Recent units
            </h2>
            <Link href="/units" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {units.slice(0, 3).map((unit, index) => (
              <div key={unit.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.045)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold" style={{ backgroundColor: index === 0 ? '#4dd0c422' : index === 1 ? '#f4c26a22' : '#7cb7ff22', color: index === 0 ? '#4dd0c4' : index === 1 ? '#f4c26a' : '#7cb7ff' }}>
                  {unit.subject[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{unit.title}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {unit.subject} · {unit.yearLevel}
                  </div>
                </div>
                <FileText className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
              </div>
            ))}
            {units.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No saved units yet. Create one in the planner or chat and it will live here.
              </div>
            )}
          </div>
        </div>

        <div className="teachwise-panel rounded-3xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Quick starts
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: 'Plan a lesson', sub: 'WALT, TIB, WILF', href: '/planner', icon: BookOpen },
              { label: 'Build a rubric', sub: 'AC9 aligned', href: '/rubrics', icon: ClipboardList },
              { label: 'Mark work', sub: 'Feedback draft', href: '/automark', icon: CheckSquare },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl p-4 transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.045)' }}>
                <item.icon className="mb-4 h-5 w-5" style={{ color: 'var(--color-accent)' }} />
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {item.sub}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="teachwise-panel rounded-3xl p-5">
            <div className="mb-4 h-1 w-12 rounded-full" style={{ backgroundColor: stat.color }} />
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="mt-1 text-sm font-semibold text-white">{stat.label}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="teachwise-panel rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Activity
            </h2>
            <Activity className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="space-y-3">
            {latestActivity.length > 0 ? latestActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.045)' }}>
                <div className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.type === 'work_marked' ? '#f47ca5' : item.type === 'rubric_created' ? '#f4c26a' : '#4dd0c4' }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-muted)' }}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-1 text-xs leading-5" style={{ color: 'var(--color-text-muted)' }}>
                    {item.detail || 'Something useful happened in the workspace.'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Once you save or generate something, the activity feed starts filling itself.
              </div>
            )}
          </div>
        </div>

        <div className="teachwise-panel rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Current workload
            </h2>
            <TimerReset className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.045)' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">Teacher profile</div>
                <div className="text-xs" style={{ color: 'var(--color-accent)' }}>
                  {profile.state || 'WA'}
                </div>
              </div>
              <div className="mt-2 text-xs leading-5" style={{ color: 'var(--color-text-muted)' }}>
                {profile.subject || 'Generalist'} · {profile.yearLevel || 'F-6'} · {profile.className || 'Class context not set yet'}
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.045)' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">Marked work</div>
                <div className="text-xs" style={{ color: 'var(--color-warning)' }}>
                  {results.length}
                </div>
              </div>
              <div className="mt-2 text-xs leading-5" style={{ color: 'var(--color-text-muted)' }}>
                Keep raw responses, parsed grades, and feedback drafts in one place.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


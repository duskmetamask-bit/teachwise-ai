'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  Library,
  Calendar,
  CheckSquare,
  User,
  ChevronLeft,
  ChevronRight,
  BadgeInfo,
  BarChart3,
} from 'lucide-react';
import { loadTeacherProfile, loadActivityEvents, estimateMinutesReclaimed } from '@/app/lib/teachwise-store';
import { TeachWiseBrand } from '@/app/components/teachwise-brand';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'AI Chat', href: '/chat', icon: MessageSquare },
  { label: 'Rubrics', href: '/rubrics', icon: ClipboardList },
  { label: 'Unit Library', href: '/units', icon: Library },
  { label: 'Lesson Planner', href: '/planner', icon: Calendar },
  { label: 'Auto-Mark', href: '/automark', icon: CheckSquare },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const profile = useMemo(() => loadTeacherProfile(), []);
  const activity = useMemo(() => loadActivityEvents(), []);
  const reclaimed = estimateMinutesReclaimed(activity);

  return (
    <div className="app-layout flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <aside
        className="app-sidebar flex flex-col transition-all duration-300"
        style={{
          width: collapsed ? 88 : 284,
          minWidth: collapsed ? 88 : 284,
          background:
            'linear-gradient(180deg, rgba(7,17,31,0.98), rgba(10,20,35,0.96))',
          borderRight: '1px solid var(--color-border-subtle)',
        }}
        >
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <TeachWiseBrand
            compact={collapsed}
            className="min-w-0"
            tagline="Less marking. More teaching."
          />
        </div>

        <div className="px-4 py-4">
          {!collapsed ? (
            <div className="teachwise-panel rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
                <BadgeInfo className="h-3.5 w-3.5" />
                Teaching context
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: 'var(--color-text-muted)' }}>Teacher</span>
                  <span className="truncate text-white">{profile.name || 'Set your profile'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: 'var(--color-text-muted)' }}>Year</span>
                  <span className="text-white">{profile.yearLevel || 'F-6'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: 'var(--color-text-muted)' }}>Subject</span>
                  <span className="text-white">{profile.subject || 'Generalist'}</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: 'rgba(77,208,196,0.08)', color: 'var(--color-accent)' }}>
                {reclaimed > 0 ? `${Math.round(reclaimed)} minutes reclaimed in this workspace` : 'Track your reclaimed time here'}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
              <BarChart3 className="mx-auto h-4 w-4" />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mx-3 mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-200 ${
                  active
                    ? 'bg-[rgba(77,208,196,0.12)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-[var(--color-accent)]' : ''}`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          {!collapsed && (
            <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs leading-5" style={{ color: 'var(--color-text-secondary)' }}>
              Open. Focused. Built for real classrooms, not compliance theatre.
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-2xl py-2.5 text-sm transition-colors"
            style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      <main className="app-main flex-1 overflow-y-auto">
        <header
          className="flex items-center justify-between px-5 py-4 md:px-6"
          style={{
            backgroundColor: 'rgba(8, 17, 32, 0.72)',
            backdropFilter: 'blur(18px)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-white">
              {navItems.find((item) => item.href === pathname)?.label || 'TeachWise'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Free beta workspace for Australian F-6 teachers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold md:flex" style={{ color: 'var(--color-warning)' }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }} />
              Free beta
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, rgba(77,208,196,1), rgba(124,183,255,1))' }}
              title={profile.name || 'Teacher profile'}
            >
              {(profile.name || 'T')
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
          </div>
        </header>

        <div className="dashboard-surface p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}

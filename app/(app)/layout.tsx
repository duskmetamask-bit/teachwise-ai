'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, ClipboardList, Library, Calendar, CheckSquare, User, ChevronLeft, ChevronRight, Sparkles, CircleSlash2 } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'AI Chat', href: '/chat', icon: MessageSquare },
  { label: 'Rubrics', href: '/rubrics', icon: ClipboardList },
  { label: 'Unit Library', href: '/units', icon: Library },
  { label: 'Lesson Planner', href: '/planner', icon: Calendar },
  { label: 'Auto-Marking', href: '/automark', icon: CheckSquare },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="app-layout flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <aside
        className="app-sidebar flex flex-col transition-all duration-300"
        style={{
          width: collapsed ? 84 : 292,
          minWidth: collapsed ? 84 : 292,
          background: 'linear-gradient(180deg, rgba(9,17,29,0.98), rgba(12,20,33,0.96))',
          borderRight: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="border-b border-white/5 px-4 py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10"
              style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.28), rgba(15,118,110,0.85))' }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in overflow-hidden">
                <div className="text-base font-semibold tracking-tight text-white">TeachWise</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Premium teacher workspace</div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-[11px] text-sm transition-all duration-200 ${
                  active
                    ? 'mb-1 border border-white/10 bg-white/[0.08] font-semibold text-white shadow-[0_10px_40px_rgba(2,8,23,0.22)]'
                    : 'mb-1 text-[var(--color-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={`h-[18px] w-[18px] flex-shrink-0 ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]'}`}
                />
                {!collapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          {!collapsed && (
            <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--color-text-muted)' }}>
                <CircleSlash2 className="h-3.5 w-3.5" />
                System
              </div>
              <div className="mt-2 text-sm text-white">Everything stays local until you choose to export or log it.</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-2xl border border-white/10 py-2.5 text-sm transition-colors hover:bg-white/[0.06]"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--color-text-muted)' }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <main className="app-main flex-1 overflow-y-auto">
        <header
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: 'rgba(9, 17, 29, 0.66)',
            backdropFilter: 'blur(18px)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-muted)' }}>Workspace</p>
            <h1 className="truncate text-lg font-semibold text-white">
              {navItems.find((n) => n.href === pathname)?.label || 'TeachWise AI'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-sm font-medium"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
              Local session
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.95), rgba(15,118,110,0.95))' }}
            >
              JD
            </div>
          </div>
        </header>

        <div className="p-5 md:p-6">{children}</div>
      </main>
    </div>
  );
}

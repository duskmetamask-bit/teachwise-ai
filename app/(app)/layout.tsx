'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LayoutGrid,
  LibraryBig,
  MessageSquare,
  Monitor,
  PanelLeftClose,
  Plus,
  Sparkles,
  Users,
  Wand2,
  ClipboardList,
  BookOpenText,
  FileText,
} from 'lucide-react';
import TeachwiseLogo from '@/app/components/TeachwiseLogo';

type NavItem = {
  label: string;
  href: string;
  icon: typeof MessageSquare;
  accent?: 'teal' | 'amber' | 'sky' | 'violet' | 'rose' | 'slate';
  badge?: string;
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Workspace',
    items: [
      { label: 'Chat', href: '/', icon: MessageSquare, accent: 'teal' },
      { label: 'Templates', href: '/planner', icon: LayoutGrid, accent: 'amber' },
      { label: 'Resources', href: '/units', icon: LibraryBig, accent: 'sky' },
      { label: 'Smart Tools', href: '/chat', icon: Wand2, accent: 'violet' },
      { label: 'Assessments', href: '/rubrics', icon: ClipboardList, accent: 'rose' },
      { label: 'Reports', href: '/automark', icon: FileText, accent: 'slate' },
    ],
  },
  {
    label: 'Teaching Flow',
    items: [
      { label: 'Today', href: '/', icon: CalendarDays, accent: 'amber', badge: '3' },
      { label: 'This Week', href: '/planner', icon: Monitor, accent: 'sky' },
      { label: 'Planner', href: '/planner', icon: BookOpenText, accent: 'teal' },
      { label: 'Classes', href: '/profile', icon: Users, accent: 'violet' },
    ],
  },
  {
    label: 'Saved & History',
    items: [
      { label: 'Saved Outputs', href: '/chat', icon: PanelLeftClose, accent: 'teal' },
      { label: 'Snippets', href: '/chat', icon: Sparkles, accent: 'amber' },
      { label: 'History', href: '/chat', icon: FileText, accent: 'sky' },
    ],
  },
];

function accentStyles(accent?: NavItem['accent']) {
  switch (accent) {
    case 'amber':
      return { bg: 'rgba(245, 158, 11, 0.14)', fg: '#fbbf24' };
    case 'sky':
      return { bg: 'rgba(56, 189, 248, 0.14)', fg: '#67e8f9' };
    case 'violet':
      return { bg: 'rgba(129, 140, 248, 0.14)', fg: '#a5b4fc' };
    case 'rose':
      return { bg: 'rgba(251, 113, 133, 0.14)', fg: '#fb7185' };
    case 'slate':
      return { bg: 'rgba(148, 163, 184, 0.10)', fg: '#cbd5e1' };
    default:
      return { bg: 'rgba(20, 184, 166, 0.14)', fg: '#5eead4' };
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#07101b] text-white">
      <aside
        className="flex min-h-0 flex-col border-r border-white/8 bg-[#09111d] transition-all duration-300"
        style={{ width: collapsed ? 88 : 286 }}
      >
        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-4">
          <TeachwiseLogo idSuffix="layout" className="h-10 w-10 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[17px] font-semibold leading-none text-white">TeachWise</div>
              <div className="mt-1 text-[13px] text-slate-300">AI for Australian Teachers</div>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed && (
                <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href && item.label === 'Chat';
                  const styles = accentStyles(item.accent);
                  return (
                    <Link
                      key={`${group.label}-${item.label}`}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] transition ${
                        active
                          ? 'bg-[rgba(20,184,166,0.16)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                          : 'text-slate-300 hover:bg-white/6 hover:text-white'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ background: styles.bg, color: styles.fg }}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      {!collapsed && (
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <span className="truncate">{item.label}</span>
                          {item.badge ? (
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#fbbf24] px-1.5 text-[12px] font-semibold text-[#0f172a]">
                              {item.badge}
                            </span>
                          ) : null}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!collapsed && (
          <div className="mx-3 mb-4 rounded-2xl border border-[#8a6c30]/45 bg-[#110f0d] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#f7c15d]">
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </div>
            <p className="mt-2 max-w-[210px] text-[13px] leading-6 text-slate-300">
              Unlock unlimited outputs, advanced context and priority AI.
            </p>
            <button className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#f5b84b] text-[14px] font-semibold text-[#121212] transition hover:brightness-105">
              Upgrade Now
            </button>
          </div>
        )}

        <div className="border-t border-white/8 p-3">
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] text-slate-300 transition hover:bg-white/6 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[84px] items-center gap-4 border-b border-white/8 bg-[#08111d]/90 px-4 backdrop-blur-xl">
          <div className="flex min-w-[250px] items-center gap-3">
            <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 xl:flex">
              <TeachwiseLogo idSuffix="header" className="h-10 w-10 shrink-0" />
            </div>
            <div className="hidden min-w-0 xl:block">
              <div className="text-[19px] font-semibold leading-none text-white">TeachWise</div>
              <div className="mt-1 text-[13px] text-slate-300">AI for Australian Teachers</div>
            </div>
          </div>

          <div className="flex flex-1 justify-center px-2">
            <div className="flex h-14 min-w-0 w-full max-w-[620px] items-center gap-3 rounded-2xl border border-white/10 bg-[#101824] px-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-slate-300">
                <span className="text-[15px] font-semibold">⌘</span>
                <span className="ml-1 text-[15px] font-semibold">K</span>
              </span>
              <div className="min-w-0 flex-1 text-[15px] text-slate-400">Type a command or search...</div>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <button className="hidden h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-[14px] font-medium text-white lg:inline-flex">
              <Plus className="h-4 w-4 text-[#f7c15d]" />
              Quick Actions
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/8">
                <CalendarDays className="h-4 w-4" />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/8">
                <Bell className="h-4 w-4" />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/8">
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>

            <button className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 pl-1 pr-3 py-1.5 transition hover:bg-white/8">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#f6cf9b] via-[#eb9d74] to-[#b87463] text-sm font-semibold text-[#1a1620]">
                MT
              </div>
              <div className="hidden text-left xl:block">
                <div className="text-[14px] font-semibold text-white">Mrs. Taylor</div>
                <div className="text-[13px] text-slate-300">WA · Year 8 English</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-3">
          <div className="flex h-full min-h-0 flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, ClipboardList, Library, Calendar, CheckSquare, User, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300"
        style={{
          width: collapsed ? 72 : 260,
          minWidth: collapsed ? 72 : 260,
          backgroundColor: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <div className="text-base font-bold text-white">TeachWise</div>
              <div className="text-xs" style={{ color: 'var(--color-accent)' }}>AI Assistant</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 mb-1 ${
                  active
                    ? 'bg-[var(--color-accent)] text-white font-semibold'
                    : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-sidebar-hover)]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-[var(--color-accent)]'}`}
                />
                {!collapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Pro Badge + Collapse Toggle */}
        <div
          className="p-4"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          {!collapsed && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-medium"
              style={{
                backgroundColor: 'var(--color-accent-dim)',
                color: 'var(--color-accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              Pro Plan
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm transition-colors"
            style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <h1 className="text-lg font-semibold text-white">
              {navItems.find((n) => n.href === pathname)?.label || 'TeachWise AI'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-accent-dim)',
                color: 'var(--color-accent)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              Pro Plan
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
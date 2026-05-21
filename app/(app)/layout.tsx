'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, ClipboardList, Library, Calendar, CheckSquare, User, ChevronLeft, ChevronRight } from 'lucide-react';

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
      {/* Sidebar */}
      <aside
        className="app-sidebar flex flex-col transition-all duration-300"
        style={{
          width: collapsed ? 72 : 260,
          minWidth: collapsed ? 72 : 260,
          background: 'linear-gradient(180deg, rgba(10,18,36,0.98), rgba(13,24,48,0.96))',
          borderRight: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          {/* Owl logo SVG */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b2df5 0%, #6366f1 100%)' }}
          >
            <svg width="22" height="22" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="60" cy="72" rx="30" ry="32" fill="white" opacity="0.9"/>
              <ellipse cx="60" cy="78" rx="18" ry="20" fill="white"/>
              <circle cx="46" cy="55" r="14" fill="white"/>
              <circle cx="74" cy="55" r="14" fill="white"/>
              <circle cx="47" cy="55" r="7" fill="#1e1e38"/>
              <circle cx="75" cy="55" r="7" fill="#1e1e38"/>
              <circle cx="49" cy="52" r="3" fill="white"/>
              <circle cx="77" cy="52" r="3" fill="white"/>
              <path d="M56 70 L60 76 L64 70" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round"/>
              <ellipse cx="44" cy="48" rx="5" ry="7" fill="#8b2df5" opacity="0.6"/>
              <ellipse cx="76" cy="48" rx="5" ry="7" fill="#8b2df5" opacity="0.6"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <div className="text-base font-bold text-white">TeachWise</div>
              <div className="text-xs" style={{ color: '#fbbf24' }}>Teacher OS</div>
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

        {/* Collapse Toggle */}
        <div
          className="p-4"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
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
      <main className="app-main flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: 'rgba(18, 26, 47, 0.78)',
            backdropFilter: 'blur(18px)',
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
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
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

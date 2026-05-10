'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/', icon: '◈' },
  { label: 'AI Chat', href: '/chat', icon: '✧' },
  { label: 'Unit Library', href: '/units', icon: '◇' },
  { label: 'Lesson Planner', href: '/planner', icon: '◎' },
  { label: 'Rubric Generator', href: '/rubrics', icon: '◉' },
  { label: 'Auto-Marking', href: '/automark', icon: '◇' },
  { label: 'Worksheet Generator', href: '/worksheets', icon: '◈' },
  { label: 'Writing Feedback', href: '/writing', icon: '✧' },
  { label: 'Behaviour Support', href: '/behaviour', icon: '◎' },
  { label: 'Report Comments', href: '/reports', icon: '◉' },
  { label: 'Profile', href: '/profile', icon: '◈' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r transition-all duration-300"
        style={{
          width: sidebarOpen ? 260 : 72,
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          minWidth: sidebarOpen ? 260 : 72,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            TW
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <div className="text-base font-semibold text-white">TeachWise</div>
              <div className="text-xs" style={{ color: 'var(--accent)' }}>AI Assistant</div>
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
                className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  backgroundColor: active ? 'var(--accent-muted)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="text-base flex-shrink-0" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 rounded-lg text-sm transition-colors"
            style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div>
            <h1 className="text-lg font-medium text-white">
              {navItems.find((n) => n.href === pathname)?.label || 'TeachWise AI'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              Pro Plan
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
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
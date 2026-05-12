'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/', icon: '◈' },
  { label: 'AI Chat', href: '/chat', icon: '✧' },
  { label: 'Rubrics', href: '/rubrics', icon: '◉' },
  { label: 'Unit Library', href: '/units', icon: '◇' },
  { label: 'Lesson Planner', href: '/planner', icon: '◎' },
  { label: 'Auto-Marking', href: '/automark', icon: '◈' },
  { label: 'Profile', href: '/profile', icon: '◈' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - Deep Navy */}
      <aside
        className="flex flex-col border-r border-slate-200 bg-[#1E3A5F] transition-all duration-300 shadow-lg"
        style={{
          width: sidebarOpen ? 260 : 72,
          minWidth: sidebarOpen ? 260 : 72,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img 
            src="/owl-mascot.png" 
            alt="TeachWise" 
            className="w-10 h-10 flex-shrink-0 rounded-xl shadow-sm object-contain"
          />
          {sidebarOpen && (
            <div className="animate-fade-in">
              <div className="text-base font-bold text-white">TeachWise</div>
              <div className="text-xs text-emerald-300">AI Assistant</div>
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
                className={`flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 mb-1 ${
                  active
                    ? 'bg-emerald-500 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`text-base flex-shrink-0 ${active ? 'text-white' : 'text-emerald-300'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
          >
            {sidebarOpen ? '◀ Collapse' : '▶ Expand'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {navItems.find((n) => n.href === pathname)?.label || 'TeachWise AI'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pro Plan
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-sm font-bold text-white">
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
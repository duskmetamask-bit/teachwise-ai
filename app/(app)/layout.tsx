'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/', icon: '◈' },
  { label: 'AI Chat', href: '/chat', icon: '✧' },
  { label: 'Unit Library', href: '/units', icon: '◇' },
  { label: 'Lesson Planner', href: '/planner', icon: '◎' },
  { label: 'Auto-Marking', href: '/automark', icon: '◉' },
  { label: 'Profile', href: '/profile', icon: '◈' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1117]">
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r border-[#30363D] bg-[#0D1117] transition-all duration-300"
        style={{
          width: sidebarOpen ? 260 : 72,
          minWidth: sidebarOpen ? 260 : 72,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#30363D]">
          <div className="w-9 h-9 rounded-lg bg-[#00D4AA] flex items-center justify-center text-base font-bold text-[#0D1117] flex-shrink-0">
            TW
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <div className="text-base font-semibold text-white">TeachWise</div>
              <div className="text-xs text-[#00D4AA]">AI Assistant</div>
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
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? 'bg-[#00D4AA]/10 text-[#00D4AA] font-medium'
                    : 'text-[#8B949E] hover:bg-[#161B22] hover:text-white'
                }`}
              >
                <span className={`text-base flex-shrink-0 ${active ? 'text-[#00D4AA]' : 'text-[#6E7681]'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-[#30363D]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 rounded-lg text-sm text-[#6E7681] bg-[#161B22] hover:text-white transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363D] bg-[#161B22]">
          <div>
            <h1 className="text-lg font-medium text-white">
              {navItems.find((n) => n.href === pathname)?.label || 'TeachWise AI'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[#00D4AA]/10 text-[#00D4AA]">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              Pro Plan
            </div>
            <div className="w-8 h-8 rounded-full bg-[#00D4AA] flex items-center justify-center text-sm font-medium text-[#0D1117]">
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

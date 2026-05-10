'use client';

import Link from 'next/link';

const quickActions = [
  {
    label: 'Lesson Planner',
    href: '/planner',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    desc: 'Generate AC9-aligned lesson plans',
    color: '#00D4AA',
  },
  {
    label: 'Unit Library',
    href: '/units',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    desc: 'Browse 100s of ready-to-use units',
    color: '#8B5CF6',
  },
  {
    label: 'Rubric Generator',
    href: '/rubrics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: 'Create detailed assessment rubrics',
    color: '#F59E0B',
  },
  {
    label: 'Auto-Marking',
    href: '/automark',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    desc: 'Upload work, get instant feedback',
    color: '#EF4444',
  },
];

const recentActivity = [
  { type: 'chat', text: 'Generated lesson plan for Year 4 Fractions', time: '2 hours ago', icon: '✧' },
  { type: 'rubric', text: 'Created rubric for Year 5 Persuasive Writing', time: 'Yesterday', icon: '◉' },
  { type: 'unit', text: 'Viewed Unit: Earth\'s Living History', time: '2 days ago', icon: '◇' },
  { type: 'worksheet', text: 'Generated Worksheet: Multiplication Word Problems', time: '3 days ago', icon: '◎' },
];

const features = [
  {
    title: 'AI-Powered Lesson Plans',
    desc: 'Generate comprehensive AC9-aligned lesson plans in seconds with intelligent content suggestions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: '#00D4AA',
  },
  {
    title: 'Smart Assessment Tools',
    desc: 'Create rubrics, auto-mark student work, and generate personalized feedback effortlessly',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: '#8B5CF6',
  },
  {
    title: 'Behavior Support',
    desc: 'Access de-escalation strategies, behavior tracking tools, and restorative practice templates',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: '#EF4444',
  },
];

const stats = [
  { label: 'Units Created', value: '24', icon: '◇' },
  { label: 'Rubrics Built', value: '18', icon: '◉' },
  { label: 'Worksheets Generated', value: '42', icon: '◎' },
  { label: 'Students Assisted', value: '156', icon: '◈' },
];

const tips = [
  'Use the Auto-Marking tool to save hours on feedback. Upload a rubric and student work for instant criterion-by-criterion analysis.',
  'Try the Writing Feedback tool with your Year 5-6 students. It provides growth-focused feedback on narrative and persuasive texts.',
  'The Report Comments generator creates AC9-aligned comments in seconds. Select effort level and get personalised feedback instantly.',
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-[#30363D] bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] p-8 md:p-12">
        {/* Background Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4AA]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/20">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              <span className="text-xs text-[#00D4AA] font-medium">AI-Powered Teaching Assistant</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              <span className="text-white">Build better lessons, </span>
              <span className="bg-gradient-to-r from-[#00D4AA] to-[#8B5CF6] bg-clip-text text-transparent">faster.</span>
            </h1>
            <p className="text-lg text-[#8B949E] leading-relaxed">
              Generate AC9-aligned lesson plans, rubrics, worksheets, and teaching resources in seconds. Let AI handle the paperwork so you can focus on what matters — teaching.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/planner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00D4AA] text-[#0D1117] font-semibold hover:bg-[#00E4BA] transition-all duration-200 shadow-lg shadow-[#00D4AA]/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Lesson Plan
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#30363D] bg-[#161B22] text-white font-medium hover:bg-[#1C2128] hover:border-[#00D4AA]/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Ask AI Assistant
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00D4AA]/20 via-transparent to-[#8B5CF6]/20 rounded-2xl" />
            <div className="relative bg-[#161B22]/80 backdrop-blur-xl rounded-2xl border border-[#30363D] p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[#30363D]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#00D4AA]/60 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0D1117]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">TeachWise AI</div>
                  <div className="text-xs text-[#8B949E]">Online • Ready to help</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00D4AA]/20 flex items-center justify-center text-[#00D4AA] text-sm">✧</div>
                  <div className="flex-1 p-3 rounded-xl rounded-tl-none bg-[#1C2128] border border-[#30363D]">
                    <p className="text-sm text-[#E6EDF3]">I&apos;ve prepared a Year 4 Fractions lesson plan aligned with AC9MFN04. Would you like me to add differentiation strategies?</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 p-3 rounded-xl rounded-tr-none bg-[#00D4AA]/10 border border-[#00D4AA]/30">
                    <p className="text-sm text-[#E6EDF3]">Yes, add extension tasks for advanced learners</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#8B949E]/20 flex items-center justify-center text-[#8B949E] text-sm">JD</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00D4AA]/20 flex items-center justify-center text-[#00D4AA] text-sm">✧</div>
                  <div className="flex-1 p-3 rounded-xl rounded-tl-none bg-[#1C2128] border border-[#30363D]">
                    <p className="text-sm text-[#E6EDF3]">Done! I&apos;ve added tiered extension tasks including real-world fraction problems and a challenge problem for your high achievers.</p>
                    <div className="mt-3 p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                      <p className="text-xs text-[#8B949E] mb-1">Lesson Plan • Year 4 Fractions</p>
                      <p className="text-xs text-[#00D4AA]">✓ AC9MFN04 aligned • ✓ Differentiated • ✓ Ready to use</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22] p-5 hover:border-[#00D4AA]/50 transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#00D4AA]/5 rounded-full blur-2xl group-hover:bg-[#00D4AA]/10 transition-all duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#00D4AA]">{stat.icon}</span>
                <span className="text-xs text-[#8B949E] font-medium">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22] p-6 hover:border-[#30363D] hover:shadow-lg hover:shadow-[#00D4AA]/5 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4AA]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[#00D4AA] transition-colors duration-200">{feature.title}</h3>
                <p className="text-sm text-[#8B949E] leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22] p-5 hover:border-[#00D4AA]/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00D4AA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: `${action.color}20`, color: action.color }}
                >
                  {action.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-1 group-hover:text-[#00D4AA] transition-colors duration-200">{action.label}</div>
                  <div className="text-xs text-[#8B949E]">{action.desc}</div>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-6">
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-center text-[#00D4AA] text-sm flex-shrink-0 group-hover:border-[#00D4AA]/50 transition-colors duration-200">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{item.text}</div>
                  <div className="text-xs text-[#8B949E]">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="rounded-xl border border-[#00D4AA]/30 bg-gradient-to-br from-[#161B22] to-[#0D1117] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4AA]/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#00D4AA]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white">Teaching Tips</h3>
            </div>
            <div className="space-y-4">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00D4AA]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#00D4AA] text-xs">✦</span>
                  </div>
                  <p className="text-sm text-[#8B949E] leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-[#30363D]">
        <p className="text-xs text-[#8B949E]">TeachWise AI • Empowering Australian teachers with AI</p>
      </div>
    </div>
  );
}
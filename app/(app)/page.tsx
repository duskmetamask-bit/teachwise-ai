import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ClipboardList,
  FileText,
  LayoutGrid,
  MoreVertical,
  Paperclip,
  PanelRightOpen,
  Plus,
  Search,
  Send,
  Settings2,
  Share2,
  Sparkles,
  Star,
  SlidersHorizontal,
  Target,
  Wand2,
} from 'lucide-react';
import TeachwiseLogo from '@/app/components/TeachwiseLogo';

const focusPills = [
  { label: 'Year 8', icon: LayoutGrid, tone: '#14b8a6' },
  { label: 'English', icon: BookOpen, tone: '#f7c15d' },
  { label: 'WA Curriculum', icon: Target, tone: '#f59e0b' },
  { label: 'Context', icon: SlidersHorizontal, tone: '#93c5fd' },
];

const quickActions = [
  { label: 'Lesson Plan', icon: FileText },
  { label: 'Worksheet', icon: ClipboardIcon },
  { label: 'Assessment', icon: CheckCircle2 },
  { label: 'Unit Plan', icon: BookOpen },
  { label: 'More', icon: MoreVertical },
];

const actionChips = ['Refine', 'Add Differentiation', 'Make it WA Curriculum aligned', 'Add Assessment Ideas'];

const flowItems = [
  { time: '8:30 AM', title: 'English - Yr 8', subtitle: 'Persuasive Writing', tone: '#22d3ee' },
  { time: '10:30 AM', title: 'Class Check-in', subtitle: '', tone: '#f7c15d' },
  { time: '11:15 AM', title: 'Create Worksheet', subtitle: 'Figurative Language', tone: '#22d3ee', badge: 'Draft' },
  { time: '1:00 PM', title: 'Read & Respond', subtitle: 'Assessment', tone: '#f7c15d' },
];

const smartActions = [
  { icon: Wand2, label: 'Differentiation Ideas' },
  { icon: CheckCircle2, label: 'Generate Quiz' },
  { icon: Target, label: 'Add Literacy Focus' },
  { icon: FileText, label: 'Create Rubric' },
  { icon: BookOpen, label: 'Shorten Text' },
  { icon: ArrowRight, label: 'Expand on Ideas' },
];

const snippets = [
  'PEEL Paragraph Frame',
  'Figurative Language Bank',
  'Literacy Sentence Starters',
];

function ClipboardIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={props.className} aria-hidden="true">
      <path d="M9 4.75h6a2.25 2.25 0 0 1 2.25 2.25V20a1.25 1.25 0 0 1-1.25 1.25H8A1.25 1.25 0 0 1 6.75 20V7A2.25 2.25 0 0 1 9 4.75Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4.75A2.25 2.25 0 0 1 11.25 2.5h1.5A2.25 2.25 0 0 1 15 4.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.5 10.25h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.5 13.75h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <section className="flex flex-wrap items-center gap-3">
        {focusPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.label}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-[14px] font-medium text-slate-100 transition hover:bg-white/8"
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <Icon className="h-4 w-4" style={{ color: pill.tone }} />
              </span>
              {pill.label}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          );
        })}
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/8">
          <Settings2 className="h-4 w-4" />
        </button>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,1.18fr)_306px]">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="px-1 pt-1">
            <h2 className="text-[32px] font-semibold tracking-tight text-white">Good afternoon, Mrs. Taylor. <span className="text-[#f7c15d]">✦</span></h2>
            <p className="mt-3 text-[18px] text-slate-300">What would you like to create today?</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickActions.map((item) => {
              const Icon = item.icon;
              const active = item.label === 'Lesson Plan';
              return (
                <button
                  key={item.label}
                  className={`inline-flex h-12 items-center gap-3 rounded-2xl border px-4 text-[14px] font-medium transition ${
                    active
                      ? 'border-white/10 bg-white/7 text-white shadow-[0_16px_50px_rgba(0,0,0,0.22)]'
                      : 'border-white/10 bg-white/4 text-slate-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-[#f7c15d]' : 'text-slate-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-[26px] border border-white/8 bg-[#0d1624]/80 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#254567] text-[15px] font-semibold text-[#bcd5ff]">
                  MT
                </div>
                <p className="max-w-2xl text-[18px] leading-8 text-slate-200">
                  Create a Year 8 English lesson plan on persuasive writing using advertisements as mentor texts. Include a warm-up, lesson sequence, differentiation and success criteria.
                </p>
              </div>
            </div>

            <div className="my-5 border-t border-white/8" />

            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                  <TeachwiseLogo idSuffix="page" className="h-10 w-10 shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] leading-8 text-slate-200">
                    Certainly! Here&apos;s a comprehensive lesson plan for Year 8 English focusing on persuasive writing using advertisements as mentor texts.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button className="inline-flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#141d2d] px-4 text-[14px] font-medium text-white transition hover:bg-[#182437]">
                      <FileText className="h-4 w-4 text-[#c4a6ff]" />
                      Year 8 English - Persuasive Writing Lesson Plan
                      <span className="text-[#f7c15d]">Draft</span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {actionChips.map((chip) => (
                <button key={chip} className="inline-flex h-10 items-center rounded-xl border border-white/8 bg-white/[0.04] px-4 text-[13px] font-medium text-slate-200 transition hover:bg-white/[0.08]">
                  {chip}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-5">
              <div className="rounded-[22px] border border-white/8 bg-[#101824] px-4 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-3 text-[15px] text-slate-400">
                  <span className="text-slate-500">Ask anything... (Shift + Enter for new line)</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] transition hover:bg-white/[0.08]">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] transition hover:bg-white/[0.08]">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 text-[13px] font-medium transition hover:bg-white/[0.08]">
                      <Sparkles className="h-4 w-4 text-[#37d4e8]" />
                      AI Focus
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                  <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#37c7d9] text-[#06212a] transition hover:brightness-110">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-[26px] border border-white/8 bg-[#0d1624]/80 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[14px] text-slate-200">
                <span className="truncate">Year 8 English - Persuasive Writing Lesson Plan</span>
                <span className="inline-flex items-center gap-1 text-[#37d4e8]">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] transition hover:bg-white/[0.08]">
                <Star className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] transition hover:bg-white/[0.08]">
                <Copy className="h-4 w-4" />
              </button>
              <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 text-[13px] font-medium transition hover:bg-white/[0.08]">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-[#37c7d9] px-3 text-[13px] font-semibold text-[#052029] transition hover:brightness-110">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] transition hover:bg-white/[0.08]">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-white/8 px-5">
            <div className="flex items-center gap-7 text-[14px]">
              {['Output', 'Notes', 'Curriculum', 'Resources'].map((tab, index) => (
                <button
                  key={tab}
                  className={`relative py-4 font-medium transition ${index === 0 ? 'text-[#37d4e8]' : 'text-slate-300 hover:text-white'}`}
                >
                  {tab}
                  {index === 0 && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#37d4e8]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="max-w-2xl">
              <h3 className="text-[28px] font-semibold leading-tight text-[#37d4e8]">Lesson Plan: Persuasive Writing Using Advertisements</h3>
              <p className="mt-2 text-[18px] text-slate-300">Year 8 English - Western Australia</p>

              <div className="mt-6 space-y-7 text-[15px] leading-7 text-slate-200">
                <section>
                  <div className="mb-3 flex items-center gap-2 text-[#f7c15d]">
                    <Target className="h-5 w-5" />
                    <h4 className="text-[18px] font-semibold text-white">Learning Intention</h4>
                  </div>
                  <p>We are learning to write persuasive texts using techniques found in advertisements.</p>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2 text-[#f7c15d]">
                    <CheckCircle2 className="h-5 w-5" />
                    <h4 className="text-[18px] font-semibold text-white">Success Criteria</h4>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex gap-3"><span className="mt-3 h-2 w-2 rounded-full bg-slate-400" />I can identify persuasive techniques in advertisements.</li>
                    <li className="flex gap-3"><span className="mt-3 h-2 w-2 rounded-full bg-slate-400" />I can plan and write a persuasive text using strong language and evidence.</li>
                    <li className="flex gap-3"><span className="mt-3 h-2 w-2 rounded-full bg-slate-400" />I can edit my writing for clarity and impact.</li>
                  </ul>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2 text-[#f7c15d]">
                    <ClipboardList className="h-5 w-5" />
                    <h4 className="text-[18px] font-semibold text-white">Lesson Sequence</h4>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <p className="font-semibold text-white">1. Warm-up (10 mins)</p>
                      <ul className="mt-2 space-y-2">
                        <li className="flex gap-3"><span className="mt-3 h-2 w-2 rounded-full bg-slate-400" />Show 2-3 print or digital ads.</li>
                        <li className="flex gap-3"><span className="mt-3 h-2 w-2 rounded-full bg-slate-400" />Discuss: What makes these ads persuasive? (Language, images, slogans, emotion, call to action)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white">2. Explicit Teaching (15 mins)</p>
                      <ul className="mt-2 space-y-2">
                        <li className="flex gap-3"><span className="mt-3 h-2 w-2 rounded-full bg-slate-400" />Introduce persuasive techniques: emotive language, rhetorical questions, statistics, repetition, exaggeration.</li>
                        <li className="flex gap-3"><span className="mt-3 h-2 w-2 rounded-full bg-slate-400" />Analyse an advertisement as a class.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white">3. Guided Practice (20 mins)</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <div className="rounded-[26px] border border-white/8 bg-[#0d1624]/80 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold text-white">Today&apos;s Flow</div>
                <div className="text-[13px] text-slate-400">Fri 23 May</div>
              </div>
              <CalendarDays className="h-5 w-5 text-[#f7c15d]" />
            </div>
            <div className="space-y-3">
              {flowItems.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-2xl bg-white/[0.04] p-3">
                  <div className="flex flex-col items-center pt-1">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.tone }} />
                    <span className="mt-1 h-full w-px bg-white/10" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-slate-400">{item.time}</div>
                    <div className="mt-1 text-[14px] font-medium text-white">{item.title}</div>
                    {item.subtitle ? <div className="text-[13px] text-slate-400">{item.subtitle}</div> : null}
                    {item.badge ? <div className="mt-2 inline-flex rounded-full border border-white/10 px-2.5 py-0.5 text-[12px] text-slate-300">{item.badge}</div> : null}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/8 bg-[#101824] text-[14px] font-medium text-slate-200 transition hover:bg-[#162033]">
              View Full Planner
            </button>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-[#0d1624]/80 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
            <div className="mb-3 flex items-center gap-2 text-[18px] font-semibold text-white">
              <Sparkles className="h-5 w-5 text-[#37d4e8]" />
              Smart Actions
            </div>
            <div className="space-y-2">
              {smartActions.map((item) => (
                <button key={item.label} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[14px] text-slate-200 transition hover:bg-white/[0.05]">
                  <item.icon className="h-4 w-4 text-[#37d4e8]" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-[#0d1624]/80 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[18px] font-semibold text-white">Recent Snippets</div>
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-2">
              {snippets.map((snippet) => (
                <button key={snippet} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[14px] text-slate-200 transition hover:bg-white/[0.05]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] text-[#f7c15d]">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  {snippet}
                </button>
              ))}
            </div>
            <button className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/8 bg-[#101824] text-[14px] font-medium text-slate-200 transition hover:bg-[#162033]">
              View All Snippets
            </button>
          </div>
        </aside>
      </section>

      <section className="flex items-center justify-between gap-4 border-t border-white/8 pt-3 text-[12px] text-slate-400">
        <div className="flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2"><span className="text-slate-500">⌘K</span> Command bar</span>
          <span className="inline-flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5" /> Shortcuts</span>
          <span className="inline-flex items-center gap-2"><PanelRightOpen className="h-3.5 w-3.5" /> Drag to resize panels</span>
          <span className="inline-flex items-center gap-2"><Download className="h-3.5 w-3.5" /> Save output</span>
        </div>
      </section>
    </div>
  );
}

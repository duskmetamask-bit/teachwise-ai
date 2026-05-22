'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import {
  Search,
  Download,
  Copy,
  Trash2,
  Library,
  FileText,
  Sparkles,
  BookOpen,
  Clock3,
  Layers3,
  BadgeCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { mockUnits } from '@/app/lib/mockData';
import { loadUnits, saveUnits, recordActivity, makeId } from '@/app/lib/teachwise-store';
import type { UnitPlan } from '@/app/lib/types';
import { exportTeachWiseDocx, exportTeachWisePptx, exportTeachWisePdf } from '@/app/lib/exporters';

const subjects = ['All Subjects', 'Mathematics', 'English', 'Science', 'Humanities & Social Sciences', 'Digital Technologies', 'Health & Physical Education'];
const yearLevels = ['All Years', 'Year F', 'Year PP', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const EMPTY_UNITS: UnitPlan[] = [];

const subjectThemes: Record<string, { accent: string; accentSoft: string; border: string; wash: string }> = {
  Mathematics: { accent: '#4dd0c4', accentSoft: 'rgba(77,208,196,0.12)', border: 'rgba(77,208,196,0.22)', wash: 'rgba(77,208,196,0.08)' },
  English: { accent: '#7cb7ff', accentSoft: 'rgba(124,183,255,0.12)', border: 'rgba(124,183,255,0.22)', wash: 'rgba(124,183,255,0.08)' },
  Science: { accent: '#f4c26a', accentSoft: 'rgba(244,194,106,0.12)', border: 'rgba(244,194,106,0.22)', wash: 'rgba(244,194,106,0.08)' },
  'Humanities & Social Sciences': { accent: '#c58bff', accentSoft: 'rgba(197,139,255,0.12)', border: 'rgba(197,139,255,0.22)', wash: 'rgba(197,139,255,0.08)' },
  'Digital Technologies': { accent: '#60f0c2', accentSoft: 'rgba(96,240,194,0.12)', border: 'rgba(96,240,194,0.22)', wash: 'rgba(96,240,194,0.08)' },
  'Health & Physical Education': { accent: '#ff8db7', accentSoft: 'rgba(255,141,183,0.12)', border: 'rgba(255,141,183,0.22)', wash: 'rgba(255,141,183,0.08)' },
};

function getSubjectTheme(subject: string) {
  return subjectThemes[subject] || {
    accent: 'var(--color-accent)',
    accentSoft: 'rgba(77,208,196,0.12)',
    border: 'rgba(77,208,196,0.22)',
    wash: 'rgba(77,208,196,0.08)',
  };
}

function sortByUpdated(a: UnitPlan, b: UnitPlan) {
  return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
}

function countUnique(values: string[]) {
  return new Set(values).size;
}

function statBlock({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-3 shadow-[0_16px_48px_rgba(2,8,23,0.18)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{hint}</div>}
    </div>
  );
}

function UnitCard({
  unit,
  selected,
  onSelect,
}: {
  unit: UnitPlan;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const theme = getSubjectTheme(unit.subject);
  return (
    <button
      type="button"
      onClick={() => onSelect(unit.id)}
      className={`group relative overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-200 ${
        selected
          ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(2,8,23,0.34)]'
          : 'border-white/10 bg-white/[0.035] shadow-[0_18px_60px_rgba(2,8,23,0.18)] hover:bg-white/[0.05]'
      }`}
      style={{
        borderColor: selected ? theme.border : undefined,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: selected ? `linear-gradient(90deg, ${theme.accent}, rgba(124,183,255,0.85))` : `linear-gradient(90deg, ${theme.accentSoft}, transparent)` }} />
      <div className="absolute right-4 top-4 text-5xl font-semibold tracking-tight" style={{ color: theme.accent, opacity: 0.08 }}>
        {unit.subject
          .split(' ')
          .map((part) => part[0])
          .slice(0, 2)
          .join('')}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: theme.border, backgroundColor: theme.wash, color: theme.accent }}>
              {unit.subject}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--color-text-muted)' }}>
              {unit.yearLevel}
            </span>
          </div>
          <h3 className="text-base font-semibold tracking-tight text-white">{unit.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
            {unit.description}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[var(--color-text-muted)] group-hover:text-white" style={{ borderColor: theme.border }}>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2" style={{ borderColor: theme.border }}>
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
            Duration
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{unit.duration}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2" style={{ borderColor: theme.border }}>
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
            Lessons
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{unit.lessons}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2" style={{ borderColor: theme.border }}>
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
            AC9
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{unit.ac9Codes.length}</div>
        </div>
      </div>
    </button>
  );
}

function UnitDetail({
  unit,
  onExport,
  onDuplicate,
  onDelete,
}: {
  unit: UnitPlan;
  onExport: (type: 'docx' | 'pptx' | 'pdf') => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const theme = getSubjectTheme(unit.subject);
  return (
    <div className="teachwise-panel overflow-hidden rounded-[28px]">
      <div
        className="border-b border-white/10 px-5 py-4"
        style={{
          background: `linear-gradient(180deg, ${theme.wash}, rgba(255,255,255,0.03))`,
        }}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: theme.border, backgroundColor: theme.wash, color: theme.accent }}>
            {unit.subject}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--color-text-muted)' }}>
            {unit.yearLevel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--color-warning)' }}>
            Ready to export
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-[2rem]">{unit.title}</h2>
        <p className="mt-2 text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
          {unit.description}
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {statBlock({ label: 'Duration', value: unit.duration, hint: 'Scope at a glance' })}
          {statBlock({ label: 'Lessons', value: String(unit.lessons), hint: 'Lesson count in the unit' })}
          {statBlock({ label: 'AC9 codes', value: String(unit.ac9Codes.length), hint: 'Curriculum alignment' })}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
            <BadgeCheck className="h-3.5 w-3.5" />
            Outcomes
          </div>
          <div className="flex flex-wrap gap-2">
            {unit.outcomes.map((code) => (
              <span key={code} className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: theme.border, backgroundColor: theme.wash, color: theme.accent }}>
                {code}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4" style={{ borderColor: theme.border }}>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
              <BookOpen className="h-3.5 w-3.5" />
              Overview
            </div>
            <p className="text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              {unit.overview || unit.description}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4" style={{ borderColor: theme.border }}>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
              <Layers3 className="h-3.5 w-3.5" />
              Assessment
            </div>
            <p className="text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              {unit.assessment || 'Assessment details can be refined after opening the unit.'}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[rgba(2,8,23,0.38)] p-4" style={{ borderColor: theme.border }}>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
            <Clock3 className="h-3.5 w-3.5" />
            Unit content
          </div>
          <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
            {unit.content}
          </pre>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={() => onExport('docx')} className="export-chip">
            <FileText className="h-3.5 w-3.5" />
            DOCX
          </button>
          <button onClick={() => onExport('pptx')} className="export-chip">
            <Download className="h-3.5 w-3.5" />
            PPTX
          </button>
          <button onClick={() => onExport('pdf')} className="export-chip">
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
          <button onClick={onDuplicate} className="export-chip">
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </button>
          <button onClick={onDelete} className="export-chip" style={{ color: 'var(--color-danger)' }}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UnitsPage() {
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const savedUnits = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      window.addEventListener('teachwise-storage', callback);
      return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener('teachwise-storage', callback);
      };
    },
    () => loadUnits(),
    () => EMPTY_UNITS
  );

  const units = useMemo(() => {
    const library = savedUnits.length > 0 ? savedUnits : mockUnits;
    return [...library].sort(sortByUpdated);
  }, [savedUnits]);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchSubject = selectedSubject === 'All Subjects' || unit.subject === selectedSubject;
      const matchYear = selectedYear === 'All Years' || unit.yearLevel === selectedYear;
      const matchSearch =
        !search ||
        unit.title.toLowerCase().includes(search.toLowerCase()) ||
        unit.topic.toLowerCase().includes(search.toLowerCase()) ||
        unit.description.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchYear && matchSearch;
    });
  }, [selectedSubject, selectedYear, search, units]);

  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return filteredUnits[0] || units[0] || null;
    return units.find((unit) => unit.id === selectedUnitId) || filteredUnits[0] || units[0] || null;
  }, [filteredUnits, selectedUnitId, units]);

  const save = (next: UnitPlan[]) => {
    saveUnits(next);
  };

  const selectedUnitExportContent = selectedUnit
    ? {
        title: selectedUnit.title,
        subtitle: `${selectedUnit.subject} · ${selectedUnit.yearLevel} · ${selectedUnit.duration}`,
        sections: [
          { title: 'Overview', body: selectedUnit.overview || selectedUnit.description || '(No overview yet)' },
          { title: 'Unit content', body: selectedUnit.content || '(No content yet)' },
          { title: 'AC9 outcomes', bullets: selectedUnit.outcomes.length ? selectedUnit.outcomes : ['(No outcomes listed yet)'] },
          { title: 'Assessment', body: selectedUnit.assessment || '(No assessment details yet)' },
        ],
      }
    : null;

  const handleExport = async (type: 'docx' | 'pptx' | 'pdf') => {
    if (!selectedUnitExportContent || !selectedUnit) return;
    if (type === 'docx') {
      await exportTeachWiseDocx(selectedUnitExportContent);
    } else if (type === 'pptx') {
      await exportTeachWisePptx(selectedUnitExportContent);
    } else {
      await exportTeachWisePdf(selectedUnitExportContent);
    }
    recordActivity({
      type: 'exported',
      title: 'Unit exported',
      detail: `${selectedUnitExportContent.title} · ${type.toUpperCase()}`,
      minutesReclaimed: 0,
    });
  };

  const duplicateUnit = (unit: UnitPlan) => {
    const duplicate: UnitPlan = {
      ...unit,
      id: makeId(),
      title: `${unit.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const next = [duplicate, ...savedUnits.filter((item) => item.id !== unit.id)];
    save(next);
    setSelectedUnitId(duplicate.id);
    recordActivity({
      type: 'unit_saved',
      title: 'Unit duplicated',
      detail: duplicate.title,
      minutesReclaimed: 10,
    });
  };

  const deleteUnit = (id: string) => {
    const next = savedUnits.filter((item) => item.id !== id);
    save(next);
    setSelectedUnitId(null);
    recordActivity({
      type: 'unit_saved',
      title: 'Unit deleted',
      detail: id,
      minutesReclaimed: 0,
    });
  };

  const activeSubjects = countUnique(units.map((unit) => unit.subject));
  const activeYears = countUnique(units.map((unit) => unit.yearLevel));
  const activeAc9 = countUnique(units.flatMap((unit) => unit.ac9Codes));
  return (
    <div className="animate-fade-in space-y-5">
      <div className="app-toolbar rounded-[32px] p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-[rgba(77,208,196,0.18)] bg-[rgba(77,208,196,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-accent)' }}>
              <Library className="h-3.5 w-3.5" />
              Unit Library
            </div>
            <h2 className="max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
              A crisp, high-trust library for the units teachers actually reach for.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
              Search, open, duplicate, refine, and export units in one place. The surfaces stay calm, the typography stays sharp, and the work stays easy to scan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="export-chip">
              <Sparkles className="h-3.5 w-3.5" />
              {filteredUnits.length} visible
            </span>
            <span className="export-chip">
              <Filter className="h-3.5 w-3.5" />
              {units.length} saved
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {statBlock({ label: 'Saved units', value: String(units.length), hint: 'Library total' })}
          {statBlock({ label: 'Subjects', value: String(activeSubjects), hint: 'Across the library' })}
          {statBlock({ label: 'Year levels', value: String(activeYears), hint: 'Ready to filter' })}
          {statBlock({ label: 'AC9 codes', value: String(activeAc9), hint: 'Unique codes in play' })}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
        <div className="grid gap-3 xl:grid-cols-[1.25fr_0.35fr_0.35fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search units, topics, or descriptions"
              className="input-dark h-12 rounded-2xl pl-11 text-sm"
            />
          </div>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-dark h-12 rounded-2xl text-sm">
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="input-dark h-12 rounded-2xl text-sm">
            {yearLevels.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="space-y-4">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-muted)' }}>
              Library results
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {filteredUnits.length} units ready to open, duplicate, or export.
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {filteredUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                selected={selectedUnit?.id === unit.id}
                onSelect={setSelectedUnitId}
              />
            ))}
          </div>
        </div>

        <div className="hidden xl:block">
          {selectedUnit ? (
            <div className="sticky top-6">
              <UnitDetail
                unit={selectedUnit}
                onExport={(type) => void handleExport(type)}
                onDuplicate={() => duplicateUnit(selectedUnit)}
                onDelete={() => deleteUnit(selectedUnit.id)}
              />
            </div>
          ) : (
            <div className="teachwise-panel rounded-[28px] p-6 text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              Select a unit to open its details, export options, and assessment notes.
            </div>
          )}
        </div>
      </div>

      <div className="xl:hidden">
        {selectedUnit ? (
          <UnitDetail
            unit={selectedUnit}
            onExport={(type) => void handleExport(type)}
            onDuplicate={() => duplicateUnit(selectedUnit)}
            onDelete={() => deleteUnit(selectedUnit.id)}
          />
        ) : (
          <div className="teachwise-panel rounded-[28px] p-5 text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
            Select a unit to see the export-ready detail view.
          </div>
        )}
      </div>
    </div>
  );
}

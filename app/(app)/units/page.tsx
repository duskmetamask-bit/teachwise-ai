'use client';

import { useState } from 'react';
import { mockUnits } from '@/app/lib/mockData';
import { UnitPlan, SavedPlan } from '@/app/lib/types';
import { Search, X, FileText, Download } from 'lucide-react';

const STORAGE_KEY = 'teachwise_saved_plans';
const subjects = ['All Subjects', 'Mathematics', 'English', 'Science', 'Humanities & Social Sciences', 'Digital Technologies', 'Health & Physical Education'];
const yearLevels = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];

function savedPlanToUnit(plan: SavedPlan): UnitPlan {
  return {
    id: plan.id,
    title: plan.title,
    subject: plan.subject,
    yearLevel: plan.yearLevel,
    topic: plan.topic,
    description: `Saved on ${plan.dateSaved}`,
    duration: 'Custom',
    lessons: 1,
    overview: '',
    content: plan.rawContent,
    ac9Codes: plan.ac9Codes,
    outcomes: plan.ac9Codes,
    createdAt: new Date(plan.dateSaved),
  };
}

function loadSavedPlans(): SavedPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function UnitsPage() {
  const initialSavedPlans = loadSavedPlans();
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedUnit, setSelectedUnit] = useState<UnitPlan | null>(null);
  const [search, setSearch] = useState('');
  const [savedPlans] = useState<SavedPlan[]>(initialSavedPlans);
  const [units] = useState<UnitPlan[]>(() => [...mockUnits, ...initialSavedPlans.map(savedPlanToUnit)]);

  const filtered = units.filter((u) => {
    const matchSubject = selectedSubject === 'All Subjects' || u.subject === selectedSubject;
    const matchYear = selectedYear === 'All Years' || u.yearLevel === selectedYear;
    const matchSearch = !search || u.topic.toLowerCase().includes(search.toLowerCase()) || u.description.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchYear && matchSearch;
  });

  const totalCount = savedPlans.length + mockUnits.length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Unit Library</h2>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {totalCount} unit plans ready to use
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search units..."
            className="input-dark pl-10"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input-dark"
          style={{ width: 'auto' }}
        >
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="input-dark"
          style={{ width: 'auto' }}
        >
          {yearLevels.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Unit Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((unit) => (
          <div
            key={unit.id}
            onClick={() => setSelectedUnit(unit)}
            className="p-5 rounded-2xl cursor-pointer transition-all duration-200"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
              >
                {unit.subject}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}
              >
                {unit.yearLevel}
              </span>
            </div>
            <h3 className="text-sm font-medium text-white mb-2">{unit.topic}</h3>
            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
              {unit.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{unit.duration}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>View Unit →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6 z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSelectedUnit(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
                >
                  {selectedUnit.subject}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}
                >
                  {selectedUnit.yearLevel}
                </span>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{selectedUnit.topic}</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{selectedUnit.description}</p>
            <div className="mb-4">
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-accent)' }}>AC9 Outcomes</div>
              <div className="flex flex-wrap gap-2">
                {selectedUnit.outcomes.map((o) => (
                  <span key={o} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}>
                    {o}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-sm whitespace-pre-wrap mb-6" style={{ color: 'var(--color-text)' }}>
              {selectedUnit.content}
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              >
                <Download className="w-4 h-4" />
                Export as PDF
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border flex items-center justify-center gap-2"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <FileText className="w-4 h-4" />
                Export as DOCX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

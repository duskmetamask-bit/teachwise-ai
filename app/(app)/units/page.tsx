'use client';

import { useState } from 'react';
import { mockUnits } from '@/app/lib/mockData';
import { UnitPlan } from '@/app/lib/types';

const subjects = ['All Subjects', 'Mathematics', 'English', 'Science', 'Humanities & Social Sciences', 'Digital Technologies', 'Health & Physical Education'];
const yearLevels = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];

export default function UnitsPage() {
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedUnit, setSelectedUnit] = useState<UnitPlan | null>(null);
  const [search, setSearch] = useState('');

  const filtered = mockUnits.filter((u) => {
    const matchSubject = selectedSubject === 'All Subjects' || u.subject === selectedSubject;
    const matchYear = selectedYear === 'All Years' || u.yearLevel === selectedYear;
    const matchSearch = !search || u.topic.toLowerCase().includes(search.toLowerCase()) || u.description.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchYear && matchSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Unit Library</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {mockUnits.length} AC9-aligned unit plans ready to use
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search units..."
          className="flex-1 px-4 py-2.5 rounded-lg border text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-lg border text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2.5 rounded-lg border text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
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
            className="p-5 rounded-xl border cursor-pointer transition-all duration-200"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
              >
                {unit.subject}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                {unit.yearLevel}
              </span>
            </div>
            <h3 className="text-sm font-medium text-white mb-2">{unit.topic}</h3>
            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {unit.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{unit.duration}</span>
              <span className="text-xs" style={{ color: 'var(--accent)' }}>View Unit &rarr;</span>
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
            className="w-full max-w-2xl rounded-2xl border p-6 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium mr-2"
                  style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  {selectedUnit.subject}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                >
                  {selectedUnit.yearLevel}
                </span>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
              >
                x
              </button>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{selectedUnit.topic}</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{selectedUnit.description}</p>
            <div className="mb-4">
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--accent)' }}>AC9 Outcomes</div>
              <div className="flex flex-wrap gap-2">
                {selectedUnit.outcomes.map((o) => (
                  <span key={o} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                    {o}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-sm whitespace-pre-wrap mb-6" style={{ color: 'var(--text-primary)' }}>
              {selectedUnit.content}
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
              >
                Export as PDF
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Export as DOCX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@school.edu.au');
  const [school, setSchool] = useState('Mount Pleasant Public School');
  const [state, setState] = useState('NSW');

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          JD
        </div>
        <div>
          <div className="text-base font-medium text-white">{name}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{email}</div>
          <div
            className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            Pro Plan
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>School</label>
          <input type="text" value={school} onChange={(e) => setSchool(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>State</label>
          <select value={state} onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          className="w-full py-3.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          Save Changes
        </button>
      </div>

      {/* Subscription */}
      <div className="mt-8 p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-white">Pro Plan</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Unlimited access to all features</div>
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>$29/month</span>
        </div>
        <button className="w-full py-2 rounded-lg text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Manage Subscription
        </button>
      </div>
    </div>
  );
}
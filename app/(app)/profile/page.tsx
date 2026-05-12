'use client';

import { useState } from 'react';
import { User, Save, CreditCard } from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@school.edu.au');
  const [school, setSchool] = useState('Mount Pleasant Public School');
  const [state, setState] = useState('NSW');

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <User className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          Profile
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          JD
        </div>
        <div>
          <div className="text-base font-medium text-white">{name}</div>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{email}</div>
          <div
            className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            Pro Plan
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="label-dark">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
          />
        </div>

        <div>
          <label className="label-dark">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark"
          />
        </div>

        <div>
          <label className="label-dark">School</label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="input-dark"
          />
        </div>

        <div>
          <label className="label-dark">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="input-dark"
          >
            {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          className="btn-primary w-full justify-center"
          style={{ paddingTop: '14px', paddingBottom: '14px' }}
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Subscription */}
      <div
        className="mt-8 p-5 rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-white">Pro Plan</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Unlimited access to all features</div>
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>$29/month</span>
        </div>
        <button
          className="w-full py-2 rounded-lg text-xs border transition-all flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <CreditCard className="w-3 h-3" />
          Manage Subscription
        </button>
      </div>
    </div>
  );
}
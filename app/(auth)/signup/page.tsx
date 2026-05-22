'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/app/lib/supabase';
import { TeachWiseBrand } from '@/app/components/teachwise-brand';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        localStorage.setItem('teachwise-demo-mode', 'true');
        router.push('/');
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }

      router.push('/');
    } catch {
      setMessage('Could not create the account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
      <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="teachwise-panel rounded-[28px] p-6 md:p-8">
          <TeachWiseBrand className="items-center" tagline="Less marking. More teaching." />
          <h1 className="mt-5 text-3xl font-bold leading-tight text-white md:text-5xl">Start with the app that feels built for teachers.</h1>
          <p className="mt-4 text-sm leading-7 md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Build once, reuse everywhere. Your context will travel with your planning, rubrics, marking and chat.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">Personal workspace for F-6 teaching workload</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">Ready for Supabase auth and persistence</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">Free beta launch, no billing friction yet</div>
          </div>
        </section>

        <section className="teachwise-panel rounded-[28px] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <TeachWiseBrand compact />
            <div>
              <div className="text-lg font-semibold text-white">Create your TeachWise account</div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Or drop into demo mode locally</div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-dark">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input className="input-dark pl-11" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.edu.au" required />
              </div>
            </div>
            <div>
              <label className="label-dark">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input className="input-dark pl-11" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required />
              </div>
            </div>

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-text-muted)' }}>Already have one?</span>
            <Link href="/signin" className="font-semibold" style={{ color: 'var(--color-accent)' }}>
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

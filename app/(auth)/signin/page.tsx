'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { getSupabaseBrowserClient, hasSupabaseEnv } from '@/app/lib/supabase';
import { TeachWiseBrand } from '@/app/components/teachwise-brand';

export default function SignInPage() {
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

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }

      router.push('/');
    } catch {
      setMessage('Could not sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="teachwise-hero rounded-[28px] p-6 md:p-8">
          <TeachWiseBrand className="items-center" tagline="Less marking. More teaching." />
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-6xl">Less marking. More teaching.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Sign in to a workspace built for lesson planning, rubrics, auto-marking, and every other AI task that belongs in a teacher’s day.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-white/90 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">Open a tool</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">Get a result</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">Close the tab</div>
          </div>
        </section>

        <section className="teachwise-panel rounded-[28px] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <TeachWiseBrand compact />
            <div>
              <div className="text-lg font-semibold text-white">Welcome back</div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {hasSupabaseEnv() ? 'Connect your Supabase auth session' : 'Demo mode is available locally'}
              </div>
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
                <input className="input-dark pl-11" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            </div>

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Signing in...' : 'Enter TeachWise'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-text-muted)' }}>Need an account?</span>
            <Link href="/signup" className="font-semibold" style={{ color: 'var(--color-accent)' }}>
              Create one
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

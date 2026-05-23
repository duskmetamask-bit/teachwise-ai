'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Loader2, LogIn, Sparkles } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/client';

export default function SignInPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const configured = Boolean(supabase);

  const signIn = async () => {
    if (!supabase) return;
    setStatus('loading');
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus('error');
      setMessage(error.message);
      return;
    }

    window.location.href = '/';
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center">
      <div className="teachwise-panel w-full rounded-2xl p-6">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">
            <Sparkles className="h-3.5 w-3.5" />
            TeachWise Auth
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-400">Use your TeachWise account to restore your workspace across devices.</p>
        </div>

        {!configured && (
          <div className="mb-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
            Supabase auth is not configured yet. Add the environment variables first to enable sign in.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label-dark">Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="input-dark" placeholder="you@school.edu.au" />
          </div>
          <div>
            <label className="label-dark">Password</label>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="input-dark" placeholder="Password" />
          </div>
          {message && <p className="text-sm text-rose-300">{message}</p>}
          <button
            disabled={!configured || status === 'loading' || !email || !password}
            onClick={() => void signIn()}
            className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Sign in
          </button>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Need an account? <Link className="text-teal-300 hover:text-teal-200" href="/auth/sign-up">Create one</Link>
        </p>
      </div>
    </div>
  );
}

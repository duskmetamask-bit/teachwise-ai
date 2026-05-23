import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabasePublishableKey, getSupabaseUrl, isSupabaseConfigured } from '@/app/lib/supabase/env';

const SUPABASE_AUTH_TIMEOUT_MS = 1500;

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function getSupabaseSessionUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Supabase auth timed out')), SUPABASE_AUTH_TIMEOUT_MS);
      }),
    ]);

    return data.user ?? null;
  } catch (error) {
    console.warn('Supabase session lookup fell back to local mode:', error);
    return null;
  }
}

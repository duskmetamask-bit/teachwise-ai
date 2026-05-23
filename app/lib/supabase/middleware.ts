import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabasePublishableKey, getSupabaseUrl, isSupabaseConfigured } from './env';

const SUPABASE_MIDDLEWARE_TIMEOUT_MS = 500;

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) => response.cookies.set(name, value, cookieOptions));
        },
      },
    },
  );

  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Supabase middleware timed out')), SUPABASE_MIDDLEWARE_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    console.warn('Supabase middleware fell back without refreshing the session:', error);
  }

  return response;
}

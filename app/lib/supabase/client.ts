'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublishableKey, getSupabaseUrl, isSupabaseConfigured } from '@/app/lib/supabase/env';

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;

  return createBrowserClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
  );
}

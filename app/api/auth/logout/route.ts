import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/app/lib/supabase/server';

export async function POST() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ ok: true });
}

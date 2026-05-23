import { NextResponse } from 'next/server';
import { getSupabaseSessionUser } from '@/app/lib/supabase/server';
import { isSupabaseConfigured } from '@/app/lib/supabase/env';

export async function GET() {
  try {
    const user = await getSupabaseSessionUser();
    return NextResponse.json({
      configured: isSupabaseConfigured(),
      user: user ? { id: user.id, email: user.email ?? null } : null,
    });
  } catch (error) {
    console.error('Auth session error:', error);
    return NextResponse.json({
      configured: isSupabaseConfigured(),
      user: null,
    });
  }
}

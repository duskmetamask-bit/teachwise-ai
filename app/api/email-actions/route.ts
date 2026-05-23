import { NextRequest, NextResponse } from 'next/server';
import { appendEmailLogForRequest } from '@/app/lib/server/workspaceRepository';

interface EmailActionLog {
  student: string;
  className: string;
  date: string;
  intentType: string;
  actionsTaken: string[];
  subject?: string;
}

export async function POST(req: NextRequest) {
  try {
    const log = await req.json() as EmailActionLog;

    if (!log.intentType || !log.date) {
      return NextResponse.json({ error: 'Missing required log fields' }, { status: 400 });
    }

    const snapshot = await appendEmailLogForRequest(log);

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const table = process.env.SUPABASE_EMAIL_ACTIONS_TABLE || 'email_action_logs';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        ok: true,
        stored: snapshot.storageMode || 'server-file',
        mirroredToSupabase: false,
        message: 'Supabase environment variables are not configured, so the log was stored in the local workspace file.',
      });
    }

    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        student: log.student,
        class_name: log.className,
        date: log.date,
        intent_type: log.intentType,
        actions_taken: log.actionsTaken,
        subject: log.subject || '',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase log error:', response.status, errorText);
      return NextResponse.json({ ok: false, error: 'Supabase insert failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, stored: snapshot.storageMode || 'server-file', mirroredToSupabase: true });
  } catch (error) {
    console.error('Email action log error:', error);
    return NextResponse.json({ error: 'Unable to save action log' }, { status: 500 });
  }
}

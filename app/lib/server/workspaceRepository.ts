import {
  EmailActionLog,
  WorkspaceApiSnapshot,
  WorkspaceSnapshot,
  WorkspaceStorageMode,
} from '@/app/lib/types';
import { createSupabaseServerClient, getSupabaseSessionUser } from '@/app/lib/supabase/server';
import {
  mergeWorkspaceSnapshot as mergeFileWorkspaceSnapshot,
  readWorkspaceSnapshot as readFileWorkspaceSnapshot,
} from '@/app/lib/server/workspaceStore';
import { isSupabaseConfigured } from '@/app/lib/supabase/env';

const SUPABASE_TABLE = 'workspace_snapshots';

function withStorageMode(snapshot: WorkspaceSnapshot, storageMode: WorkspaceStorageMode): WorkspaceApiSnapshot {
  return {
    ...snapshot,
    storageMode,
  };
}

async function readSupabaseWorkspace(userId: string): Promise<WorkspaceApiSnapshot> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return withStorageMode(await readFileWorkspaceSnapshot(), 'file');
  }

  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .select('prefs, messages, saved_outputs, email_logs, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Supabase workspace read error:', error);
    return withStorageMode(await readFileWorkspaceSnapshot(), 'file');
  }

  if (!data) {
    return withStorageMode({
      prefs: { name: '', yearLevel: '', subject: '', state: 'WA' },
      messages: [],
      savedOutputs: [],
      emailLogs: [],
      updatedAt: new Date().toISOString(),
    }, 'supabase');
  }

  return {
    prefs: data.prefs || { name: '', yearLevel: '', subject: '', state: 'WA' },
    messages: data.messages || [],
    savedOutputs: data.saved_outputs || [],
    emailLogs: data.email_logs || [],
    updatedAt: data.updated_at || new Date().toISOString(),
    storageMode: 'supabase',
  };
}

async function writeSupabaseWorkspace(userId: string, partial: Partial<WorkspaceSnapshot>): Promise<WorkspaceApiSnapshot> {
  const current = await readSupabaseWorkspace(userId);
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return withStorageMode(await mergeFileWorkspaceSnapshot(partial), 'file');
  }

  const nextSnapshot: WorkspaceSnapshot = {
    prefs: {
      ...{ name: '', yearLevel: '', subject: '', state: 'WA' },
      ...current.prefs,
      ...(partial.prefs ?? {}),
    },
    messages: partial.messages ?? current.messages,
    savedOutputs: partial.savedOutputs ?? current.savedOutputs,
    emailLogs: partial.emailLogs ?? current.emailLogs,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.from(SUPABASE_TABLE).upsert({
    user_id: userId,
    prefs: nextSnapshot.prefs,
    messages: nextSnapshot.messages,
    saved_outputs: nextSnapshot.savedOutputs,
    email_logs: nextSnapshot.emailLogs,
    updated_at: nextSnapshot.updatedAt,
  });

  if (error) {
    console.error('Supabase workspace write error:', error);
    return withStorageMode(await mergeFileWorkspaceSnapshot(partial), 'file');
  }

  return withStorageMode(nextSnapshot, 'supabase');
}

export async function readWorkspaceSnapshotForRequest(): Promise<WorkspaceApiSnapshot> {
  if (!isSupabaseConfigured()) {
    return withStorageMode(await readFileWorkspaceSnapshot(), 'file');
  }

  const user = await getSupabaseSessionUser();
  if (!user) {
    return withStorageMode(await readFileWorkspaceSnapshot(), 'supabase-auth-required');
  }

  return readSupabaseWorkspace(user.id);
}

export async function mergeWorkspaceSnapshotForRequest(partial: Partial<WorkspaceSnapshot>): Promise<WorkspaceApiSnapshot> {
  if (!isSupabaseConfigured()) {
    return withStorageMode(await mergeFileWorkspaceSnapshot(partial), 'file');
  }

  const user = await getSupabaseSessionUser();
  if (!user) {
    return withStorageMode(await mergeFileWorkspaceSnapshot(partial), 'supabase-auth-required');
  }

  return writeSupabaseWorkspace(user.id, partial);
}

export async function appendEmailLogForRequest(log: EmailActionLog): Promise<WorkspaceApiSnapshot> {
  const current = await readWorkspaceSnapshotForRequest();
  return mergeWorkspaceSnapshotForRequest({
    emailLogs: [log, ...current.emailLogs],
  });
}

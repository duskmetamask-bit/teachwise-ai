import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  EmailActionLog,
  SavedOutputRecord,
  TeacherPrefs,
  WorkspaceMessage,
  WorkspaceSnapshot,
} from '@/app/lib/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const WORKSPACE_FILE = path.join(DATA_DIR, 'teachwise-workspace.json');

const DEFAULT_PREFS: TeacherPrefs = {
  name: '',
  yearLevel: '',
  subject: '',
  state: 'WA',
};

function createDefaultSnapshot(): WorkspaceSnapshot {
  return {
    prefs: DEFAULT_PREFS,
    messages: [],
    savedOutputs: [],
    emailLogs: [],
    updatedAt: new Date(0).toISOString(),
  };
}

function normaliseSnapshot(raw: Partial<WorkspaceSnapshot> | null | undefined): WorkspaceSnapshot {
  return {
    prefs: {
      ...DEFAULT_PREFS,
      ...(raw?.prefs ?? {}),
    },
    messages: Array.isArray(raw?.messages) ? raw!.messages as WorkspaceMessage[] : [],
    savedOutputs: Array.isArray(raw?.savedOutputs) ? raw!.savedOutputs as SavedOutputRecord[] : [],
    emailLogs: Array.isArray(raw?.emailLogs) ? raw!.emailLogs as EmailActionLog[] : [],
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
}

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  try {
    const contents = await readFile(WORKSPACE_FILE, 'utf8');
    return normaliseSnapshot(JSON.parse(contents) as WorkspaceSnapshot);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return createDefaultSnapshot();
    }
    throw error;
  }
}

export async function writeWorkspaceSnapshot(snapshot: Partial<WorkspaceSnapshot>): Promise<WorkspaceSnapshot> {
  await ensureDataDir();
  const nextSnapshot = normaliseSnapshot({
    ...snapshot,
    updatedAt: new Date().toISOString(),
  });
  await writeFile(WORKSPACE_FILE, JSON.stringify(nextSnapshot, null, 2), 'utf8');
  return nextSnapshot;
}

export async function mergeWorkspaceSnapshot(partial: Partial<WorkspaceSnapshot>): Promise<WorkspaceSnapshot> {
  const current = await readWorkspaceSnapshot();
  return writeWorkspaceSnapshot({
    ...current,
    ...partial,
    prefs: {
      ...current.prefs,
      ...(partial.prefs ?? {}),
    },
    messages: partial.messages ?? current.messages,
    savedOutputs: partial.savedOutputs ?? current.savedOutputs,
    emailLogs: partial.emailLogs ?? current.emailLogs,
  });
}

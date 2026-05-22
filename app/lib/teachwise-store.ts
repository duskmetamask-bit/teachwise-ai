import {
  ActivityEvent,
  ChatThread,
  LessonPlan,
  MarkingResult,
  Message,
  RubricArtifact,
  SavedPlan,
  TeacherProfile,
  UnitPlan,
} from './types';

const prefix = 'teachwise';
let unitsSnapshotRaw: string | null = null;
let unitsSnapshotCache: UnitPlan[] = [];

function isBrowser() {
  return typeof window !== 'undefined';
}

function key(name: string) {
  return `${prefix}:${name}`;
}

function readJson<T>(storageKey: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(storageKey: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(value));
  window.dispatchEvent(new Event('teachwise-storage'));
}

export function makeId() {
  return `tw_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function loadTeacherProfile(): TeacherProfile {
  return readJson<TeacherProfile>(key('profile'), {
    id: 'local-teacher',
    name: '',
    yearLevel: '',
    subject: '',
    state: 'WA',
    schoolName: '',
    updatedAt: new Date().toISOString(),
  });
}

export function saveTeacherProfile(profile: TeacherProfile) {
  writeJson(key('profile'), profile);
}

export function loadMessages(): Message[] {
  const messages = readJson<Array<Omit<Message, 'timestamp'> & { timestamp: string }>>(key('chat-history'), []);
  return messages.map((message) => ({ ...message, timestamp: new Date(message.timestamp) }));
}

export function saveMessages(messages: Message[]) {
  writeJson(
    key('chat-history'),
    messages.map((message) => ({
      ...message,
      timestamp: message.timestamp.toISOString(),
    }))
  );
}

export function loadChatThreads(): ChatThread[] {
  return readJson<ChatThread[]>(key('chat-threads'), []);
}

export function saveChatThreads(threads: ChatThread[]) {
  writeJson(key('chat-threads'), threads);
}

export function loadUnits(): UnitPlan[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = localStorage.getItem(key('units'));
  if (raw === unitsSnapshotRaw) {
    return unitsSnapshotCache;
  }

  const parsed = raw
    ? (JSON.parse(raw) as Array<Omit<UnitPlan, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt?: string }>)
    : [];

  unitsSnapshotRaw = raw;
  unitsSnapshotCache = parsed.map((unit) => ({
    ...unit,
    createdAt: new Date(unit.createdAt),
    updatedAt: unit.updatedAt ? new Date(unit.updatedAt) : undefined,
  }));
  return unitsSnapshotCache;
}

export function saveUnits(units: UnitPlan[]) {
  unitsSnapshotCache = units;
  unitsSnapshotRaw = JSON.stringify(
    units.map((unit) => ({
      ...unit,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt?.toISOString(),
    }))
  );
  writeJson(
    key('units'),
    units.map((unit) => ({
      ...unit,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt?.toISOString(),
    }))
  );
}

export function loadLessonPlans(): LessonPlan[] {
  return readJson<Array<Omit<LessonPlan, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt?: string }>>(key('lesson-plans'), []).map((plan) => ({
    ...plan,
    createdAt: new Date(plan.createdAt),
    updatedAt: plan.updatedAt ? new Date(plan.updatedAt) : undefined,
  }));
}

export function saveLessonPlans(plans: LessonPlan[]) {
  writeJson(
    key('lesson-plans'),
    plans.map((plan) => ({
      ...plan,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt?.toISOString(),
    }))
  );
}

export function loadRubrics(): RubricArtifact[] {
  return readJson<RubricArtifact[]>(key('rubrics'), []);
}

export function saveRubrics(rubrics: RubricArtifact[]) {
  writeJson(key('rubrics'), rubrics);
}

export function loadMarkingResults(): MarkingResult[] {
  return readJson<MarkingResult[]>(key('marking-results'), []);
}

export function saveMarkingResults(results: MarkingResult[]) {
  writeJson(key('marking-results'), results);
}

export function loadSavedPlans(): SavedPlan[] {
  return readJson<SavedPlan[]>(key('saved-plans'), []);
}

export function saveSavedPlans(plans: SavedPlan[]) {
  writeJson(key('saved-plans'), plans);
}

export function loadActivityEvents(): ActivityEvent[] {
  return readJson<ActivityEvent[]>(key('activity-events'), []);
}

export function saveActivityEvents(events: ActivityEvent[]) {
  writeJson(key('activity-events'), events);
}

export function recordActivity(event: Omit<ActivityEvent, 'id' | 'createdAt'>) {
  const current = loadActivityEvents();
  const next: ActivityEvent = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    ...event,
  };
  saveActivityEvents([next, ...current].slice(0, 60));
  return next;
}

export function estimateMinutesReclaimed(events: ActivityEvent[]) {
  return events.reduce((total, event) => total + (event.minutesReclaimed || 0), 0);
}

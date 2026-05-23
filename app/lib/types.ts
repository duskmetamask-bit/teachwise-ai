export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TeacherPrefs {
  name?: string;
  yearLevel?: string;
  subject?: string;
  state: string;
}

export interface WorkspaceMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export type OutputKind =
  | 'lesson'
  | 'rubric'
  | 'report'
  | 'email'
  | 'sub'
  | 'quiz'
  | 'align'
  | 'newsletter'
  | 'differentiate'
  | 'iep'
  | 'behaviour'
  | 'generic';

export interface SavedOutputRecord {
  kind: OutputKind;
  title: string;
  savedAt: string;
  content: string;
}

export interface EmailActionLog {
  student: string;
  className: string;
  date: string;
  intentType: string;
  actionsTaken: string[];
  subject?: string;
}

export interface WorkspaceSnapshot {
  prefs: TeacherPrefs;
  messages: WorkspaceMessage[];
  savedOutputs: SavedOutputRecord[];
  emailLogs: EmailActionLog[];
  updatedAt: string;
}

export type WorkspaceStorageMode = 'file' | 'supabase' | 'supabase-auth-required';

export interface WorkspaceApiSnapshot extends WorkspaceSnapshot {
  storageMode?: WorkspaceStorageMode;
}

export interface AuthSessionSummary {
  configured: boolean;
  user: {
    id: string;
    email: string | null;
  } | null;
}

export interface UnitPlan {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  description: string;
  duration: string; // e.g. "6 weeks"
  lessons: number;
  overview: string;
  content: string;
  ac9Codes: string[];
  outcomes: string[];
  assessment?: string;
  createdAt: Date;
}

export interface LessonPlan {
  id: string;
  unitId: string;
  title: string;
  subject: string;
  yearLevel: string;
  lessonNumber: number;
  totalLessons: number;
  duration: string;
  learningIntention: string;
  successCriteria: string[];
  activities: {
    hook?: string;
    explicit?: string;
    guided?: string;
    independent?: string;
    reflection?: string;
  };
  resources?: string[];
  differentiation?: {
    extension?: string;
    support?: string;
    eald?: string;
  };
  createdAt: Date;
}

export interface SavedPlan {
  id: string;
  title: string;
  yearLevel: string;
  subject: string;
  topic: string;
  ac9Codes: string[];
  dateSaved: string;
  rawContent: string;
}

export interface ChatResponse {
  response: string;
  context?: {
    topic?: string;
    yearLevel?: string;
    subject?: string;
    stage?: string;
  };
}

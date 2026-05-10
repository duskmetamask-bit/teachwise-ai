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

export interface UnitPlan {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  duration: string; // e.g. "6 weeks"
  lessons: number;
  overview: string;
  ac9Codes: string[];
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

export interface ChatResponse {
  response: string;
  context?: {
    topic?: string;
    yearLevel?: string;
    subject?: string;
    stage?: string;
  };
}

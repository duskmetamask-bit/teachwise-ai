export type TeacherYearLevel = 'F' | 'PP' | '1' | '2' | '3' | '4' | '5' | '6';
export type TeacherSubject =
  | 'English'
  | 'Mathematics'
  | 'Science'
  | 'HASS'
  | 'Digital Technologies'
  | 'Health'
  | 'The Arts'
  | 'Technologies'
  | 'Health & PE'
  | 'Health & Physical Education'
  | 'Humanities & Social Sciences';

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
  schoolName?: string;
  className?: string;
}

export interface TeacherProfile extends TeacherPrefs {
  id: string;
  schoolType?: string;
  learnerMix?: {
    eald?: string;
    aboveLevel?: string;
    support?: string;
  };
  topicsCovered?: string;
  specificNeeds?: string;
  updatedAt: string;
}

export interface UnitPlan {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  description: string;
  duration: string;
  lessons: number;
  overview: string;
  content: string;
  ac9Codes: string[];
  outcomes: string[];
  assessment?: string;
  createdAt: Date;
  updatedAt?: Date;
  ownerId?: string;
  rawPlan?: string;
}

export interface LessonBlock {
  id: string;
  type: 'learning_intention' | 'success_criteria' | 'hook' | 'explicit_teaching' | 'guided_practice' | 'independent_practice' | 'reflection' | 'resources' | 'differentiation';
  label: string;
  content: string;
  generated?: boolean;
}

export interface LessonPlan {
  id: string;
  unitId?: string;
  title: string;
  subject: string;
  yearLevel: string;
  lessonNumber: number;
  totalLessons: number;
  duration: string;
  mode: 'lesson' | 'unit';
  blocks: LessonBlock[];
  ac9Codes: string[];
  exportMetadata?: {
    exportedDocx?: boolean;
    exportedPdf?: boolean;
    exportedPptx?: boolean;
  };
  createdAt: Date;
  updatedAt?: Date;
  ownerId?: string;
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

export interface RubricArtifact {
  id: string;
  ownerId?: string;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  type: 'analytic' | 'holistic';
  levelCount: 3 | 4 | 5;
  markdown: string;
  parsedTable?: {
    headers: string[];
    rows: string[][];
  };
  ac9Codes: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CriterionFeedback {
  name: string;
  grade: string;
  feedback: string;
}

export interface MarkingResult {
  id: string;
  ownerId?: string;
  overallGrade: string;
  criteria: CriterionFeedback[];
  strengths: string[];
  areasForDevelopment: string[];
  nextSteps: string[];
  rubricId?: string;
  studentText?: string;
  rawResponse: string;
  files?: {
    student?: string;
    rubric?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ChatThread {
  id: string;
  ownerId?: string;
  title: string;
  kind: 'general' | 'unit' | 'rubric' | 'marking';
  linkedUnitId?: string;
  linkedRubricId?: string;
  linkedMarkingResultId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityEvent {
  id: string;
  ownerId?: string;
  type:
    | 'lesson_planned'
    | 'rubric_created'
    | 'work_marked'
    | 'unit_saved'
    | 'chat_message'
    | 'exported';
  title: string;
  detail?: string;
  minutesReclaimed?: number;
  createdAt: string;
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

export interface MarkingResponse {
  overallGrade: string;
  criteria: CriterionFeedback[];
  strengths: string[];
  areasForDevelopment: string[];
  nextSteps: string[];
}


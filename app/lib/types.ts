export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UnitPlan {
  id: string;
  subject: string;
  yearLevel: string;
  topic: string;
  description: string;
  duration: string;
  outcomes: string[];
  content: string;
}

export interface LessonPlan {
  subject: string;
  yearLevel: string;
  topic: string;
  walt: string;
  tib: string;
  wilf: string[];
  activities: string[];
  resources: string[];
  assessment: string;
}

export interface RubricCriterion {
  name: string;
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface Rubric {
  subject: string;
  yearLevel: string;
  taskType: string;
  criteria: RubricCriterion[];
}

export interface StudentWork {
  name: string;
  work: string;
  rubric: string;
}

export interface ReportComment {
  studentName: string;
  subject: string;
  effortLevel: 'high' | 'medium' | 'low';
  comment: string;
}

export interface Worksheet {
  topic: string;
  yearLevel: string;
  questions: { type: string; question: string; answer?: string }[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
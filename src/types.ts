export type ColorIndicator = 
  | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'yellow' | 'pink' | 'cyan' | 'slate'
  | 'indigo' | 'violet' | 'rose' | 'amber' | 'emerald' | 'teal' | 'lime' | 'fuchsia';

export interface Subject {
  id: string;
  name: string;
  color: ColorIndicator;
  teacher?: string;
  room?: string;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  startTime: string; // "HH:mm" (24h)
  endTime: string;   // "HH:mm" (24h)
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  dueDate: string; // ISO string for easy serialization "YYYY-MM-DD"
  completed: boolean;
}

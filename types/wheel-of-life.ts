export const LIFE_ASPECTS = [
  { id: 'physical_health', label: 'Fyzické zdravie', color: '#22c55e', icon: 'Activity' },
  { id: 'mental_health', label: 'Duševné zdravie', color: '#3b82f6', icon: 'Brain' },
  { id: 'family_friends', label: 'Rodina a Priatelia', color: '#f59e0b', icon: 'Users' },
  { id: 'romantic_life', label: 'Romantický život', color: '#ec4899', icon: 'Heart' },
  { id: 'career', label: 'Kariéra', color: '#8b5cf6', icon: 'Briefcase' },
  { id: 'finances', label: 'Financie', color: '#14b8a6', icon: 'Wallet' },
  { id: 'personal_growth', label: 'Osobný rozvoj', color: '#f97316', icon: 'TrendingUp' },
  { id: 'purpose', label: 'Zmysel a prínos', color: '#6366f1', icon: 'Star' },
] as const;

export type LifeAspectId = typeof LIFE_ASPECTS[number]['id'];

export interface LifeAspect {
  id: LifeAspectId;
  label: string;
  color: string;
  icon: string;
}

export interface AspectRating {
  aspectId: LifeAspectId;
  value: number; // 0-10
}

export interface WeeklyAssessment {
  id: string;
  weekStart: string;
  weekEnd: string;
  createdAt: string;
  updatedAt: string;
  ratings: AspectRating[];
  notes?: string;
}

export interface WheelOfLifeSettings {
  reminderEnabled: boolean;
  reminderDay: number;
  reminderHour: number;
  reminderMinute: number;
}

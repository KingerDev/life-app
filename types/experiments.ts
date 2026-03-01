import { BeliefDomain } from './beliefs';
import { LifeAspectId } from './wheel-of-life';

export interface FieldNotes {
  whatFeltGood: string;
  whatDidntFeelGood: string;
  curiosities: string;
  inspiringPeople: string;
  flowWork: string;
  procrastinationWork: string;
  lessActivities: string;
  moreActivities: string;
  skillsToExplore: string;
}

export interface PatternInsights {
  patternA: string;
  patternB: string;
  patternC: string;
}

export interface ResearchQuestion {
  question: string;
}

export interface ExperimentPact {
  action: string;
  duration: string;
}

export type DurationType = 'days' | 'weeks' | 'months';
export type ExperimentStatus = 'active' | 'completed' | 'abandoned';

export interface TinyExperiment {
  id: string;
  userId: string;
  domainId: BeliefDomain;
  fieldNotes: FieldNotes;
  patterns: PatternInsights;
  researchQuestion: ResearchQuestion;
  pact: ExperimentPact;
  durationValue: number;
  durationType: DurationType;
  startDate: string;
  endDate: string;
  status: ExperimentStatus;
  suggestionSource?: 'wheel_of_life' | 'manual';
  relatedAspectId?: LifeAspectId;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentCheckIn {
  id: string;
  experimentId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentSuggestion {
  domainId: BeliefDomain;
  domainLabel: string;
  source: 'wheel_of_life';
  reason: string;
  aspectScore?: number;
  priority: number;
}

export interface ExperimentProgress {
  experimentId: string;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  checkInsCount: number;
  completedCount: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  needsCheckInToday: boolean;
  completedToday: boolean;
}

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface CreateExperimentPayload {
  domainId: BeliefDomain;
  fieldNotes: FieldNotes;
  patterns: PatternInsights;
  researchQuestion: ResearchQuestion;
  pact: ExperimentPact;
  durationValue: number;
  durationType: DurationType;
  startDate: string;
  suggestionSource?: 'wheel_of_life' | 'manual';
  relatedAspectId?: LifeAspectId;
}

export interface UpdateExperimentPayload {
  fieldNotes?: FieldNotes;
  patterns?: PatternInsights;
  researchQuestion?: ResearchQuestion;
  pact?: ExperimentPact;
  durationValue?: number;
  durationType?: DurationType;
  startDate?: string;
}

export interface CreateCheckInPayload {
  date: string;
  completed: boolean;
  notes?: string;
}

export const WOL_TO_BELIEFS_DOMAIN_MAP: Record<LifeAspectId, BeliefDomain> = {
  career: 'career',
  physical_health: 'health',
  mental_health: 'health',
  family_friends: 'relationships',
  romantic_life: 'relationships',
  finances: 'money',
  personal_growth: 'learning',
  purpose: 'impact',
};

export function formatDuration(value: number, type: DurationType): string {
  switch (type) {
    case 'days':
      if (value === 1) return '1 deň';
      if (value >= 2 && value <= 4) return `${value} dni`;
      return `${value} dní`;
    case 'weeks':
      if (value === 1) return '1 týždeň';
      if (value >= 2 && value <= 4) return `${value} týždne`;
      return `${value} týždňov`;
    case 'months':
      if (value === 1) return '1 mesiac';
      if (value >= 2 && value <= 4) return `${value} mesiace`;
      return `${value} mesiacov`;
  }
}

export function getStatusLabel(status: ExperimentStatus): string {
  switch (status) {
    case 'active': return 'Aktívny';
    case 'completed': return 'Dokončený';
    case 'abandoned': return 'Opustený';
  }
}

export function calculateEndDate(startDate: string, durationValue: number, durationType: DurationType): string {
  const start = new Date(startDate);
  const end = new Date(start);
  switch (durationType) {
    case 'days': end.setDate(end.getDate() + durationValue); break;
    case 'weeks': end.setDate(end.getDate() + durationValue * 7); break;
    case 'months': end.setMonth(end.getMonth() + durationValue); break;
  }
  return end.toISOString().split('T')[0];
}

export function parseDuration(durationStr: string): { value: number; type: DurationType } | null {
  const match = durationStr.match(/(\d+)\s*(de?ň|dní|dní|day|days|týžd|week|weeks|mesiac|month|months)/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  let type: DurationType;
  if (unit.startsWith('d') || unit.startsWith('de')) type = 'days';
  else if (unit.startsWith('t') || unit.startsWith('w')) type = 'weeks';
  else if (unit.startsWith('m')) type = 'months';
  else return null;
  return { value, type };
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export function getProgressPercentage(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();
  if (elapsed <= 0) return 0;
  if (elapsed >= totalDuration) return 100;
  return Math.round((elapsed / totalDuration) * 100);
}

import { LIFE_ASPECTS } from './wheel-of-life';
import type { LifeAspectId } from './wheel-of-life';

// ─── Habit-specific aspects (extends WoL aspects with "other") ────────────────

export const HABIT_ASPECTS = [
  ...LIFE_ASPECTS,
  { id: 'other' as const, label: 'Iné', color: '#6b7280' },
] as const;

export type HabitAspectId = (typeof HABIT_ASPECTS)[number]['id'];

// ─── Core domain objects ─────────────────────────────────────────────────────

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  aspectId: HabitAspectId;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitWithTodayEntry extends Habit {
  todayEntry: HabitEntry | null;
  aspectLabel: string;
}

// ─── Stats & summary ─────────────────────────────────────────────────────────

export interface HabitStats {
  habitId: string;
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  weeklyCompletions: number[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun] — 0 or 1
  monthlyCompletions: Record<string, boolean>; // 'YYYY-MM-DD' → bool
  completedToday: boolean;
}

export interface HabitDashboardSummary {
  totalHabits: number;
  completedToday: number;
  completionRateToday: number;
  longestCurrentStreak: number;
  habitsNeedingCheckIn: string[];
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface CreateHabitPayload {
  name: string;
  description?: string;
  aspectId: HabitAspectId;
  icon?: string;
}

export interface UpdateHabitPayload {
  name?: string;
  description?: string;
  aspectId?: HabitAspectId;
  icon?: string;
  isActive?: boolean;
}

export interface CreateHabitEntryPayload {
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
  note?: string;
}

export interface UpdateHabitEntryPayload {
  completed?: boolean;
  note?: string;
}

export interface PaginatedHabitsResponse {
  data: Habit[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export interface HeatmapDay {
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
  hasEntry: boolean; // true = entry exists in DB (completed or explicitly missed)
  note?: string;
  isToday: boolean;
  isFuture: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns local date as "YYYY-MM-DD" — avoids UTC shift for UTC+ timezones. */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodayString(): string {
  return toLocalDateStr(new Date());
}

/**
 * Build an array of HeatmapDay entries for the past `weeksBack` weeks (Mon–Sun).
 * The array covers complete weeks aligned to Monday, padded with future days
 * to fill the last partial week.
 */
export function buildHeatmapData(entries: HabitEntry[], weeksBack = 26): HeatmapDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toLocalDateStr(today);

  // Find the Monday of the current week
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromMonday);

  // Go back weeksBack-1 more weeks from the current week start
  const startDate = new Date(weekStart);
  startDate.setDate(weekStart.getDate() - (weeksBack - 1) * 7);

  // The end is Sunday of the current week
  const endDate = new Date(weekStart);
  endDate.setDate(weekStart.getDate() + 6);

  // Build a lookup map from entries
  const entryMap = new Map<string, HabitEntry>();
  for (const entry of entries) {
    entryMap.set(entry.date, entry);
  }

  const days: HeatmapDay[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const dateStr = toLocalDateStr(cursor);
    const entry = entryMap.get(dateStr);
    const isFuture = cursor > today;
    days.push({
      date: dateStr,
      completed: entry?.completed ?? false,
      hasEntry: entry !== undefined,
      note: entry?.note,
      isToday: dateStr === todayStr,
      isFuture,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

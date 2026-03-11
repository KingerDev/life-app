import type { AxiosInstance } from 'axios';
import type {
  Habit, HabitEntry, HabitWithTodayEntry, HabitStats, HabitDashboardSummary,
  CreateHabitPayload, UpdateHabitPayload,
  CreateHabitEntryPayload, UpdateHabitEntryPayload,
  PaginatedHabitsResponse,
} from '@/types/habits';
import type { LifeAspectId } from '@/types/wheel-of-life';

// ─── Normalizers (snake_case API → camelCase TS) ──────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeHabit(h: any): Habit {
  return {
    id: h.id,
    userId: h.user_id ?? h.userId,
    name: h.name,
    description: h.description ?? undefined,
    aspectId: (h.aspect_id ?? h.aspectId) as LifeAspectId,
    color: h.color,
    icon: h.icon ?? 'CalendarCheck',
    isActive: h.is_active ?? h.isActive ?? true,
    createdAt: h.created_at ?? h.createdAt,
    updatedAt: h.updated_at ?? h.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeHabitWithToday(h: any): HabitWithTodayEntry {
  return {
    ...normalizeHabit(h),
    todayEntry: h.today_entry ?? h.todayEntry
      ? normalizeEntry(h.today_entry ?? h.todayEntry)
      : null,
    aspectLabel: h.aspect_label ?? h.aspectLabel ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEntry(e: any): HabitEntry {
  return {
    id: e.id,
    habitId: e.habit_id ?? e.habitId,
    date: typeof e.date === 'string' ? e.date.split('T')[0] : e.date,
    completed: e.completed ?? false,
    note: e.note ?? undefined,
    createdAt: e.created_at ?? e.createdAt,
    updatedAt: e.updated_at ?? e.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeStats(s: any): HabitStats {
  return {
    habitId: s.habit_id ?? s.habitId,
    totalDays: s.total_days ?? s.totalDays ?? 0,
    completedDays: s.completed_days ?? s.completedDays ?? 0,
    completionRate: s.completion_rate ?? s.completionRate ?? 0,
    currentStreak: s.current_streak ?? s.currentStreak ?? 0,
    longestStreak: s.longest_streak ?? s.longestStreak ?? 0,
    weeklyCompletions: s.weekly_completions ?? s.weeklyCompletions ?? [0, 0, 0, 0, 0, 0, 0],
    monthlyCompletions: s.monthly_completions ?? s.monthlyCompletions ?? {},
    completedToday: s.completed_today ?? s.completedToday ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSummary(s: any): HabitDashboardSummary {
  return {
    totalHabits: s.total_habits ?? s.totalHabits ?? 0,
    completedToday: s.completed_today ?? s.completedToday ?? 0,
    completionRateToday: s.completion_rate_today ?? s.completionRateToday ?? 0,
    longestCurrentStreak: s.longest_current_streak ?? s.longestCurrentStreak ?? 0,
    habitsNeedingCheckIn: s.habits_needing_check_in ?? s.habitsNeedingCheckIn ?? [],
  };
}

// ─── Serializers (camelCase TS → snake_case API) ──────────────────────────────

function serializeCreatePayload(payload: CreateHabitPayload) {
  return {
    name: payload.name,
    description: payload.description,
    aspect_id: payload.aspectId,
    icon: payload.icon,
  };
}

function serializeUpdatePayload(payload: UpdateHabitPayload) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  if (payload.name !== undefined) result.name = payload.name;
  if (payload.description !== undefined) result.description = payload.description;
  if (payload.aspectId !== undefined) result.aspect_id = payload.aspectId;
  if (payload.icon !== undefined) result.icon = payload.icon;
  if (payload.isActive !== undefined) result.is_active = payload.isActive;
  return result;
}

// ─── API factory ─────────────────────────────────────────────────────────────

export function createHabitsApi(client: AxiosInstance) {
  return {
    async getAll(): Promise<PaginatedHabitsResponse> {
      const res = await client.get('/api/habits');
      return {
        data: res.data.data.map(normalizeHabit),
        meta: res.data.meta,
      };
    },

    async get(id: string): Promise<Habit> {
      const res = await client.get(`/api/habits/${id}`);
      return normalizeHabit(res.data.data);
    },

    async create(payload: CreateHabitPayload): Promise<Habit> {
      const res = await client.post('/api/habits', serializeCreatePayload(payload));
      return normalizeHabit(res.data.data);
    },

    async update(id: string, payload: UpdateHabitPayload): Promise<Habit> {
      const res = await client.patch(`/api/habits/${id}`, serializeUpdatePayload(payload));
      return normalizeHabit(res.data.data);
    },

    async delete(id: string): Promise<void> {
      await client.delete(`/api/habits/${id}`);
    },

    async archive(id: string): Promise<Habit> {
      const res = await client.post(`/api/habits/${id}/archive`);
      return normalizeHabit(res.data.data);
    },

    async today(): Promise<HabitWithTodayEntry[]> {
      const res = await client.get('/api/habits/today');
      return res.data.data.map(normalizeHabitWithToday);
    },

    async summary(): Promise<HabitDashboardSummary> {
      const res = await client.get('/api/habits/summary');
      return normalizeSummary(res.data.data);
    },

    async stats(id: string): Promise<HabitStats> {
      const res = await client.get(`/api/habits/${id}/stats`);
      return normalizeStats(res.data.data);
    },

    async getEntries(id: string, from?: string, to?: string): Promise<HabitEntry[]> {
      const res = await client.get(`/api/habits/${id}/entries`, { params: { from, to } });
      return res.data.data.map(normalizeEntry);
    },

    async storeEntry(habitId: string, payload: CreateHabitEntryPayload): Promise<HabitEntry> {
      const res = await client.post(`/api/habits/${habitId}/entries`, payload);
      return normalizeEntry(res.data.data);
    },

    async updateEntry(habitId: string, entryId: string, payload: UpdateHabitEntryPayload): Promise<HabitEntry> {
      const res = await client.patch(`/api/habits/${habitId}/entries/${entryId}`, payload);
      return normalizeEntry(res.data.data);
    },
  };
}

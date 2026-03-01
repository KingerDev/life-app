import type { AxiosInstance } from 'axios';
import type { BeliefEntry, BeliefSuggestion, WeeklyBeliefStats, BeliefDomain } from '@/types/beliefs';

export interface PaginatedBeliefsResponse {
  data: BeliefEntry[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateBeliefPayload {
  date: string;
  domain: BeliefDomain;
  limiting_belief_id?: string;
  liberating_belief_id?: string;
  limiting_belief_custom?: string;
  liberating_belief_custom?: string;
  is_custom?: boolean;
  planned_action: string;
  suggestion_source?: 'wheel_of_life' | 'quest' | 'manual';
  related_aspect_id?: string;
  related_quest_id?: string;
}

export interface UpdateReflectionPayload {
  reflection: string;
  outcome_matched_prediction: boolean;
}

function normalizeBeliefEntry(entry: Record<string, unknown>): BeliefEntry {
  return {
    id: entry.id as string,
    date: entry.date as string,
    domain: entry.domain as BeliefDomain,
    limitingBeliefId: (entry.limiting_belief_id || entry.limitingBeliefId) as string | undefined,
    liberatingBeliefId: (entry.liberating_belief_id || entry.liberatingBeliefId) as string | undefined,
    limitingBeliefCustom: (entry.limiting_belief_custom || entry.limitingBeliefCustom) as string | undefined,
    liberatingBeliefCustom: (entry.liberating_belief_custom || entry.liberatingBeliefCustom) as string | undefined,
    isCustom: (entry.is_custom ?? entry.isCustom ?? false) as boolean,
    plannedAction: (entry.planned_action || entry.plannedAction) as string,
    reflection: entry.reflection as string | undefined,
    outcomeMatchedPrediction: (entry.outcome_matched_prediction ?? entry.outcomeMatchedPrediction) as boolean | undefined,
    suggestionSource: (entry.suggestion_source || entry.suggestionSource) as BeliefEntry['suggestionSource'],
    relatedAspectId: (entry.related_aspect_id || entry.relatedAspectId) as string | undefined,
    relatedQuestId: (entry.related_quest_id || entry.relatedQuestId) as string | undefined,
    createdAt: (entry.created_at || entry.createdAt) as string,
    updatedAt: (entry.updated_at || entry.updatedAt) as string,
  };
}

function normalizeSuggestion(suggestion: Record<string, unknown>): BeliefSuggestion {
  return {
    domain: suggestion.domain as BeliefSuggestion['domain'],
    domainLabel: suggestion.domainLabel as string,
    source: suggestion.source as BeliefSuggestion['source'],
    reason: suggestion.reason as string,
    aspectId: suggestion.aspectId as string | undefined,
    questId: suggestion.questId as string | undefined,
    questType: suggestion.questType as BeliefSuggestion['questType'],
    priority: suggestion.priority as number,
  };
}

function normalizeWeeklyStats(stats: Record<string, unknown>): WeeklyBeliefStats {
  return {
    weekStart: (stats.week_start || stats.weekStart) as string,
    weekEnd: (stats.week_end || stats.weekEnd) as string,
    totalEntries: (stats.total_entries ?? stats.totalEntries) as number,
    daysCompleted: (stats.days_completed ?? stats.daysCompleted) as number,
    daysInWeek: (stats.days_in_week ?? stats.daysInWeek) as number,
    domainCounts: (stats.domain_counts || stats.domainCounts) as Record<string, number>,
    mostCommonDomain: (stats.most_common_domain ?? stats.mostCommonDomain) as BeliefEntry['domain'] | null,
    mostCommonDomainLabel: (stats.most_common_domain_label ?? stats.mostCommonDomainLabel) as string | null,
    reflectionsCount: (stats.reflections_count ?? stats.reflectionsCount) as number,
    predictionNotMatchedPercent: (stats.prediction_not_matched_percent ?? stats.predictionNotMatchedPercent) as number | null,
    evidence: (stats.evidence || []) as WeeklyBeliefStats['evidence'],
  };
}

export function createBeliefsApi(client: AxiosInstance) {
  return {
    async getAll(page: number = 1): Promise<PaginatedBeliefsResponse> {
      const response = await client.get('/api/beliefs', { params: { page } });
      return {
        data: response.data.data.map(normalizeBeliefEntry),
        meta: response.data.meta,
      };
    },

    async getToday(): Promise<BeliefEntry | null> {
      const response = await client.get('/api/beliefs/today');
      return response.data.data ? normalizeBeliefEntry(response.data.data) : null;
    },

    async getSuggestions(): Promise<BeliefSuggestion[]> {
      const response = await client.get('/api/beliefs/suggestions');
      return response.data.data.map(normalizeSuggestion);
    },

    async getWeeklyStats(): Promise<WeeklyBeliefStats> {
      const response = await client.get('/api/beliefs/weekly-stats');
      return normalizeWeeklyStats(response.data.data);
    },

    async get(id: string): Promise<BeliefEntry> {
      const response = await client.get(`/api/beliefs/${id}`);
      return normalizeBeliefEntry(response.data.data);
    },

    async create(payload: CreateBeliefPayload): Promise<BeliefEntry> {
      const response = await client.post('/api/beliefs', payload);
      return normalizeBeliefEntry(response.data.data);
    },

    async updateReflection(id: string, payload: UpdateReflectionPayload): Promise<BeliefEntry> {
      const response = await client.patch(`/api/beliefs/${id}/reflection`, payload);
      return normalizeBeliefEntry(response.data.data);
    },

    async delete(id: string): Promise<void> {
      await client.delete(`/api/beliefs/${id}`);
    },
  };
}

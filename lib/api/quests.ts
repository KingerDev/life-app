import type { AxiosInstance } from 'axios';
import type { QuarterlyQuest, QuestType, Quarter } from '@/types/quarterly-quests';

export interface PaginatedQuestsResponse {
  data: QuarterlyQuest[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface CurrentQuarterResponse {
  data: { work: QuarterlyQuest | null; life: QuarterlyQuest | null };
  meta: { quarter: Quarter; year: number };
}

export interface CreateQuestPayload {
  quarter: Quarter;
  year: number;
  type: QuestType;
  discovery_answers?: {
    question1?: string; question2?: string; question3?: string;
    question4?: string; question5?: string;
  };
  main_goal: string;
  why_important: string;
  success_criteria: string;
  excitement: string;
  commitment: string;
}

export interface UpdateQuestPayload {
  discovery_answers?: {
    question1?: string; question2?: string; question3?: string;
    question4?: string; question5?: string;
  };
  main_goal?: string;
  why_important?: string;
  success_criteria?: string;
  excitement?: string;
  commitment?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeQuest(quest: any): QuarterlyQuest {
  return {
    id: quest.id,
    quarter: quest.quarter,
    year: quest.year,
    type: quest.type,
    discoveryAnswers: quest.discovery_answers || quest.discoveryAnswers,
    mainGoal: quest.main_goal || quest.mainGoal,
    whyImportant: quest.why_important || quest.whyImportant,
    successCriteria: quest.success_criteria || quest.successCriteria,
    excitement: quest.excitement,
    commitment: quest.commitment,
    createdAt: quest.created_at || quest.createdAt,
    updatedAt: quest.updated_at || quest.updatedAt,
  };
}

export function createQuestsApi(client: AxiosInstance) {
  return {
    async getAll(page: number = 1): Promise<PaginatedQuestsResponse> {
      const response = await client.get('/api/quests', { params: { page } });
      return { data: response.data.data.map(normalizeQuest), meta: response.data.meta };
    },

    async getCurrentQuarter(): Promise<CurrentQuarterResponse> {
      const response = await client.get('/api/quests/current-quarter');
      return {
        data: {
          work: response.data.data.work ? normalizeQuest(response.data.data.work) : null,
          life: response.data.data.life ? normalizeQuest(response.data.data.life) : null,
        },
        meta: response.data.meta,
      };
    },

    async get(id: string): Promise<QuarterlyQuest> {
      const response = await client.get(`/api/quests/${id}`);
      return normalizeQuest(response.data.data);
    },

    async create(payload: CreateQuestPayload): Promise<QuarterlyQuest> {
      const response = await client.post('/api/quests', payload);
      return normalizeQuest(response.data.data);
    },

    async update(id: string, payload: UpdateQuestPayload): Promise<QuarterlyQuest> {
      const response = await client.put(`/api/quests/${id}`, payload);
      return normalizeQuest(response.data.data);
    },

    async delete(id: string): Promise<void> {
      await client.delete(`/api/quests/${id}`);
    },
  };
}

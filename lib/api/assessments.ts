import { AxiosInstance } from 'axios';
import type { WeeklyAssessment, LifeAspectId } from '@/types/wheel-of-life';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AssessmentResponse {
  data: WeeklyAssessment;
  message?: string;
}

// Handles both snake_case (Laravel) and camelCase field names
function mapAssessment(raw: Record<string, unknown>): WeeklyAssessment {
  return {
    id: raw.id as string,
    weekStart: (raw.weekStart ?? raw.week_start) as string,
    weekEnd: (raw.weekEnd ?? raw.week_end) as string,
    createdAt: (raw.createdAt ?? raw.created_at) as string,
    updatedAt: (raw.updatedAt ?? raw.updated_at) as string,
    notes: raw.notes as string | undefined,
    ratings: ((raw.ratings ?? []) as Record<string, unknown>[]).map(r => ({
      aspectId: (r.aspectId ?? r.aspect_id) as LifeAspectId,
      value: r.value as number,
    })),
  };
}

export function createAssessmentsApi(client: AxiosInstance) {
  return {
    async getAll(page: number = 1): Promise<PaginatedResponse<WeeklyAssessment>> {
      const response = await client.get<PaginatedResponse<Record<string, unknown>>>(
        '/api/assessments',
        { params: { page } }
      );
      return {
        ...response.data,
        data: response.data.data.map(mapAssessment),
      };
    },

    async getLatest(): Promise<WeeklyAssessment | null> {
      const response = await this.getAll(1);
      return response.data[0] ?? null;
    },

    async getCurrentWeek(): Promise<WeeklyAssessment | null> {
      try {
        const response = await client.get<{ data: Record<string, unknown> }>('/api/assessments/current-week');
        return mapAssessment(response.data.data);
      } catch (error: unknown) {
        if ((error as { response?: { status?: number } }).response?.status === 404) {
          return null;
        }
        throw error;
      }
    },

    async get(id: string): Promise<WeeklyAssessment> {
      const response = await client.get<{ data: Record<string, unknown> }>(`/api/assessments/${id}`);
      return mapAssessment(response.data.data);
    },

    async create(assessment: Omit<WeeklyAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeeklyAssessment> {
      const response = await client.post<{ data: Record<string, unknown> }>('/api/assessments', {
        week_start: assessment.weekStart,
        week_end: assessment.weekEnd,
        ratings: assessment.ratings,
        notes: assessment.notes,
      });
      return mapAssessment(response.data.data);
    },

    async update(id: string, assessment: Partial<WeeklyAssessment>): Promise<WeeklyAssessment> {
      const response = await client.patch<{ data: Record<string, unknown> }>(`/api/assessments/${id}`, {
        week_start: assessment.weekStart,
        week_end: assessment.weekEnd,
        ratings: assessment.ratings,
        notes: assessment.notes,
      });
      return mapAssessment(response.data.data);
    },

    async delete(id: string): Promise<void> {
      await client.delete(`/api/assessments/${id}`);
    },
  };
}

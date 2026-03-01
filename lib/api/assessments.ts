import { AxiosInstance } from 'axios';
import type { WeeklyAssessment } from '@/types/wheel-of-life';

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

export function createAssessmentsApi(client: AxiosInstance) {
  return {
    async getAll(page: number = 1): Promise<PaginatedResponse<WeeklyAssessment>> {
      const response = await client.get<PaginatedResponse<WeeklyAssessment>>(
        '/api/assessments',
        { params: { page } }
      );
      return response.data;
    },

    async getCurrentWeek(): Promise<WeeklyAssessment | null> {
      try {
        const response = await client.get<AssessmentResponse>('/api/assessments/current-week');
        return response.data.data;
      } catch (error: unknown) {
        if ((error as { response?: { status?: number } }).response?.status === 404) {
          return null;
        }
        throw error;
      }
    },

    async get(id: string): Promise<WeeklyAssessment> {
      const response = await client.get<AssessmentResponse>(`/api/assessments/${id}`);
      return response.data.data;
    },

    async create(assessment: Omit<WeeklyAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeeklyAssessment> {
      const response = await client.post<AssessmentResponse>('/api/assessments', {
        week_start: assessment.weekStart,
        week_end: assessment.weekEnd,
        ratings: assessment.ratings,
        notes: assessment.notes,
      });
      return response.data.data;
    },

    async update(id: string, assessment: Partial<WeeklyAssessment>): Promise<WeeklyAssessment> {
      const response = await client.patch<AssessmentResponse>(`/api/assessments/${id}`, {
        week_start: assessment.weekStart,
        week_end: assessment.weekEnd,
        ratings: assessment.ratings,
        notes: assessment.notes,
      });
      return response.data.data;
    },

    async delete(id: string): Promise<void> {
      await client.delete(`/api/assessments/${id}`);
    },
  };
}

import { AxiosInstance } from 'axios';
import type { Note } from '@/types/notes';

export interface PaginatedNotesResponse {
  data: Note[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

function mapNote(raw: Record<string, unknown>): Note {
  return {
    id: raw.id as string,
    title: raw.title as string,
    content: raw.content as string,
    tags: (raw.tags ?? []) as string[],
    createdAt: (raw.createdAt ?? raw.created_at) as string,
    updatedAt: (raw.updatedAt ?? raw.updated_at) as string,
  };
}

export function createNotesApi(client: AxiosInstance) {
  return {
    async getAll(page: number = 1): Promise<PaginatedNotesResponse> {
      const response = await client.get<PaginatedNotesResponse>(
        '/api/notes',
        { params: { page } }
      );
      return {
        ...response.data,
        data: (response.data.data as unknown as Record<string, unknown>[]).map(mapNote),
      };
    },

    async getLatest(limit: number = 2): Promise<Note[]> {
      const response = await this.getAll(1);
      return response.data.slice(0, limit);
    },

    async get(id: string): Promise<Note> {
      const response = await client.get<{ data: Record<string, unknown> }>(`/api/notes/${id}`);
      return mapNote(response.data.data);
    },

    async create(note: Pick<Note, 'title' | 'content' | 'tags'>): Promise<Note> {
      const response = await client.post<{ data: Record<string, unknown> }>('/api/notes', note);
      return mapNote(response.data.data);
    },

    async update(id: string, note: Partial<Pick<Note, 'title' | 'content' | 'tags'>>): Promise<Note> {
      const response = await client.patch<{ data: Record<string, unknown> }>(`/api/notes/${id}`, note);
      return mapNote(response.data.data);
    },

    async delete(id: string): Promise<void> {
      await client.delete(`/api/notes/${id}`);
    },
  };
}

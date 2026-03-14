export const PREDEFINED_TAGS = ['Myšlienka', 'Nápad', 'Denník', 'Pracovné', 'Osobné'] as const;

export type PredefinedTag = typeof PREDEFINED_TAGS[number];

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

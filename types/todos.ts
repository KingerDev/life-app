import type { HabitAspectId } from './habits';

// ─── Priority ─────────────────────────────────────────────────────────────────

export const PRIORITY_OPTIONS = [
  { id: 'none'   as const, label: 'Bez priority', color: '#6b7280' },
  { id: 'low'    as const, label: 'Nízka',        color: '#3b82f6' },
  { id: 'medium' as const, label: 'Stredná',      color: '#f59e0b' },
  { id: 'high'   as const, label: 'Vysoká',       color: '#ef4444' },
] as const;

export type TodoPriority = (typeof PRIORITY_OPTIONS)[number]['id'];

// ─── Core domain objects ──────────────────────────────────────────────────────

export interface TodoList {
  id: string;
  userId: string;
  title: string;
  color?: string;
  todosCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  todoId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  listId?: string;
  title: string;
  description?: string;
  dueDate?: string; // 'YYYY-MM-DD'
  priority: TodoPriority;
  isCompleted: boolean;
  completedAt?: string;
  isArchived: boolean;
  sortOrder: number;
  aspectId?: HabitAspectId;
  items?: TodoItem[]; // eager loaded in detail
  createdAt: string;
  updatedAt: string;
}

// ─── Today view structure ─────────────────────────────────────────────────────

export interface TodoTodayData {
  overdue: Todo[];
  dueToday: Todo[];
  completedToday: Todo[];
}

// ─── Dashboard summary ────────────────────────────────────────────────────────

export interface TodoDashboardSummary {
  totalActive: number;
  completedToday: number;
  overdueCount: number;
  listsCount: number;
  topTodos: Todo[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateTodoListPayload {
  title: string;
  color?: string;
}

export interface UpdateTodoListPayload {
  title?: string;
  color?: string;
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TodoPriority;
  listId?: string;
  aspectId?: HabitAspectId;
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string;
  dueDate?: string | null;
  priority?: TodoPriority;
  listId?: string | null;
  aspectId?: HabitAspectId | null;
  isCompleted?: boolean;
  isArchived?: boolean;
  sortOrder?: number;
}

export interface CreateTodoItemPayload {
  title: string;
}

export interface UpdateTodoItemPayload {
  title?: string;
  isCompleted?: boolean;
  sortOrder?: number;
}

export interface PaginatedTodosResponse {
  data: Todo[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPriorityOption(priority: TodoPriority) {
  return PRIORITY_OPTIONS.find(p => p.id === priority) ?? PRIORITY_OPTIONS[0];
}

/** Returns true if the todo is overdue (due_date < today and not completed) */
export function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.isCompleted) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(todo.dueDate) < today;
}

/** Format due date as a human-readable label in Slovak */
export function formatDueDate(dueDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Dnes';
  if (diffDays === 1) return 'Zajtra';
  if (diffDays === -1) return 'Včera';
  if (diffDays < 0) return `Oneskorené o ${Math.abs(diffDays)} dní`;

  return due.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' });
}

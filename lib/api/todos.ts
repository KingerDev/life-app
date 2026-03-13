import type { AxiosInstance } from 'axios';
import type {
  TodoList, Todo, TodoItem, TodoTodayData, TodoDashboardSummary,
  CreateTodoListPayload, UpdateTodoListPayload,
  CreateTodoPayload, UpdateTodoPayload,
  CreateTodoItemPayload, UpdateTodoItemPayload,
  PaginatedTodosResponse,
} from '@/types/todos';

// ─── Normalizers (snake_case API → camelCase TS) ──────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTodoList(l: any): TodoList {
  return {
    id: l.id,
    userId: l.user_id ?? l.userId,
    title: l.title,
    color: l.color ?? undefined,
    todosCount: l.todos_count ?? l.todosCount ?? undefined,
    createdAt: l.created_at ?? l.createdAt,
    updatedAt: l.updated_at ?? l.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTodoItem(i: any): TodoItem {
  return {
    id: i.id,
    todoId: i.todo_id ?? i.todoId,
    title: i.title,
    isCompleted: i.is_completed ?? i.isCompleted ?? false,
    sortOrder: i.sort_order ?? i.sortOrder ?? 0,
    createdAt: i.created_at ?? i.createdAt,
    updatedAt: i.updated_at ?? i.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTodo(t: any): Todo {
  return {
    id: t.id,
    userId: t.user_id ?? t.userId,
    listId: t.list_id ?? t.listId ?? undefined,
    title: t.title,
    description: t.description ?? undefined,
    dueDate: t.due_date ?? t.dueDate
      ? (t.due_date ?? t.dueDate).split('T')[0]
      : undefined,
    priority: t.priority ?? 'none',
    isCompleted: t.is_completed ?? t.isCompleted ?? false,
    completedAt: t.completed_at ?? t.completedAt ?? undefined,
    isArchived: t.is_archived ?? t.isArchived ?? false,
    sortOrder: t.sort_order ?? t.sortOrder ?? 0,
    aspectId: t.aspect_id ?? t.aspectId ?? undefined,
    items: t.items ? t.items.map(normalizeTodoItem) : undefined,
    createdAt: t.created_at ?? t.createdAt,
    updatedAt: t.updated_at ?? t.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSummary(s: any): TodoDashboardSummary {
  return {
    totalActive: s.total_active ?? s.totalActive ?? 0,
    completedToday: s.completed_today ?? s.completedToday ?? 0,
    overdueCount: s.overdue_count ?? s.overdueCount ?? 0,
    listsCount: s.lists_count ?? s.listsCount ?? 0,
    topTodos: (s.top_todos ?? s.topTodos ?? []).map(normalizeTodo),
  };
}

// ─── Serializers (camelCase TS → snake_case API) ──────────────────────────────

function serializeCreateTodo(payload: CreateTodoPayload) {
  return {
    title: payload.title,
    description: payload.description,
    due_date: payload.dueDate,
    priority: payload.priority,
    list_id: payload.listId,
    aspect_id: payload.aspectId,
  };
}

function serializeUpdateTodo(payload: UpdateTodoPayload) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  if (payload.title !== undefined) result.title = payload.title;
  if (payload.description !== undefined) result.description = payload.description;
  if (payload.dueDate !== undefined) result.due_date = payload.dueDate;
  if (payload.priority !== undefined) result.priority = payload.priority;
  if (payload.listId !== undefined) result.list_id = payload.listId;
  if (payload.aspectId !== undefined) result.aspect_id = payload.aspectId;
  if (payload.isCompleted !== undefined) result.is_completed = payload.isCompleted;
  if (payload.isArchived !== undefined) result.is_archived = payload.isArchived;
  if (payload.sortOrder !== undefined) result.sort_order = payload.sortOrder;
  return result;
}

function serializeUpdateItem(payload: UpdateTodoItemPayload) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  if (payload.title !== undefined) result.title = payload.title;
  if (payload.isCompleted !== undefined) result.is_completed = payload.isCompleted;
  if (payload.sortOrder !== undefined) result.sort_order = payload.sortOrder;
  return result;
}

// ─── API factory ──────────────────────────────────────────────────────────────

export function createTodosApi(client: AxiosInstance) {
  return {
    // ── Todo Lists ──────────────────────────────────────────────────────────

    async getLists(): Promise<TodoList[]> {
      const res = await client.get('/api/todo-lists');
      return res.data.data.map(normalizeTodoList);
    },

    async createList(payload: CreateTodoListPayload): Promise<TodoList> {
      const res = await client.post('/api/todo-lists', payload);
      return normalizeTodoList(res.data.data);
    },

    async updateList(id: string, payload: UpdateTodoListPayload): Promise<TodoList> {
      const res = await client.patch(`/api/todo-lists/${id}`, payload);
      return normalizeTodoList(res.data.data);
    },

    async deleteList(id: string): Promise<void> {
      await client.delete(`/api/todo-lists/${id}`);
    },

    // ── Todos ───────────────────────────────────────────────────────────────

    async getAll(listId?: string): Promise<PaginatedTodosResponse> {
      const params = listId ? { list_id: listId } : {};
      const res = await client.get('/api/todos', { params });
      return {
        data: res.data.data.map(normalizeTodo),
        meta: res.data.meta,
      };
    },

    async get(id: string): Promise<Todo> {
      const res = await client.get(`/api/todos/${id}`);
      return normalizeTodo(res.data.data);
    },

    async create(payload: CreateTodoPayload): Promise<Todo> {
      const res = await client.post('/api/todos', serializeCreateTodo(payload));
      return normalizeTodo(res.data.data);
    },

    async update(id: string, payload: UpdateTodoPayload): Promise<Todo> {
      const res = await client.patch(`/api/todos/${id}`, serializeUpdateTodo(payload));
      return normalizeTodo(res.data.data);
    },

    async delete(id: string): Promise<void> {
      await client.delete(`/api/todos/${id}`);
    },

    async complete(id: string): Promise<Todo> {
      const res = await client.post(`/api/todos/${id}/complete`);
      return normalizeTodo(res.data.data);
    },

    async incomplete(id: string): Promise<Todo> {
      const res = await client.post(`/api/todos/${id}/incomplete`);
      return normalizeTodo(res.data.data);
    },

    async today(): Promise<TodoTodayData> {
      const res = await client.get('/api/todos/today');
      const d = res.data.data;
      return {
        overdue: (d.overdue ?? []).map(normalizeTodo),
        dueToday: (d.due_today ?? d.dueToday ?? []).map(normalizeTodo),
        completedToday: (d.completed_today ?? d.completedToday ?? []).map(normalizeTodo),
      };
    },

    async summary(): Promise<TodoDashboardSummary> {
      const res = await client.get('/api/todos/summary');
      return normalizeSummary(res.data.data);
    },

    // ── Todo Items (subtasks) ───────────────────────────────────────────────

    async getItems(todoId: string): Promise<TodoItem[]> {
      const res = await client.get(`/api/todos/${todoId}/items`);
      return res.data.data.map(normalizeTodoItem);
    },

    async createItem(todoId: string, payload: CreateTodoItemPayload): Promise<TodoItem> {
      const res = await client.post(`/api/todos/${todoId}/items`, payload);
      return normalizeTodoItem(res.data.data);
    },

    async updateItem(todoId: string, itemId: string, payload: UpdateTodoItemPayload): Promise<TodoItem> {
      const res = await client.patch(`/api/todos/${todoId}/items/${itemId}`, serializeUpdateItem(payload));
      return normalizeTodoItem(res.data.data);
    },

    async deleteItem(todoId: string, itemId: string): Promise<void> {
      await client.delete(`/api/todos/${todoId}/items/${itemId}`);
    },
  };
}

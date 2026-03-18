'use client';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/hooks/useApi';
import { getPriorityOption, formatDueDate, isOverdue } from '@/types/todos';
import type { Todo, TodoTodayData } from '@/types/todos';
import { HABIT_ASPECTS } from '@/types/habits';

interface TodoItemProps {
  todo: Todo;
  queryKey?: unknown[];
}

export function TodoItem({ todo, queryKey = ['todos', 'today'] }: TodoItemProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();

  const priorityOption = getPriorityOption(todo.priority);
  const overdue = isOverdue(todo);
  const aspectOption = todo.aspectId ? HABIT_ASPECTS.find(a => a.id === todo.aspectId) : null;

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (todo.isCompleted) {
        return api.todos.incomplete(todo.id);
      } else {
        return api.todos.complete(todo.id);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);

      // Optimistic update for today view
      queryClient.setQueryData(queryKey, (old: TodoTodayData | undefined) => {
        if (!old) return old;
        const updated = { ...todo, isCompleted: !todo.isCompleted };
        const removeFromList = (list: Todo[]) => list.filter(t => t.id !== todo.id);
        if (!todo.isCompleted) {
          // Moving to completedToday
          return {
            ...old,
            dueToday: removeFromList(old.dueToday),
            overdue: removeFromList(old.overdue),
            completedToday: [updated, ...old.completedToday],
          };
        } else {
          // Moving back to dueToday
          return {
            ...old,
            completedToday: removeFromList(old.completedToday),
            dueToday: [...old.dueToday, updated],
          };
        }
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(queryKey, context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['todos', 'summary'] });
    },
  });

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMutation.mutate();
  };

  return (
    <div className={cn(
      'flex items-center rounded-lg hover:bg-accent transition-colors group',
      todo.isCompleted && 'opacity-60'
    )}>
      {/* Checkbox — only toggles */}
      <button
        type="button"
        className="p-3 shrink-0 rounded-l-lg"
        onClick={toggle}
        disabled={toggleMutation.isPending}
        aria-label={todo.isCompleted ? 'Označiť ako nesplnené' : 'Označiť ako splnené'}
      >
        {toggleMutation.isPending ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : todo.isCompleted ? (
          <CheckCircle2 className="size-5 text-primary" />
        ) : (
          <Circle className="size-5 text-muted-foreground group-hover:text-foreground" />
        )}
      </button>

      {/* Text area — navigates to detail */}
      <Link href={`/todos/${todo.id}`} className="flex-1 min-w-0 py-3 pr-3">
        <p className={cn(
          'text-sm font-medium leading-snug',
          todo.isCompleted && 'line-through text-muted-foreground'
        )}>
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Priority badge (skip for 'none') */}
          {todo.priority !== 'none' && (
            <span
              className="text-xs font-medium"
              style={{ color: priorityOption.color }}
            >
              {priorityOption.label}
            </span>
          )}
          {/* Due date */}
          {todo.dueDate && (
            <span className={cn(
              'text-xs',
              overdue ? 'text-destructive font-medium' : 'text-muted-foreground'
            )}>
              {formatDueDate(todo.dueDate)}
            </span>
          )}
          {/* Aspect dot */}
          {aspectOption && (
            <span
              className="inline-block size-2 rounded-full shrink-0"
              style={{ backgroundColor: aspectOption.color }}
              title={aspectOption.label}
            />
          )}
          {/* Subtasks count */}
          {todo.items && todo.items.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {todo.items.filter(i => i.isCompleted).length}/{todo.items.length}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

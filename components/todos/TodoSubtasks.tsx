'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TodoItem } from '@/types/todos';

interface TodoSubtasksProps {
  todoId: string;
  items: TodoItem[];
}

export function TodoSubtasks({ todoId, items }: TodoSubtasksProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['todos', todoId] });
  };

  const toggleMutation = useMutation({
    mutationFn: (item: TodoItem) =>
      api.todos.updateItem(todoId, item.id, { isCompleted: !item.isCompleted }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => api.todos.deleteItem(todoId, itemId),
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => api.todos.createItem(todoId, { title }),
    onSuccess: () => {
      setNewTitle('');
      setIsAdding(false);
      invalidate();
    },
  });

  const handleCreate = () => {
    const title = newTitle.trim();
    if (!title) return;
    createMutation.mutate(title);
  };

  const completedCount = items.filter(i => i.isCompleted).length;

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          Podúlohy {items.length > 0 && `(${completedCount}/${items.length})`}
        </p>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-3" />
            Pridať
          </Button>
        )}
      </div>

      {/* Items */}
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2 group rounded-md hover:bg-accent px-1 py-0.5">
          <button
            type="button"
            onClick={() => toggleMutation.mutate(item)}
            disabled={toggleMutation.isPending}
            className="shrink-0"
            aria-label={item.isCompleted ? 'Zrušiť splnenie' : 'Splniť'}
          >
            {item.isCompleted ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <Circle className="size-4 text-muted-foreground" />
            )}
          </button>
          <span className={cn(
            'flex-1 text-sm',
            item.isCompleted && 'line-through text-muted-foreground'
          )}>
            {item.title}
          </span>
          <button
            type="button"
            onClick={() => deleteMutation.mutate(item.id)}
            disabled={deleteMutation.isPending}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            aria-label="Zmazať podúlohu"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}

      {/* Add new item */}
      {isAdding && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Názov podúlohy..."
            className="h-8 text-sm"
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTitle('');
              }
            }}
          />
          <Button
            size="sm"
            className="h-8 shrink-0"
            onClick={handleCreate}
            disabled={!newTitle.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              'Pridať'
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0"
            onClick={() => { setIsAdding(false); setNewTitle(''); }}
          >
            Zrušiť
          </Button>
        </div>
      )}

      {items.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground py-1">Žiadne podúlohy</p>
      )}
    </div>
  );
}

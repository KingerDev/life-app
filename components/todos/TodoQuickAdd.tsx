'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';
import { Input } from '@/components/ui/input';
import type { CreateTodoPayload } from '@/types/todos';

interface TodoQuickAddProps {
  defaultListId?: string;
  defaultDueDate?: string; // 'YYYY-MM-DD'
  onAdded?: () => void;
}

export function TodoQuickAdd({ defaultListId, defaultDueDate, onAdded }: TodoQuickAddProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [focused, setFocused] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: CreateTodoPayload) => api.todos.create(payload),
    onSuccess: () => {
      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['todos', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'list'] });
      onAdded?.();
    },
  });

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    mutation.mutate({
      title: trimmed,
      listId: defaultListId,
      dueDate: defaultDueDate,
    });
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${focused ? 'border-primary bg-background' : 'border-border bg-muted/30'}`}>
      {mutation.isPending ? (
        <Loader2 className="size-4 text-muted-foreground animate-spin shrink-0" />
      ) : (
        <Plus className="size-4 text-muted-foreground shrink-0" />
      )}
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Pridať úlohu... (Enter)"
        className="border-0 p-0 h-auto text-sm bg-transparent focus-visible:ring-0 shadow-none"
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
        }}
        disabled={mutation.isPending}
      />
    </div>
  );
}

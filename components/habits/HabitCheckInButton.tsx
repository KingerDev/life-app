'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { cn } from '@/lib/utils';
import { getTodayString } from '@/types/habits';
import type { HabitWithTodayEntry } from '@/types/habits';
import { CheckCircle2, Circle, Loader2, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HabitCheckInButtonProps {
  habit: HabitWithTodayEntry;
}

export function HabitCheckInButton({ habit }: HabitCheckInButtonProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(habit.todayEntry?.note ?? '');

  const today = getTodayString();
  const isCompleted = habit.todayEntry?.completed ?? false;

  const mutation = useMutation({
    mutationFn: async ({ completed, note }: { completed: boolean; note?: string }) => {
      const todayEntry = habit.todayEntry;
      if (todayEntry) {
        return api.habits.updateEntry(habit.id, todayEntry.id, { completed, note });
      }
      return api.habits.storeEntry(habit.id, { date: today, completed, note });
    },
    onMutate: async ({ completed }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['habits', 'today'] });
      const prev = queryClient.getQueryData(['habits', 'today']);
      queryClient.setQueryData(['habits', 'today'], (old: HabitWithTodayEntry[] | undefined) =>
        old?.map(h =>
          h.id === habit.id
            ? {
                ...h,
                todayEntry: h.todayEntry
                  ? { ...h.todayEntry, completed }
                  : { id: 'temp', habitId: h.id, date: today, completed, createdAt: '', updatedAt: '' },
              }
            : h
        )
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['habits', 'today'], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const toggle = () => {
    mutation.mutate({ completed: !isCompleted, note: noteText || undefined });
  };

  const saveNote = () => {
    mutation.mutate({ completed: isCompleted, note: noteText || undefined });
    setNoteOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center rounded-lg hover:bg-accent transition-colors">
        {/* Checkbox — len toggle, bez navigácie */}
        <button
          type="button"
          className="p-3 shrink-0 rounded-l-lg"
          onClick={toggle}
          disabled={mutation.isPending}
          aria-label={isCompleted ? 'Zrušiť splnenie' : 'Označiť ako splnené'}
        >
          {mutation.isPending ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : isCompleted ? (
            <CheckCircle2 className="size-5" style={{ color: habit.color }} />
          ) : (
            <Circle className="size-5 text-muted-foreground" />
          )}
        </button>

        {/* Text plocha — naviguje na detail */}
        <Link href={`/habits/${habit.id}`} className="flex-1 min-w-0 py-3 pr-2">
          <p className={cn('text-sm font-medium', isCompleted && 'line-through text-muted-foreground')}>
            {habit.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{habit.aspectLabel}</p>
        </Link>

        {/* Poznámka */}
        <button
          type="button"
          onClick={() => setNoteOpen(!noteOpen)}
          className={cn(
            'p-3 rounded-r-lg transition-colors hover:bg-background shrink-0',
            habit.todayEntry?.note ? 'text-primary' : 'text-muted-foreground'
          )}
          aria-label="Pridať poznámku"
        >
          <MessageSquare className="size-4" />
        </button>
      </div>

      {noteOpen && (
        <div className="pl-11 pr-3 space-y-2">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Krátka poznámka..."
            className="text-sm resize-none h-16"
            maxLength={280}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setNoteOpen(false)}>Zrušiť</Button>
            <Button size="sm" onClick={saveNote} disabled={mutation.isPending}>Uložiť</Button>
          </div>
        </div>
      )}
    </div>
  );
}

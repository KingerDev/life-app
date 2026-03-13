'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PRIORITY_OPTIONS } from '@/types/todos';
import type { TodoPriority } from '@/types/todos';
import { cn } from '@/lib/utils';

export default function CreateTodoPage() {
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('none');
  const [listId, setListId] = useState<string>('');

  const { data: lists } = useQuery({
    queryKey: ['todos', 'lists'],
    queryFn: () => api.todos.getLists(),
  });

  const mutation = useMutation({
    mutationFn: () => api.todos.create({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      listId: listId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      router.push('/todos');
    },
  });

  const canSubmit = title.trim().length > 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/todos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nová úloha</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Názov *</label>
            <Input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Čo treba urobiť?"
              maxLength={100}
              onKeyDown={e => { if (e.key === 'Enter' && canSubmit) mutation.mutate(); }}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Popis (voliteľné)</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailný popis úlohy..."
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Termín (voliteľné)</label>
            <Input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Priorita</label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITY_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPriority(option.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                    priority === option.id
                      ? 'border-transparent text-white'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  )}
                  style={priority === option.id ? { backgroundColor: option.color } : {}}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {lists && lists.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Zoznam (voliteľné)</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setListId('')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-all',
                    listId === ''
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  )}
                >
                  Bez zoznamu
                </button>
                {lists.map(list => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => setListId(list.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      listId === list.id
                        ? 'border-transparent text-white'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    )}
                    style={listId === list.id ? { backgroundColor: list.color ?? '#6b7280' } : {}}
                  >
                    {list.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              disabled={!canSubmit || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Ukladám...
                </>
              ) : (
                'Vytvoriť úlohu'
              )}
            </Button>
            <Link href="/todos">
              <Button variant="outline">Zrušiť</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

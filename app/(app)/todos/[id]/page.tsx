'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TodoSubtasks } from '@/components/todos/TodoSubtasks';
import {
  ArrowLeft, CheckCircle2, Circle, Loader2, Trash2, Save,
} from 'lucide-react';
import Link from 'next/link';
import { PRIORITY_OPTIONS } from '@/types/todos';
import type { TodoPriority } from '@/types/todos';
import { HABIT_ASPECTS } from '@/types/habits';
import type { HabitAspectId } from '@/types/habits';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDueDate } from '@/types/todos';

export default function TodoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: todo, isLoading } = useQuery({
    queryKey: ['todos', id],
    queryFn: () => api.todos.get(id),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<TodoPriority>('none');
  const [editAspectId, setEditAspectId] = useState<HabitAspectId | ''>('');

  const startEditing = () => {
    if (!todo) return;
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setEditDueDate(todo.dueDate ?? '');
    setEditPriority(todo.priority);
    setEditAspectId((todo.aspectId ?? '') as HabitAspectId | '');
    setIsEditing(true);
  };

  const toggleMutation = useMutation({
    mutationFn: () => todo?.isCompleted ? api.todos.incomplete(id) : api.todos.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', id] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'summary'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.todos.update(id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      dueDate: editDueDate || null,
      priority: editPriority,
      aspectId: editAspectId || null,
    }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['todos', id] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'today'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.todos.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      router.push('/todos');
    },
  });

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  if (!todo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Úloha nenájdená</p>
        <Link href="/todos"><Button className="mt-4">Späť na úlohy</Button></Link>
      </div>
    );
  }

  const priorityOption = PRIORITY_OPTIONS.find(p => p.id === todo.priority) ?? PRIORITY_OPTIONS[0];
  const aspectOption = todo.aspectId ? HABIT_ASPECTS.find(a => a.id === todo.aspectId) : null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/todos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex-1 truncate">Detail úlohy</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Zmazať úlohu?</AlertDialogTitle>
              <AlertDialogDescription>Táto akcia je nezvratná. Úloha bude trvalo vymazaná.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Zrušiť</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Zmazať'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Main card */}
      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Complete toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
              className="shrink-0"
            >
              {toggleMutation.isPending ? (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              ) : todo.isCompleted ? (
                <CheckCircle2 className="size-6 text-primary" />
              ) : (
                <Circle className="size-6 text-muted-foreground" />
              )}
            </button>
            {!isEditing ? (
              <p className={cn('text-lg font-semibold flex-1', todo.isCompleted && 'line-through text-muted-foreground')}>
                {todo.title}
              </p>
            ) : (
              <Input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="flex-1 text-lg font-semibold"
                maxLength={100}
              />
            )}
          </div>

          {/* Meta info (non-editing) */}
          {!isEditing && (
            <div className="flex flex-wrap gap-3">
              {todo.priority !== 'none' && (
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: priorityOption.color }}
                >
                  {priorityOption.label}
                </span>
              )}
              {todo.dueDate && (
                <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-full border border-border">
                  {formatDueDate(todo.dueDate)}
                </span>
              )}
              {aspectOption && (
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: aspectOption.color }}
                >
                  {aspectOption.label}
                </span>
              )}
              {todo.isCompleted && todo.completedAt && (
                <span className="text-xs text-muted-foreground">
                  Splnené {new Date(todo.completedAt).toLocaleDateString('sk-SK')}
                </span>
              )}
            </div>
          )}

          {/* Description (non-editing) */}
          {!isEditing && todo.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{todo.description}</p>
          )}

          {/* Edit form */}
          {isEditing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Popis</label>
                <Textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Detailný popis úlohy..."
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Termín</label>
                <Input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Priorita</label>
                <div className="flex gap-2 flex-wrap">
                  {PRIORITY_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setEditPriority(option.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                        editPriority === option.id
                          ? 'border-transparent text-white'
                          : 'border-border text-muted-foreground hover:border-foreground/30'
                      )}
                      style={editPriority === option.id ? { backgroundColor: option.color } : {}}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Oblasť života</label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_ASPECTS.map(aspect => (
                    <button
                      key={aspect.id}
                      type="button"
                      onClick={() => setEditAspectId(editAspectId === aspect.id ? '' : aspect.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs border transition-all',
                        editAspectId === aspect.id
                          ? 'text-white border-transparent'
                          : 'border-border text-muted-foreground hover:border-foreground/30'
                      )}
                      style={editAspectId === aspect.id ? { backgroundColor: aspect.color } : {}}
                    >
                      {aspect.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => updateMutation.mutate()}
                  disabled={!editTitle.trim() || updateMutation.isPending}
                  className="gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Uložiť
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Zrušiť</Button>
              </div>
            </div>
          )}

          {/* Edit button (non-editing) */}
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Upraviť
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Subtasks */}
      <Card>
        <CardContent className="p-6">
          <TodoSubtasks todoId={id} items={todo.items ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}

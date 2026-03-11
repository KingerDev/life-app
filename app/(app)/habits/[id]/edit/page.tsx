'use client';

import { use, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useRouter } from 'next/navigation';
import { HABIT_ASPECTS, type HabitAspectId } from '@/types/habits';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: habit, isLoading } = useQuery({
    queryKey: ['habits', id],
    queryFn: () => api.habits.get(id),
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspectId, setAspectId] = useState<HabitAspectId | null>(null);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description ?? '');
      setAspectId(habit.aspectId);
    }
  }, [habit]);

  const mutation = useMutation({
    mutationFn: () => api.habits.update(id, {
      name: name.trim(),
      description: description.trim() || undefined,
      aspectId: aspectId!,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      router.push(`/habits/${id}`);
    },
  });

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/habits/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Upraviť návyk</h1>
      </div>

      <div className="space-y-4">
        {/* Area selector */}
        <div className="space-y-2">
          <Label>Oblasť života</Label>
          <div className="grid grid-cols-2 gap-2">
            {HABIT_ASPECTS.map(aspect => (
              <button
                key={aspect.id}
                type="button"
                onClick={() => setAspectId(aspect.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all text-sm',
                  aspectId === aspect.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                )}
              >
                <div
                  className="size-6 rounded shrink-0 text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: aspect.color }}
                >
                  {aspect.label[0]}
                </div>
                <span className="leading-tight flex-1">{aspect.label}</span>
                {aspectId === aspect.id && <Check className="size-3 shrink-0 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Názov *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={80}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Popis</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={280}
            className="resize-none h-20"
          />
        </div>

        {mutation.error && (
          <Card className="border-destructive">
            <CardContent className="p-3 text-sm text-destructive">
              Nastala chyba. Skús to znova.
            </CardContent>
          </Card>
        )}

        <Button
          className="w-full"
          disabled={!name.trim() || !aspectId || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Ukladám...' : 'Uložiť zmeny'}
        </Button>
      </div>
    </div>
  );
}

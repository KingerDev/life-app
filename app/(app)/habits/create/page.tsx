'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { HABIT_ASPECTS, type HabitAspectId } from '@/types/habits';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CreateHabitPage() {
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [aspectId, setAspectId] = useState<HabitAspectId | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.habits.create({
      name: name.trim(),
      description: description.trim() || undefined,
      aspectId: aspectId!,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      router.push('/habits');
    },
  });

  const selectedAspect = HABIT_ASPECTS.find(a => a.id === aspectId);

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/habits">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Nový návyk</h1>
          <p className="text-sm text-muted-foreground">Krok {step} z 2</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        <div className={cn('h-1.5 flex-1 rounded-full', step >= 1 ? 'bg-primary' : 'bg-muted')} />
        <div className={cn('h-1.5 flex-1 rounded-full', step >= 2 ? 'bg-primary' : 'bg-muted')} />
      </div>

      {/* Step 1: Choose area */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="font-medium">Vyber oblasť života</p>
          <div className="grid grid-cols-2 gap-3">
            {HABIT_ASPECTS.map(aspect => (
              <button
                key={aspect.id}
                type="button"
                onClick={() => setAspectId(aspect.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 text-left transition-all',
                  aspectId === aspect.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                )}
              >
                <div
                  className="size-8 rounded-md flex items-center justify-center shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: aspect.color }}
                >
                  {aspect.label[0]}
                </div>
                <span className="text-sm font-medium leading-tight">{aspect.label}</span>
                {aspectId === aspect.id && (
                  <Check className="size-4 ml-auto shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>

          <Button
            className="w-full gap-2"
            disabled={!aspectId}
            onClick={() => setStep(2)}
          >
            Ďalej <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Name & description */}
      {step === 2 && (
        <div className="space-y-4">
          {selectedAspect && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-white text-sm"
              style={{ backgroundColor: selectedAspect.color }}
            >
              <span>{selectedAspect.label}</span>
              <button
                type="button"
                className="ml-auto text-white/80 hover:text-white text-xs underline"
                onClick={() => setStep(1)}
              >
                Zmeniť
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Názov návyku *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Napr. Ranná meditácia"
              maxLength={80}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis (nepovinný)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Prečo je tento návyk dôležitý..."
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

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ArrowLeft className="size-4 mr-2" />
              Späť
            </Button>
            <Button
              className="flex-1"
              disabled={!name.trim() || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Ukladám...' : 'Vytvoriť návyk'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

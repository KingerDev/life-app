'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, FlaskConical } from 'lucide-react';
import { Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe } from 'lucide-react';
import { getDomainInfo } from '@/types/beliefs';
import { cn } from '@/lib/utils';

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe,
};

function DomainIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const Icon = DOMAIN_ICONS[iconName] ?? FlaskConical;
  return <Icon className={className} style={style} />;
}

interface CheckInState {
  completed: boolean;
  notes: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();

  const { data: activeExperiments, isLoading } = useQuery({
    queryKey: ['experiments', 'active'],
    queryFn: () => api.experiments.getActive(),
  });

  const { data: todayCheckIns } = useQuery({
    queryKey: ['experiments', 'today-checkins'],
    queryFn: () => api.experiments.getTodayCheckIns(),
  });

  const [checkInStates, setCheckInStates] = useState<Record<string, CheckInState>>({});

  const experimentsNeedingCheckIn = (activeExperiments ?? []).filter(exp => {
    const completed = (todayCheckIns ?? []).some(c => c.experimentId === exp.id && c.completed);
    return !completed;
  });

  const getState = (id: string): CheckInState =>
    checkInStates[id] ?? { completed: false, notes: '' };

  const toggleCompleted = (id: string) => {
    setCheckInStates(prev => ({
      ...prev,
      [id]: { ...getState(id), completed: !getState(id).completed },
    }));
  };

  const updateNotes = (id: string, notes: string) => {
    setCheckInStates(prev => ({
      ...prev,
      [id]: { ...getState(id), notes },
    }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      await Promise.all(
        experimentsNeedingCheckIn.map(exp => {
          const state = getState(exp.id);
          return api.experiments.addCheckIn(exp.id, {
            date: today,
            completed: state.completed,
            notes: state.notes || undefined,
          });
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      router.push('/experiments');
    },
  });

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  if (experimentsNeedingCheckIn.length === 0) {
    return (
      <div className="max-w-xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-bold">Check-in</h1>
        </div>
        <div className="flex flex-col items-center text-center py-16 gap-4">
          <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="size-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold">Všetko splnené!</h2>
          <p className="text-muted-foreground">Všetky dnešné check-iny sú už hotové</p>
          <Button variant="outline" onClick={() => router.back()}>Späť</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Check-in</h1>
          <p className="text-muted-foreground text-sm">Označ, ktoré experimenty si dnes splnil/a</p>
        </div>
      </div>

      {/* Experiments */}
      <div className="space-y-4">
        {experimentsNeedingCheckIn.map(experiment => {
          const domainInfo = getDomainInfo(experiment.domainId as any);
          const color = domainInfo?.color ?? '#8b5cf6';
          const state = getState(experiment.id);

          return (
            <Card key={experiment.id}>
              <CardContent className="p-4 space-y-4">
                {/* Experiment Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="size-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <DomainIcon iconName={domainInfo?.icon ?? 'FlaskConical'} className="size-6" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{domainInfo?.label ?? experiment.domainId}</p>
                    <p className="font-semibold line-clamp-2">{experiment.pact.action}</p>
                  </div>
                </div>

                {/* Completed Toggle */}
                <button
                  type="button"
                  onClick={() => toggleCompleted(experiment.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl transition-colors',
                    state.completed
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-muted/50 border border-transparent hover:bg-muted'
                  )}
                >
                  <div className={cn(
                    'size-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                    state.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                  )}>
                    {state.completed && (
                      <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={cn(
                    'text-sm font-medium',
                    state.completed ? 'text-green-700 dark:text-green-300' : 'text-foreground'
                  )}>
                    Splnil/a som to dnes
                  </span>
                </button>

                {/* Notes */}
                <div className="space-y-1">
                  <Label className="text-sm">Poznámky (voliteľné)</Label>
                  <Textarea
                    value={state.notes}
                    onChange={e => updateNotes(experiment.id, e.target.value)}
                    placeholder="Ako to išlo? Čo si zistil/a?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Save Button */}
      <Button
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Ukladám...' : 'Uložiť všetky check-iny'}
      </Button>

      {mutation.isError && (
        <p className="text-sm text-destructive text-center">Nepodarilo sa uložiť check-iny</p>
      )}
    </div>
  );
}

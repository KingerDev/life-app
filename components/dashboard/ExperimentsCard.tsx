'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useModulesStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FlaskConical, ChevronRight, Plus, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { getDomainInfo } from '@/types/beliefs';
import { getProgressPercentage } from '@/types/experiments';

export function ExperimentsCard() {
  const api = useApi();
  const { experimentsEnabled } = useModulesStore();

  const { data: experiments, isLoading: loadingExps } = useQuery({
    queryKey: ['experiments', 'active'],
    queryFn: () => api.experiments.getActive(),
    enabled: experimentsEnabled,
  });

  const { data: todayCheckIns, isLoading: loadingCheckIns } = useQuery({
    queryKey: ['experiments', 'check-ins', 'today'],
    queryFn: () => api.experiments.getTodayCheckIns(),
    enabled: experimentsEnabled,
  });

  if (!experimentsEnabled) return null;

  const isLoading = loadingExps || loadingCheckIns;
  const activeCount = experiments?.length ?? 0;
  const needsCheckIn = experiments?.filter(exp => {
    const today = new Date().toISOString().split('T')[0];
    return !todayCheckIns?.some(ci => ci.experimentId === exp.id && ci.date === today);
  }) ?? [];

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-5 text-violet-400" />
          <CardTitle className="text-base">Experimenty</CardTitle>
          <Badge variant="secondary" className="text-xs">{activeCount}/3</Badge>
        </div>
        <Link href="/experiments">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Detail <ChevronRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Načítavam...</div>
          </div>
        ) : activeCount === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Žiadne aktívne experimenty</p>
            <Link href="/experiments/create">
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Nový experiment
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Check-in status */}
            {needsCheckIn.length > 0 && (
              <Link href="/experiments/check-in">
                <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 flex items-center gap-3 cursor-pointer hover:bg-violet-500/15 transition-colors">
                  <Clock className="size-4 text-violet-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Check-in čaká</p>
                    <p className="text-xs text-muted-foreground">{needsCheckIn.length} experiment(ov) treba potvrdiť</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            )}

            {/* Experiments list */}
            {experiments?.slice(0, 3).map(exp => {
              const progress = getProgressPercentage(exp.startDate, exp.endDate);
              const domainInfo = getDomainInfo(exp.domainId);
              const checkedInToday = todayCheckIns?.some(ci => ci.experimentId === exp.id);

              return (
                <div key={exp.id} className="rounded-lg bg-muted p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: domainInfo?.color ?? '#8b5cf6' }}
                      />
                      <span className="text-sm font-medium truncate">{exp.pact.action}</span>
                    </div>
                    {checkedInToday ? (
                      <CheckCircle2 className="size-4 text-green-400 shrink-0" />
                    ) : (
                      <Clock className="size-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{progress}% dokončené</p>
                </div>
              );
            })}

            {activeCount < 3 && (
              <Link href="/experiments/create">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <Plus className="size-3" />
                  Pridať experiment
                </Button>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

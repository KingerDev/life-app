'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useModulesStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, ChevronRight, Plus, Briefcase, Smile } from 'lucide-react';
import Link from 'next/link';
import { getQuarterProgress, getCurrentQuarter, QUARTER_LABELS } from '@/types/quarterly-quests';

export function QuestsCard() {
  const api = useApi();
  const { questsEnabled } = useModulesStore();

  const { data: currentQuarter, isLoading } = useQuery({
    queryKey: ['quests', 'current-quarter'],
    queryFn: () => api.quests.getCurrentQuarter(),
    enabled: questsEnabled,
  });

  if (!questsEnabled) return null;

  const progress = getQuarterProgress();
  const quarter = getCurrentQuarter();

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-violet-400" />
          <CardTitle className="text-base">Ciele štvrťroka</CardTitle>
        </div>
        <Link href="/quests">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Detail <ChevronRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quarter progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{QUARTER_LABELS[quarter]}</span>
            <span>{progress.daysRemaining} dní zostáva</span>
          </div>
          <Progress value={progress.percentage} className="h-1.5" />
        </div>

        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Načítavam...</div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Work Quest */}
            {currentQuarter?.data.work ? (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="size-3.5 text-violet-400 shrink-0" />
                  <span className="text-xs font-medium text-violet-400">Práca</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{currentQuarter.data.work.mainGoal}</p>
              </div>
            ) : (
              <Link href="/quests/create?type=work">
                <div className="rounded-lg border border-dashed border-border p-3 flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors">
                  <Briefcase className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Pridať pracovný cieľ</p>
                  </div>
                  <Plus className="size-4 text-muted-foreground" />
                </div>
              </Link>
            )}

            {/* Life Quest */}
            {currentQuarter?.data.life ? (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Smile className="size-3.5 text-green-400 shrink-0" />
                  <span className="text-xs font-medium text-green-400">Život</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{currentQuarter.data.life.mainGoal}</p>
              </div>
            ) : (
              <Link href="/quests/create?type=life">
                <div className="rounded-lg border border-dashed border-border p-3 flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors">
                  <Smile className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Pridať životný cieľ</p>
                  </div>
                  <Plus className="size-4 text-muted-foreground" />
                </div>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

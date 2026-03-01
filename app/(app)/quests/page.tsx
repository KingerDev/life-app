'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { History, Target, Briefcase, Heart, Info, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  formatQuarterLabel, getQuarterDescription, getQuarterProgress,
  getDaysRemainingInQuarter, getCurrentQuarter, getCurrentQuarterAndYear,
  type QuarterlyQuest,
} from '@/types/quarterly-quests';

function QuestCard({
  quest, type, onCreateHref,
}: {
  quest: QuarterlyQuest | null | undefined;
  type: 'work' | 'life';
  onCreateHref: string;
}) {
  const isWork = type === 'work';
  const color = isWork ? '#3b82f6' : '#10b981';
  const Icon = isWork ? Briefcase : Heart;
  const label = isWork ? 'Práca' : 'Život';

  if (!quest) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="size-6" style={{ color }} />
          </div>
          <div>
            <p className="font-medium">{label} – žiadny cieľ</p>
            <p className="text-sm text-muted-foreground">Pridaj cieľ pre tento štvrťrok</p>
          </div>
          <Link href={onCreateHref}>
            <Button size="sm" style={{ backgroundColor: color }} className="text-white hover:opacity-90">
              <Plus className="size-4 mr-2" />Vytvoriť cieľ
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/quests/${quest.id}`}>
      <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
              <Icon className="size-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium line-clamp-2">{quest.mainGoal}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-1" />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{quest.successCriteria}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function QuestsPage() {
  const api = useApi();
  const { quarter, year } = getCurrentQuarterAndYear();
  const progress = getQuarterProgress();
  const daysRemaining = getDaysRemainingInQuarter();

  const { data, isLoading } = useQuery({
    queryKey: ['quests', 'current-quarter'],
    queryFn: () => api.quests.getCurrentQuarter(),
  });

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  const workQuest = data?.data.work;
  const lifeQuest = data?.data.life;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Štvrťročné ciele</h1>
          <p className="text-muted-foreground text-sm">Jedna Hlavná Úloha pre prácu a život</p>
        </div>
        <Link href="/quests/history">
          <Button variant="ghost" size="icon">
            <History className="size-5" />
          </Button>
        </Link>
      </div>

      {/* Quarter Progress */}
      <Card className="bg-purple-500/5 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-purple-700 dark:text-purple-300 font-semibold">
                {formatQuarterLabel(quarter, year)}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">{getQuarterDescription(quarter)}</p>
            </div>
            <span className="text-purple-700 dark:text-purple-300 font-medium">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-3 mb-2" />
          <p className="text-sm text-purple-600 dark:text-purple-400">
            {daysRemaining} dní zostáva do konca štvrťroku
          </p>
        </CardContent>
      </Card>

      {/* Work Quest */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Briefcase className="size-4 text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold">Práca</h2>
        </div>
        <QuestCard quest={workQuest} type="work" onCreateHref="/quests/create?type=work" />
      </div>

      {/* Life Quest */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Heart className="size-4 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold">Život</h2>
        </div>
        <QuestCard quest={lifeQuest} type="life" onCreateHref="/quests/create?type=life" />
      </div>

      {/* Info Box */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="size-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Čo je Štvrťročný cieľ?</p>
              <p className="text-sm text-muted-foreground">
                Stanovte si jeden hlavný cieľ pre prácu a jeden pre osobný život na nasledujúce 3 mesiace.
                Sústredenie sa na menej cieľov vedie k lepším výsledkom.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

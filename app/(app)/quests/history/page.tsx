'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Briefcase, Heart, Target } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  QUEST_TYPE_LABELS,
  formatQuarterLabel, isCurrentQuarter,
  type Quarter, type QuarterlyQuest,
} from '@/types/quarterly-quests';

interface GroupedQuests {
  quarter: Quarter;
  year: number;
  quests: QuarterlyQuest[];
}

export default function QuestsHistoryPage() {
  const api = useApi();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quests', 'all'],
    queryFn: () => api.quests.getAll(),
  });

  const allQuests = data?.data ?? [];
  const years = [...new Set(allQuests.map(q => q.year))].sort((a, b) => b - a);
  const filteredQuests = selectedYear ? allQuests.filter(q => q.year === selectedYear) : allQuests;

  const groupedQuests: GroupedQuests[] = [];
  filteredQuests.forEach(quest => {
    const existing = groupedQuests.find(g => g.quarter === quest.quarter && g.year === quest.year);
    if (existing) existing.quests.push(quest);
    else groupedQuests.push({ quarter: quest.quarter, year: quest.year, quests: [quest] });
  });
  groupedQuests.sort((a, b) => a.year !== b.year ? b.year - a.year : b.quarter - a.quarter);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/quests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">História cieľov</h1>
          <p className="text-muted-foreground text-sm">Všetky minulé štvrťročné ciele</p>
        </div>
      </div>

      {/* Year Filter */}
      {years.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedYear(null)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedYear === null ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Všetky
          </button>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedYear === y ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>
      ) : groupedQuests.length === 0 ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Žiadne ciele</h3>
            <p className="text-sm text-muted-foreground">Zatiaľ ste nevytvorili žiadne štvrťročné ciele.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedQuests.map(group => {
            const isCurrent = isCurrentQuarter(group.quarter, group.year);
            return (
              <div key={`${group.year}-${group.quarter}`}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-lg font-semibold">{formatQuarterLabel(group.quarter, group.year)}</h2>
                  {isCurrent && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Aktuálny
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {group.quests.map(quest => {
                    const isWork = quest.type === 'work';
                    const color = isWork ? '#3b82f6' : '#10b981';
                    const QIcon = isWork ? Briefcase : Heart;
                    return (
                      <Link key={quest.id} href={`/quests/${quest.id}`}>
                        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                          <CardContent className="p-4 flex items-start gap-3">
                            <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                              <QIcon className="size-5" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-muted-foreground">{QUEST_TYPE_LABELS[quest.type]}</p>
                              <p className="font-medium line-clamp-2">{quest.mainGoal}</p>
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-1" />
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useModulesStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ChevronRight, Plus, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getDomainInfo, getDomainLabel, getLimitingBeliefText } from '@/types/beliefs';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

const DAYS_SK = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

export function BeliefsCard() {
  const api = useApi();
  const { beliefsEnabled } = useModulesStore();

  const { data: todayBelief, isLoading: loadingToday } = useQuery({
    queryKey: ['beliefs', 'today'],
    queryFn: () => api.beliefs.getToday(),
    enabled: beliefsEnabled,
  });

  const { data: weeklyStats, isLoading: loadingStats } = useQuery({
    queryKey: ['beliefs', 'weekly-stats'],
    queryFn: () => api.beliefs.getWeeklyStats(),
    enabled: beliefsEnabled,
  });

  if (!beliefsEnabled) return null;

  const isLoading = loadingToday || loadingStats;

  // Build 7-day chart data
  const chartData = DAYS_SK.map((day, i) => {
    const completed = weeklyStats ? weeklyStats.daysCompleted > i : false;
    return { day, value: completed ? 1 : 0 };
  });

  const domainInfo = todayBelief ? getDomainInfo(todayBelief.domain) : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-blue-400" />
          <CardTitle className="text-base">Presvedčenia</CardTitle>
        </div>
        <Link href="/beliefs">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Detail <ChevronRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Načítavam...</div>
          </div>
        ) : (
          <>
            {/* Weekly progress chart */}
            {weeklyStats && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tento týždeň</span>
                  <span className="font-semibold text-blue-400">
                    {weeklyStats.daysCompleted}/{weeklyStats.daysInWeek} dní
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={chartData} barSize={20}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Bar dataKey="value" radius={4}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.value ? '#3b82f6' : 'hsl(var(--muted))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Today's belief or CTA */}
            {todayBelief ? (
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-400 shrink-0" />
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: `${domainInfo?.color}20`, color: domainInfo?.color }}
                    className="text-xs"
                  >
                    {getDomainLabel(todayBelief.domain)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 italic">
                  &ldquo;{getLimitingBeliefText(todayBelief)}&rdquo;
                </p>
                {!todayBelief.reflection && (
                  <Link href={`/beliefs/${todayBelief.id}`}>
                    <Button size="sm" variant="outline" className="w-full mt-1 text-xs">
                      Pridať večernú reflexiu
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">Dnešný záznam chýba</p>
                <Link href="/beliefs/create">
                  <Button size="sm" className="gap-2">
                    <Plus className="size-4" />
                    Vytvoriť záznam
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

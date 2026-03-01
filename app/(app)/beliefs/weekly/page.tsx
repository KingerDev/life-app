'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDomainInfo } from '@/types/beliefs';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Lightbulb, CheckIcon } from 'lucide-react';
import {
  Briefcase, Heart, Activity, Palette, BookOpen,
  Wallet, Star, Globe
} from 'lucide-react';

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe,
};

function DomainIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const Icon = DOMAIN_ICONS[iconName];
  if (!Icon) return null;
  return <Icon className={className} style={style} />;
}

const DAY_NAMES = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const month = startDate.toLocaleDateString('sk-SK', { month: 'long' });
  return `${startDate.getDate()}. - ${endDate.getDate()}. ${month}`;
}

export default function WeeklyStatsPage() {
  const api = useApi();

  const { data: weeklyStats, isLoading } = useQuery({
    queryKey: ['beliefs', 'weekly'],
    queryFn: () => api.beliefs.getWeeklyStats(),
  });

  if (isLoading || !weeklyStats) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  const completionPercent = Math.round((weeklyStats.daysCompleted / 7) * 100);
  const sortedDomains = Object.entries(weeklyStats.domainCounts || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/beliefs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Týždenný prehľad</h1>
          <p className="text-sm text-muted-foreground">{formatDateRange(weeklyStats.weekStart, weeklyStats.weekEnd)}</p>
        </div>
      </div>

      {/* Completion Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dokončené dni</h2>
            <span className="text-2xl font-bold text-amber-500">{weeklyStats.daysCompleted}/7</span>
          </div>

          <div className="flex gap-2 mb-3">
            {DAY_NAMES.map((day, index) => {
              const isCompleted = index < weeklyStats.daysCompleted;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-amber-500' : 'bg-muted'
                  }`}>
                    {isCompleted && <CheckIcon className="size-4 text-white" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Evidence Card */}
      {weeklyStats.predictionNotMatchedPercent !== null && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-5 text-green-500" />
              <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">Zbieranie dôkazov</h2>
            </div>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{weeklyStats.predictionNotMatchedPercent}%</p>
            <p className="text-green-700 dark:text-green-300">situácií nedopadlo podľa limitujúceho presvedčenia</p>
            {weeklyStats.reflectionsCount > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">Z {weeklyStats.reflectionsCount} reflexií</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Domains */}
      {sortedDomains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Oblasti, na ktorých pracuješ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedDomains.map(([domain, count]) => {
              const domainInfo = getDomainInfo(domain as any);
              if (!domainInfo) return null;
              const maxCount = (sortedDomains[0]?.[1] as number) || 1;
              const width = ((count as number) / maxCount) * 100;

              return (
                <div key={domain}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${domainInfo.color}20` }}>
                        <DomainIcon iconName={domainInfo.icon} className="size-4" style={{ color: domainInfo.color }} />
                      </div>
                      <span className="font-medium text-sm">{domainInfo.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{count as number}x</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${width}%`, backgroundColor: domainInfo.color }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Evidence List */}
      {weeklyStats.evidence && weeklyStats.evidence.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Tvoje dôkazy</h2>
          <p className="text-sm text-muted-foreground mb-4">Situácie, kde realita nepotvrdila tvoje obavy</p>
          <div className="space-y-3">
            {weeklyStats.evidence.map((item, index) => {
              const domainInfo = getDomainInfo(item.domain);
              return (
                <Card key={index} className="border-l-4 border-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {domainInfo && (
                        <div className="size-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${domainInfo.color}20` }}>
                          <DomainIcon iconName={domainInfo.icon} className="size-3" style={{ color: domainInfo.color }} />
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('sk-SK', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm">{item.reflection}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tip */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Lightbulb className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Tip na tento týždeň</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Čím viac dôkazov nazbieraš, že tvoje limitujúce presvedčenia nie sú vždy pravdivé, tým ľahšie bude tvojmu mozgu prijať nové, oslobodzujúce presvedčenia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

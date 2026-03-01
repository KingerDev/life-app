'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDomainInfo } from '@/types/beliefs';
import { getProgressPercentage } from '@/types/experiments';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, FlaskConical, ChevronRight, Info, Clock } from 'lucide-react';
import {
  Briefcase, Heart, Activity, Palette, BookOpen,
  Wallet, Star, Globe
} from 'lucide-react';

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe,
};

function DomainIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const Icon = DOMAIN_ICONS[iconName] ?? FlaskConical;
  return <Icon className={className} style={style} />;
}

export default function ExperimentsPage() {
  const api = useApi();
  const router = useRouter();

  const { data: activeExperiments, isLoading } = useQuery({
    queryKey: ['experiments', 'active'],
    queryFn: () => api.experiments.getActive(),
  });

  const { data: progressData } = useQuery({
    queryKey: ['experiments', 'progress'],
    queryFn: async () => {
      if (!activeExperiments?.length) return {};
      const entries = await Promise.all(
        activeExperiments.map(async (exp) => {
          try {
            const prog = await api.experiments.getProgress(exp.id);
            return [exp.id, prog] as const;
          } catch { return [exp.id, null] as const; }
        })
      );
      return Object.fromEntries(entries);
    },
    enabled: !!activeExperiments?.length,
  });

  const { data: todayCheckIns } = useQuery({
    queryKey: ['experiments', 'today-checkins'],
    queryFn: () => api.experiments.getTodayCheckIns(),
  });

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  const activeCount = activeExperiments?.length ?? 0;
  const canCreateNew = activeCount < 3;
  const completedTodayIds = new Set((todayCheckIns ?? []).filter(c => c.completed).map(c => c.experimentId));
  const needsCheckInIds = new Set(
    (activeExperiments ?? [])
      .filter(exp => !completedTodayIds.has(exp.id))
      .map(exp => exp.id)
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Malé experimenty</h1>
          <p className="text-muted-foreground text-sm">Osobné výskumy a experimentovanie</p>
        </div>
        <Link href="/experiments/history">
          <Button variant="ghost" size="icon">
            <History className="size-5" />
          </Button>
        </Link>
      </div>

      {/* Status Card */}
      <Card className="bg-purple-500/5 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-700 dark:text-purple-300 font-medium">Aktívne experimenty</span>
            <span className="text-purple-700 dark:text-purple-300 font-medium">{activeCount}/3</span>
          </div>
          <Progress value={(activeCount / 3) * 100} className="mb-2 h-3" />
          <p className="text-sm text-purple-600 dark:text-purple-400">
            {activeCount === 0
              ? 'Začni svoj prvý experiment'
              : needsCheckInIds.size > 0
              ? `${needsCheckInIds.size} ${needsCheckInIds.size === 1 ? 'experiment čaká' : 'experimenty čakajú'} na check-in`
              : 'Všetky experimenty splnené dnes'}
          </p>
        </CardContent>
      </Card>

      {/* Quick Check-in */}
      {needsCheckInIds.size > 0 && (
        <Link href="/experiments/check-in">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            Rýchly check-in
          </Button>
        </Link>
      )}

      {/* Empty State */}
      {activeCount === 0 && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="size-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <FlaskConical className="size-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Začni svoj prvý experiment</h3>
            <p className="text-muted-foreground mb-6">Vytvor časovo ohraničený experiment na testovanie hypotéz o sebe</p>
            <Link href="/experiments/create" className="w-full">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Vytvoriť experiment
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Active Experiments */}
      {activeCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Aktívne experimenty</h2>
          <div className="space-y-3">
            {activeExperiments?.map((experiment) => {
              const progress = progressData?.[experiment.id];
              const domainInfo = getDomainInfo(experiment.domainId as any);
              const color = domainInfo?.color ?? '#8b5cf6';
              const progressPercent = getProgressPercentage(experiment.startDate, experiment.endDate);
              const needsCheckIn = needsCheckInIds.has(experiment.id);
              const completedToday = completedTodayIds.has(experiment.id);

              return (
                <Link key={experiment.id} href={`/experiments/${experiment.id}`}>
                  <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                          <DomainIcon iconName={domainInfo?.icon ?? 'FlaskConical'} className="size-6" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">{domainInfo?.label ?? experiment.domainId}</p>
                          <p className="font-medium line-clamp-2">{experiment.pact.action}</p>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progres</span>
                          <span>{progress?.daysElapsed ?? 0} z {progress?.totalDays ?? 0} dní</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, backgroundColor: color }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{progress?.completionRate ?? 0}% úspešnosť</span>
                        {completedToday ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Dnes splnené</Badge>
                        ) : needsCheckIn ? (
                          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Čaká check-in</Badge>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Create New Button */}
      {canCreateNew && activeCount > 0 && (
        <Link href="/experiments/create">
          <Button variant="outline" className="w-full">Vytvoriť nový experiment</Button>
        </Link>
      )}

      {/* Limit Notice */}
      {!canCreateNew && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="size-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Dosiahli ste limit 3 aktívnych experimentov. Dokončite alebo opustite experiment pre vytvorenie nového.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="size-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Čo je Malý experiment?</p>
              <p className="text-sm text-muted-foreground">Časovo ohraničený pokus (2-8 týždňov) na testovanie hypotéz o sebe. Denné check-iny ti pomôžu sledovať progres.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

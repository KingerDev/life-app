'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDomainInfo, getLiberatingBeliefText, BELIEF_DOMAINS, type BeliefSuggestion } from '@/types/beliefs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase, Heart, Activity, Palette, BookOpen,
  Wallet, Star, Globe, CheckCircle2, Sun, History, BarChart2, Info, ChevronRight
} from 'lucide-react';

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe,
};

function DomainIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const Icon = DOMAIN_ICONS[iconName];
  if (!Icon) return null;
  return <Icon className={className} style={style} />;
}

export default function BeliefsPage() {
  const api = useApi();
  const router = useRouter();

  const { data: todayEntry, isLoading } = useQuery({
    queryKey: ['beliefs', 'today'],
    queryFn: () => api.beliefs.getToday(),
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ['beliefs', 'weekly'],
    queryFn: () => api.beliefs.getWeeklyStats(),
  });

  const { data: suggestions } = useQuery({
    queryKey: ['beliefs', 'suggestions'],
    queryFn: () => api.beliefs.getSuggestions(),
    enabled: !todayEntry,
  });

  const hasTodayEntry = !!todayEntry;
  const needsReflection = hasTodayEntry && !todayEntry?.reflection;

  const handleCreate = (suggestion?: BeliefSuggestion) => {
    if (suggestion) {
      const params = new URLSearchParams({
        domain: suggestion.domain,
        source: suggestion.source,
        ...(suggestion.aspectId ? { aspectId: suggestion.aspectId } : {}),
        ...(suggestion.questId ? { questId: suggestion.questId } : {}),
      });
      router.push(`/beliefs/create?${params.toString()}`);
    } else {
      router.push('/beliefs/create');
    }
  };

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  const domainInfo = todayEntry ? getDomainInfo(todayEntry.domain) : null;
  const liberatingBeliefText = todayEntry ? getLiberatingBeliefText(todayEntry) : '';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zmena presvedčení</h1>
          <p className="text-muted-foreground text-sm">5 minút denne na silnejšie presvedčenia</p>
        </div>
        <div className="flex gap-2">
          <Link href="/beliefs/weekly">
            <Button variant="ghost" size="icon" title="Týždenný prehľad">
              <BarChart2 className="size-5" />
            </Button>
          </Link>
          <Link href="/beliefs/history">
            <Button variant="ghost" size="icon" title="História">
              <History className="size-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Weekly Progress */}
      {weeklyStats && (
        <Link href="/beliefs/weekly">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-amber-600 dark:text-amber-400 font-medium text-sm">Tento týždeň</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-amber-600 dark:text-amber-400">{weeklyStats.daysCompleted}/7 dní</span>
                  <ChevronRight className="size-4 text-amber-500" />
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 7 }).map((_, day) => (
                  <div
                    key={day}
                    className={`flex-1 h-7 rounded transition-colors ${
                      day < weeklyStats.daysCompleted
                        ? 'bg-amber-500'
                        : 'bg-amber-200/50 dark:bg-amber-800/30'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Today's Entry or Create CTA */}
      {hasTodayEntry && todayEntry && domainInfo ? (
        <div>
          <h2 className="text-lg font-semibold mb-3">Dnešné presvedčenie</h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${domainInfo.color}20` }}>
                  <DomainIcon iconName={domainInfo.icon} className="size-5" style={{ color: domainInfo.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{domainInfo.label}</span>
                    {todayEntry.isCustom && (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Vlastné</Badge>
                    )}
                  </div>
                  <p className="font-medium">{liberatingBeliefText}</p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3 mb-3">
                <p className="text-xs text-muted-foreground uppercase mb-1">Plánovaná akcia</p>
                <p className="text-sm">{todayEntry.plannedAction}</p>
              </div>

              {todayEntry.reflection ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="size-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400 uppercase font-medium">Reflexia dokončená</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{todayEntry.reflection}</p>
                </div>
              ) : (
                <Link href={`/beliefs/${todayEntry.id}`}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    Pridať večernú reflexiu
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-3">Ranná prax</h2>
          <Card>
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="size-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <Sun className="size-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Začni deň s novou perspektívou</h3>
              <p className="text-muted-foreground mb-6">Vyber si presvedčenie, ktoré chceš dnes posilniť</p>
              <Button
                onClick={() => handleCreate()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                Začať 5-minútovú prax
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suggestions */}
      {!hasTodayEntry && suggestions && suggestions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Odporúčané oblasti</h2>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => {
              const domain = getDomainInfo(suggestion.domain);
              if (!domain) return null;
              return (
                <Card
                  key={`${suggestion.domain}-${index}`}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleCreate(suggestion)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${domain.color}20` }}>
                        <DomainIcon iconName={domain.icon} className="size-6" style={{ color: domain.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{domain.label}</p>
                        <p className="text-sm text-muted-foreground truncate">{suggestion.reason}</p>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Domains Grid */}
      {!hasTodayEntry && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Všetky oblasti</h2>
          <div className="grid grid-cols-2 gap-3">
            {BELIEF_DOMAINS.map((domain) => (
              <Card
                key={domain.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleCreate({ domain: domain.id, domainLabel: domain.label, source: 'wheel_of_life', reason: '', priority: 0 })}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="size-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${domain.color}20` }}>
                    <DomainIcon iconName={domain.icon} className="size-6" style={{ color: domain.color }} />
                  </div>
                  <p className="font-medium text-sm">{domain.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Ako to funguje?</p>
              <p className="text-sm text-muted-foreground">
                Ráno si vyber limitujúce presvedčenie, nahraď ho oslobodzujúcim a naplánuj malú akciu.
                Večer pridaj reflexiu o tom, ako to dopadlo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

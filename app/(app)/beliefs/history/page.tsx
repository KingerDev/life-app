'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDomainInfo, getLiberatingBeliefText } from '@/types/beliefs';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Dnes';
  if (date.toDateString() === yesterday.toDateString()) return 'Včera';

  return date.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function BeliefHistoryPage() {
  const api = useApi();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['beliefs', 'history', page],
    queryFn: () => api.beliefs.getAll(page),
  });

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/beliefs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">História</h1>
          {data?.meta && (
            <p className="text-sm text-muted-foreground">{data.meta.total} záznamov</p>
          )}
        </div>
        <Link href="/beliefs/weekly">
          <Button variant="ghost" size="icon" title="Týždenný prehľad">
            <BarChart2 className="size-5 text-amber-500" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Zatiaľ žiadne záznamy</p>
            <Link href="/beliefs/create">
              <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">Začni rannú prax</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.data.map((entry) => {
            const domainInfo = getDomainInfo(entry.domain);
            const liberatingBeliefText = getLiberatingBeliefText(entry);
            if (!domainInfo) return null;
            const hasReflection = !!entry.reflection;

            return (
              <Link key={entry.id} href={`/beliefs/${entry.id}`}>
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${domainInfo.color}20` }}>
                        <DomainIcon iconName={domainInfo.icon} className="size-5" style={{ color: domainInfo.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                            {entry.isCustom && (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Vlastné</Badge>
                            )}
                          </div>
                          {hasReflection ? (
                            <Badge
                              className={`text-xs shrink-0 ${
                                entry.outcomeMatchedPrediction === false
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {entry.outcomeMatchedPrediction === false ? 'Dôkaz' : 'Reflexia'}
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0">
                              Čaká na reflexiu
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm">{domainInfo.label}</p>
                        <p className="text-sm text-muted-foreground truncate">{liberatingBeliefText}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Pagination */}
          {data && data.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {data.meta.last_page}</span>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                disabled={page === data.meta.last_page}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

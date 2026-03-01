'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, FlaskConical } from 'lucide-react';
import { Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe } from 'lucide-react';
import { getDomainInfo } from '@/types/beliefs';
import { formatDuration, getStatusLabel } from '@/types/experiments';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe,
};

function DomainIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const Icon = DOMAIN_ICONS[iconName] ?? FlaskConical;
  return <Icon className={className} style={style} />;
}

type FilterType = 'all' | 'completed' | 'abandoned';

export default function ExperimentsHistoryPage() {
  const router = useRouter();
  const api = useApi();
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['experiments', 'history', page],
    queryFn: () => api.experiments.getHistory(page),
  });

  const filteredHistory = (data?.data ?? []).filter(exp => {
    if (filter === 'all') return true;
    return exp.status === filter;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Všetky' },
    { key: 'completed', label: 'Dokončené' },
    { key: 'abandoned', label: 'Opustené' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/experiments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">História</h1>
          <p className="text-muted-foreground text-sm">Dokončené a opustené experimenty</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === f.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>
      ) : filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FlaskConical className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Žiadne experimenty</h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'all'
                ? 'Zatiaľ nemáš žiadne dokončené alebo opustené experimenty'
                : filter === 'completed'
                ? 'Zatiaľ nemáš žiadne dokončené experimenty'
                : 'Zatiaľ nemáš žiadne opustené experimenty'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(experiment => {
            const domainInfo = getDomainInfo(experiment.domainId as any);
            const color = domainInfo?.color ?? '#8b5cf6';

            return (
              <Link key={experiment.id} href={`/experiments/${experiment.id}`}>
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="size-12 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <DomainIcon iconName={domainInfo?.icon ?? 'FlaskConical'} className="size-6" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">{domainInfo?.label ?? experiment.domainId}</p>
                        <p className="font-medium line-clamp-2">{experiment.pact.action}</p>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(experiment.durationValue, experiment.durationType)}
                        {' · '}
                        {new Date(experiment.endDate).toLocaleDateString('sk-SK', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        experiment.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {getStatusLabel(experiment.status)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Pagination */}
          {data && data.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ←
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {data.meta.last_page}</span>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                disabled={page === data.meta.last_page}
              >
                →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, XCircle, FlaskConical } from 'lucide-react';
import { Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe } from 'lucide-react';
import { getDomainInfo } from '@/types/beliefs';
import { formatDuration, getDaysRemaining, getStatusLabel } from '@/types/experiments';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import Link from 'next/link';

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe,
};

function DomainIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const Icon = DOMAIN_ICONS[iconName] ?? FlaskConical;
  return <Icon className={className} style={style} />;
}

export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();
  const [showDetails, setShowDetails] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'abandon' | 'complete' | null>(null);

  const { data: experiment, isLoading } = useQuery({
    queryKey: ['experiments', id],
    queryFn: () => api.experiments.get(id),
  });

  const { data: progress } = useQuery({
    queryKey: ['experiments', id, 'progress'],
    queryFn: () => api.experiments.getProgress(id),
    enabled: !!experiment,
  });

  const { data: checkIns } = useQuery({
    queryKey: ['experiments', id, 'checkins'],
    queryFn: () => api.experiments.getCheckIns(id),
    enabled: !!experiment,
  });

  const abandonMutation = useMutation({
    mutationFn: () => api.experiments.abandon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      router.push('/experiments');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => api.experiments.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      router.push('/experiments');
    },
  });

  if (isLoading || !experiment) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  const domainInfo = getDomainInfo(experiment.domainId as any);
  const color = domainInfo?.color ?? '#8b5cf6';
  const daysRemaining = getDaysRemaining(experiment.endDate);
  const isActive = experiment.status === 'active';
  const recentCheckIns = (checkIns ?? []).slice(0, 7);

  const statusBadge = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    abandoned: 'bg-muted text-muted-foreground',
  }[experiment.status];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold">Detail</h1>
      </div>

      {/* Experiment Header */}
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
          <DomainIcon iconName={domainInfo?.icon ?? 'FlaskConical'} className="size-8" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{domainInfo?.label ?? experiment.domainId}</p>
          <p className="text-xl font-bold">{experiment.pact.action}</p>
          <Badge className={`mt-1 ${statusBadge}`}>{getStatusLabel(experiment.status)}</Badge>
        </div>
      </div>

      {/* Duration Info */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Trvanie</p>
            <p className="text-lg font-semibold">{formatDuration(experiment.durationValue, experiment.durationType)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Zostáva</p>
            <p className="text-lg font-semibold">{daysRemaining} dní</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isActive && progress && (
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Progres</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <p className="text-3xl font-bold text-purple-500">{progress.completionRate}%</p>
                <p className="text-xs text-muted-foreground">úspešnosť</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{progress.currentStreak}</p>
                <p className="text-xs text-muted-foreground">aktuálna séria</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{progress.longestStreak}</p>
                <p className="text-xs text-muted-foreground">najdlhšia séria</p>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-3">
              <span>{progress.daysElapsed} z {progress.totalDays} dní</span>
              <span>{progress.completedCount} check-inov</span>
            </div>

            {progress.completedToday ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="size-5 text-green-500" />
                <span className="text-green-700 dark:text-green-300 font-medium text-sm">Dnes splnené</span>
              </div>
            ) : progress.needsCheckInToday ? (
              <Link href="/experiments/check-in">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Dnes check-in
                </Button>
              </Link>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Recent Check-ins */}
      {recentCheckIns.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Nedávne check-iny</h2>
          <Card>
            <CardContent className="p-0">
              {recentCheckIns.map((checkIn, index) => (
                <div
                  key={checkIn.id}
                  className={`flex items-center gap-3 p-4 ${index > 0 ? 'border-t border-border' : ''}`}
                >
                  <div className={`size-8 rounded-full flex items-center justify-center ${
                    checkIn.completed
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-muted'
                  }`}>
                    {checkIn.completed
                      ? <CheckCircle2 className="size-4 text-green-500" />
                      : <XCircle className="size-4 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {format(new Date(checkIn.date), 'EEE d. MMM', { locale: sk })}
                    </p>
                    {checkIn.notes && (
                      <p className="text-xs text-muted-foreground truncate">{checkIn.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Research Question */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Výskumná otázka</h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-base">{experiment.researchQuestion.question}</p>
          </CardContent>
        </Card>
      </div>

      {/* Collapsible Details */}
      <div>
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>Detaily (vzory, poznámky)</span>
          {showDetails ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>

        {showDetails && (
          <div className="mt-3 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">VZORY</p>
                {experiment.patterns.patternA && (
                  <p className="text-sm"><span className="font-medium">Mám tendenciu: </span>{experiment.patterns.patternA}</p>
                )}
                {experiment.patterns.patternB && (
                  <p className="text-sm"><span className="font-medium">Vždy: </span>{experiment.patterns.patternB}</p>
                )}
                {experiment.patterns.patternC && (
                  <p className="text-sm"><span className="font-medium">Často: </span>{experiment.patterns.patternC}</p>
                )}
              </CardContent>
            </Card>

            {(experiment.fieldNotes.whatFeltGood || experiment.fieldNotes.curiosities) && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">TERÉNNE POZNÁMKY</p>
                  {experiment.fieldNotes.whatFeltGood && (
                    <p className="text-sm"><span className="font-medium">Čo sa cítilo dobre: </span>{experiment.fieldNotes.whatFeltGood}</p>
                  )}
                  {experiment.fieldNotes.curiosities && (
                    <p className="text-sm"><span className="font-medium">Zvedavosť: </span>{experiment.fieldNotes.curiosities}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {isActive && (
        <div className="space-y-3">
          {confirmAction === 'complete' ? (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Označiť ako úspešne dokončený?</p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => completeMutation.mutate()}
                    disabled={completeMutation.isPending}
                  >
                    {completeMutation.isPending ? 'Dokončujem...' : 'Dokončiť'}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>
                    Zrušiť
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setConfirmAction('complete')}
            >
              Dokončiť experiment
            </Button>
          )}

          {confirmAction === 'abandon' ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Naozaj chceš opustiť tento experiment?</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => abandonMutation.mutate()}
                    disabled={abandonMutation.isPending}
                  >
                    {abandonMutation.isPending ? 'Opúšťam...' : 'Opustiť'}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>
                    Zrušiť
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            confirmAction !== 'complete' && (
              <Button variant="outline" className="w-full" onClick={() => setConfirmAction('abandon')}>
                Opustiť experiment
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

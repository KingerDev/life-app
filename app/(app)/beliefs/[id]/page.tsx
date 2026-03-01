'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  getDomainInfo, getLimitingBeliefText, getLiberatingBeliefText
} from '@/types/beliefs';
import { ArrowLeft, Trash2, Minus, Plus, Zap, Moon, Sparkles, ThumbsUp, ThumbsDown, MessageCircle, PieChart, Flag, Hand } from 'lucide-react';
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

export default function BeliefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [showReflectForm, setShowReflectForm] = useState(false);
  const [reflection, setReflection] = useState('');
  const [outcomeMatched, setOutcomeMatched] = useState<boolean | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: entry, isLoading } = useQuery({
    queryKey: ['beliefs', 'entry', id],
    queryFn: () => api.beliefs.get(id),
  });

  const { mutate: addReflection, isPending: isSavingReflection } = useMutation({
    mutationFn: (data: { reflection: string; outcome_matched_prediction: boolean }) =>
      api.beliefs.updateReflection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beliefs'] });
      setShowReflectForm(false);
    },
  });

  const { mutate: deleteEntry, isPending: isDeleting } = useMutation({
    mutationFn: () => api.beliefs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beliefs'] });
      router.push('/beliefs');
    },
  });

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Záznam nebol nájdený</p>
        <Button onClick={() => router.back()} className="mt-4">Späť</Button>
      </div>
    );
  }

  const domainInfo = getDomainInfo(entry.domain);
  const limitingBeliefText = getLimitingBeliefText(entry);
  const liberatingBeliefText = getLiberatingBeliefText(entry);
  const hasReflection = !!entry.reflection;
  const isToday = entry.date === new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sk-SK', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const isReflectValid = reflection.trim() && outcomeMatched !== null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Detail záznamu</h1>
          <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
        </div>
        {!showDeleteConfirm ? (
          <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(true)} className="text-destructive">
            <Trash2 className="size-5" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Zrušiť</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteEntry()} disabled={isDeleting}>
              {isDeleting ? 'Mažem...' : 'Vymazať'}
            </Button>
          </div>
        )}
      </div>

      {/* Domain Header */}
      {domainInfo && (
        <div className="flex flex-col items-center py-4">
          <div className="size-20 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${domainInfo.color}20` }}>
            <DomainIcon iconName={domainInfo.icon} className="size-10" style={{ color: domainInfo.color }} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{domainInfo.label}</h2>
            {entry.isCustom && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Vlastné</Badge>
            )}
          </div>
          {entry.suggestionSource && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {entry.suggestionSource === 'wheel_of_life' ? <PieChart className="size-3.5" /> :
               entry.suggestionSource === 'quest' ? <Flag className="size-3.5" /> :
               <Hand className="size-3.5" />}
              <span>
                {entry.suggestionSource === 'wheel_of_life' ? 'Z Kolesa života' :
                 entry.suggestionSource === 'quest' ? 'Z Štvrťročných cieľov' :
                 'Manuálny výber'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Limiting Belief */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Minus className="size-3 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Limitujúce presvedčenie</span>
          </div>
          <p className="text-muted-foreground/70 line-through">{limitingBeliefText}</p>
        </CardContent>
      </Card>

      {/* Liberating Belief */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Plus className="size-3 text-green-500" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Oslobodzujúce presvedčenie</span>
          </div>
          <p className="font-medium">{liberatingBeliefText}</p>
        </CardContent>
      </Card>

      {/* Planned Action */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="size-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Plánovaná akcia</span>
          </div>
          <p>{entry.plannedAction}</p>
        </CardContent>
      </Card>

      {/* Reflection */}
      {hasReflection ? (
        <Card className={entry.outcomeMatchedPrediction === false ? 'bg-green-500/5 border-green-500/20' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {entry.outcomeMatchedPrediction === false ? (
                <Sparkles className="size-4 text-green-500" />
              ) : (
                <MessageCircle className="size-4 text-muted-foreground" />
              )}
              <span className={`text-sm font-medium ${entry.outcomeMatchedPrediction === false ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                Večerná reflexia
              </span>
              {entry.outcomeMatchedPrediction === false && (
                <Badge className="ml-auto bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300">Dôkaz</Badge>
              )}
            </div>
            <p>{entry.reflection}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Splnilo sa limitujúce presvedčenie?</span>
              <span className={`text-sm font-medium ${entry.outcomeMatchedPrediction ? 'text-red-500' : 'text-green-500'}`}>
                {entry.outcomeMatchedPrediction ? 'Áno' : 'Nie'}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : !showReflectForm ? (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="size-4 text-amber-500" />
              <span className="text-amber-700 dark:text-amber-300 font-medium">Večerná reflexia</span>
            </div>
            <p className="text-amber-600 dark:text-amber-400 mb-4 text-sm">
              {isToday
                ? 'Pridaj večernú reflexiu a zaznamenaj, ako to dopadlo.'
                : 'Tento záznam nemá pridanú reflexiu.'}
            </p>
            {isToday && (
              <Button
                onClick={() => setShowReflectForm(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                Pridať reflexiu
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Reflect Form */
        <div className="space-y-4">
          {/* Outcome Question */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Splnilo sa tvoje limitujúce presvedčenie?</h3>
            <p className="text-muted-foreground text-sm mb-4">Dopadla situácia tak, ako si sa obával?</p>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-colors ${outcomeMatched === true ? 'border-red-500 bg-red-500/5' : 'hover:bg-accent/50'}`}
                onClick={() => setOutcomeMatched(true)}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <div className={`size-12 rounded-full flex items-center justify-center mb-2 ${outcomeMatched === true ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
                    <ThumbsDown className={`size-6 ${outcomeMatched === true ? 'text-red-500' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`font-medium text-sm ${outcomeMatched === true ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>Áno, splnilo sa</span>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-colors ${outcomeMatched === false ? 'border-green-500 bg-green-500/5' : 'hover:bg-accent/50'}`}
                onClick={() => setOutcomeMatched(false)}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <div className={`size-12 rounded-full flex items-center justify-center mb-2 ${outcomeMatched === false ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                    <ThumbsUp className={`size-6 ${outcomeMatched === false ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`font-medium text-sm ${outcomeMatched === false ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>Nie, nesplnilo sa</span>
                </CardContent>
              </Card>
            </div>

            {outcomeMatched === false && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-3">
                <div className="flex gap-2">
                  <Sparkles className="size-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Skvelé! Toto je dôkaz, že tvoje limitujúce presvedčenie nie je vždy pravdivé. Zapamätaj si tento moment.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reflection Text */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Reflexia</h3>
            <p className="text-muted-foreground text-sm mb-3">Čo si sa naučil? Čo bolo iné, ako si očakával?</p>
            <Textarea
              placeholder="Napíš svoju reflexiu..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          {/* Prompts */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Potrebuješ inšpiráciu? Zamysli sa nad:</p>
            <ul className="space-y-1.5">
              {[
                'Čo konkrétne sa stalo?',
                'Ako sa líšil výsledok od mojich obáv?',
                'Čo by som urobil inak nabudúce?',
                'Aký dôkaz mám teraz o novom presvedčení?',
              ].map((prompt, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  {prompt}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowReflectForm(false)} className="flex-1">Zrušiť</Button>
            <Button
              onClick={() => {
                if (isReflectValid && outcomeMatched !== null) {
                  addReflection({ reflection: reflection.trim(), outcome_matched_prediction: outcomeMatched });
                }
              }}
              disabled={!isReflectValid || isSavingReflection}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSavingReflection ? 'Ukladám...' : 'Uložiť reflexiu'}
            </Button>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground/60">
          Vytvorené: {new Date(entry.createdAt).toLocaleString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

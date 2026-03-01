'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  BELIEF_DOMAINS, getBeliefsByDomain, getDomainInfo,
  type BeliefDomain, type PredefinedBelief
} from '@/types/beliefs';
import { ArrowLeft, X, Minus, Plus, Lightbulb, Sun, CheckIcon } from 'lucide-react';
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

type Step = 'domain' | 'belief' | 'custom' | 'action' | 'summary';

function CreateBeliefPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useApi();
  const queryClient = useQueryClient();

  const presetDomain = searchParams.get('domain') as BeliefDomain | null;
  const source = searchParams.get('source');
  const aspectId = searchParams.get('aspectId') || undefined;
  const questId = searchParams.get('questId') || undefined;

  const [step, setStep] = useState<Step>(presetDomain ? 'belief' : 'domain');
  const [selectedDomain, setSelectedDomain] = useState<BeliefDomain | null>(presetDomain);
  const [selectedBelief, setSelectedBelief] = useState<PredefinedBelief | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customLimitingBelief, setCustomLimitingBelief] = useState('');
  const [customLiberatingBelief, setCustomLiberatingBelief] = useState('');
  const [plannedAction, setPlannedAction] = useState('');

  const domainInfo = selectedDomain ? getDomainInfo(selectedDomain) : null;
  const domainBeliefs = selectedDomain ? getBeliefsByDomain(selectedDomain) : [];
  const limitingBeliefText = isCustom ? customLimitingBelief : selectedBelief?.limitingBelief ?? '';
  const liberatingBeliefText = isCustom ? customLiberatingBelief : selectedBelief?.liberatingBelief ?? '';
  const suggestedActions = isCustom ? [] : selectedBelief?.suggestedActions ?? [];

  const { mutate: createEntry, isPending } = useMutation({
    mutationFn: (payload: Parameters<typeof api.beliefs.create>[0]) => api.beliefs.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beliefs'] });
      router.push('/beliefs');
    },
  });

  const handleSelectDomain = (domain: BeliefDomain) => {
    setSelectedDomain(domain);
    setSelectedBelief(null);
    setIsCustom(false);
    setStep('belief');
  };

  const handleSelectBelief = (belief: PredefinedBelief) => {
    setSelectedBelief(belief);
    setIsCustom(false);
    setStep('action');
  };

  const handleSave = () => {
    if (!selectedDomain || !plannedAction.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    if (isCustom) {
      createEntry({
        date: today,
        domain: selectedDomain,
        limiting_belief_custom: customLimitingBelief.trim(),
        liberating_belief_custom: customLiberatingBelief.trim(),
        is_custom: true,
        planned_action: plannedAction.trim(),
        suggestion_source: (source as any) || 'manual',
        related_aspect_id: aspectId,
        related_quest_id: questId,
      });
    } else {
      createEntry({
        date: today,
        domain: selectedDomain,
        limiting_belief_id: selectedBelief!.id,
        liberating_belief_id: selectedBelief!.id,
        is_custom: false,
        planned_action: plannedAction.trim(),
        suggestion_source: (source as any) || 'manual',
        related_aspect_id: aspectId,
        related_quest_id: questId,
      });
    }
  };

  const getStepIndex = () => {
    if (step === 'custom') return 1;
    return ['domain', 'belief', 'action', 'summary'].indexOf(step);
  };

  const stepTitles: Record<Step, string> = {
    domain: 'Vyber oblasť',
    belief: 'Vyber presvedčenie',
    custom: 'Vlastné presvedčenie',
    action: 'Naplánuj akciu',
    summary: 'Súhrn',
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <X className="size-5" />
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold">{stepTitles[step]}</h1>
        <div className="size-10" />
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`flex-1 h-1 rounded-full transition-colors ${
              index <= getStepIndex() ? 'bg-amber-500' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step: Domain */}
      {step === 'domain' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Vyber oblasť</h2>
            <p className="text-muted-foreground text-sm">V ktorej oblasti života chceš dnes pracovať na svojich presvedčeniach?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BELIEF_DOMAINS.map((domain) => (
              <Card
                key={domain.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleSelectDomain(domain.id)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="size-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${domain.color}20` }}>
                    <DomainIcon iconName={domain.icon} className="size-7" style={{ color: domain.color }} />
                  </div>
                  <p className="font-medium">{domain.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step: Belief selection */}
      {step === 'belief' && domainInfo && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${domainInfo.color}20` }}>
              <DomainIcon iconName={domainInfo.icon} className="size-5" style={{ color: domainInfo.color }} />
            </div>
            <h2 className="text-xl font-bold">{domainInfo.label}</h2>
          </div>
          <p className="text-muted-foreground text-sm">Vyber limitujúce presvedčenie, ktoré chceš dnes nahradiť, alebo napíš vlastné.</p>

          {/* Custom option */}
          <Card
            className="cursor-pointer border-dashed border-amber-400/60 hover:bg-amber-500/5 transition-colors"
            onClick={() => { setSelectedBelief(null); setIsCustom(true); setStep('custom'); }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Sun className="size-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-amber-700 dark:text-amber-300">Napísať vlastné presvedčenie</p>
                  <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Zadaj svoje limitujúce a oslobodzujúce presvedčenie</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Alebo vyber z predefinovaných</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-3">
            {domainBeliefs.map((belief) => (
              <Card
                key={belief.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedBelief?.id === belief.id ? 'border-amber-500' : ''}`}
                onClick={() => handleSelectBelief(belief)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex gap-3">
                    <div className="size-6 rounded-full border-2 border-red-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Minus className="size-3 text-red-400" />
                    </div>
                    <p className="text-red-600 dark:text-red-400 font-medium flex-1">{belief.limitingBelief}</p>
                  </div>
                  <div className="border-t border-border pt-2 flex gap-3">
                    <div className="size-6 rounded-full border-2 border-green-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Plus className="size-3 text-green-400" />
                    </div>
                    <p className="text-green-600 dark:text-green-400 flex-1">{belief.liberatingBelief}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" onClick={() => setStep('domain')} className="w-full">
            <ArrowLeft className="size-4 mr-2" /> Späť
          </Button>
        </div>
      )}

      {/* Step: Custom belief */}
      {step === 'custom' && (
        <div className="space-y-4">
          {domainInfo && (
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${domainInfo.color}20` }}>
                <DomainIcon iconName={domainInfo.icon} className="size-5" style={{ color: domainInfo.color }} />
              </div>
              <h2 className="text-xl font-bold">{domainInfo.label}</h2>
            </div>
          )}
          <p className="text-muted-foreground text-sm">Napíš svoje vlastné limitujúce a oslobodzujúce presvedčenie.</p>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-6 rounded-full border-2 border-red-400 flex items-center justify-center">
                <Minus className="size-3 text-red-400" />
              </div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Limitujúce presvedčenie</span>
            </div>
            <Textarea
              placeholder="Napr.: Nie som dosť dobrý na to, aby som..."
              value={customLimitingBelief}
              onChange={(e) => setCustomLimitingBelief(e.target.value)}
              className="min-h-[80px] bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-6 rounded-full border-2 border-green-400 flex items-center justify-center">
                <Plus className="size-3 text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Oslobodzujúce presvedčenie</span>
            </div>
            <Textarea
              placeholder="Napr.: Môžem sa zlepšovať každým dňom a..."
              value={customLiberatingBelief}
              onChange={(e) => setCustomLiberatingBelief(e.target.value)}
              className="min-h-[80px] bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
            />
          </div>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Lightbulb className="size-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-amber-800 dark:text-amber-200 font-medium text-sm mb-1">Tip</p>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    Oslobodzujúce presvedčenie by malo byť realistické a dosiahnuteľné. Namiesto "Vždy uspeem" skús "Môžem sa učiť z každého pokusu".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('belief')} className="flex-1">
              <ArrowLeft className="size-4 mr-2" /> Späť
            </Button>
            <Button
              onClick={() => { if (customLimitingBelief.trim() && customLiberatingBelief.trim()) setStep('action'); }}
              disabled={!customLimitingBelief.trim() || !customLiberatingBelief.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Pokračovať
            </Button>
          </div>
        </div>
      )}

      {/* Step: Action */}
      {step === 'action' && domainInfo && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${domainInfo.color}20` }}>
              <DomainIcon iconName={domainInfo.icon} className="size-5" style={{ color: domainInfo.color }} />
            </div>
            <div className="flex-1">
              <p className="font-bold">{domainInfo.label}</p>
            </div>
            {isCustom && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">Vlastné</span>}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="size-4 text-amber-500" />
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Oslobodzujúce presvedčenie</span>
              </div>
              <p className="text-lg">{liberatingBeliefText}</p>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-bold mb-1">Naplánuj akciu</h2>
            <p className="text-muted-foreground text-sm mb-3">Čo urobíš dnes, aby si toto presvedčenie otestoval v praxi?</p>
            <Textarea
              placeholder="Napíš jednu konkrétnu akciu..."
              value={plannedAction}
              onChange={(e) => setPlannedAction(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {suggestedActions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Alebo vyber z odporúčaných:</p>
              <div className="space-y-2">
                {suggestedActions.map((action, index) => (
                  <div
                    key={index}
                    onClick={() => setPlannedAction(action)}
                    className={`cursor-pointer rounded-lg border p-3 flex items-center gap-3 transition-colors hover:bg-accent/50 ${
                      plannedAction === action ? 'border-amber-500 bg-amber-500/5' : 'border-border'
                    }`}
                  >
                    <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${
                      plannedAction === action ? 'bg-amber-500' : 'bg-muted'
                    }`}>
                      {plannedAction === action && <CheckIcon className="size-3 text-white" />}
                    </div>
                    <p className="text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(isCustom ? 'custom' : 'belief')} className="flex-1">
              <ArrowLeft className="size-4 mr-2" /> Späť
            </Button>
            <Button
              onClick={() => { if (plannedAction.trim()) setStep('summary'); }}
              disabled={!plannedAction.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Pokračovať
            </Button>
          </div>
        </div>
      )}

      {/* Step: Summary */}
      {step === 'summary' && domainInfo && (
        <div className="space-y-4">
          <div className="flex flex-col items-center py-4">
            <div className="size-20 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${domainInfo.color}20` }}>
              <DomainIcon iconName={domainInfo.icon} className="size-10" style={{ color: domainInfo.color }} />
            </div>
            <h2 className="text-2xl font-bold mb-1">Dnešná prax</h2>
            <div className="flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">{domainInfo.label}</span>
              {isCustom && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">Vlastné</span>}
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Limitujúce presvedčenie</p>
              <p className="text-red-600 dark:text-red-400 line-through">{limitingBeliefText}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Oslobodzujúce presvedčenie</p>
              <p className="text-green-600 dark:text-green-400 font-medium">{liberatingBeliefText}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Plánovaná akcia</p>
              <p>{plannedAction}</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Lightbulb className="size-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-amber-800 dark:text-amber-200 font-medium text-sm mb-1">Pamätaj</p>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    Nejde o to, že výsledok musí byť dokonalý. Ide o to, že robíš krok a zbieraš dôkazy, ktoré môžu zmeniť tvoje presvedčenie.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isPending ? 'Ukladám...' : 'Uložiť a začať deň'}
            </Button>
            <Button variant="outline" onClick={() => setStep('action')} className="w-full">
              Upraviť
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateBeliefPage() {
  return (
    <Suspense fallback={<div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>}>
      <CreateBeliefPageInner />
    </Suspense>
  );
}

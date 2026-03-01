'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { FlaskConical, Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe } from 'lucide-react';
import { BELIEF_DOMAINS, getDomainInfo, type BeliefDomain } from '@/types/beliefs';
import { parseDuration, type FieldNotes, type PatternInsights, type ResearchQuestion, type ExperimentPact } from '@/types/experiments';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Briefcase, Heart, Activity, Palette, BookOpen, Wallet, Star, Globe,
};

function DomainIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const Icon = DOMAIN_ICONS[iconName] ?? FlaskConical;
  return <Icon className={className} style={style} />;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export default function CreateExperimentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const api = useApi();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<WizardStep>(
    (params.get('domainId') ? 2 : 1) as WizardStep
  );

  const [selectedDomain, setSelectedDomain] = useState<BeliefDomain | null>(
    (params.get('domainId') as BeliefDomain) ?? null
  );

  const [fieldNotes, setFieldNotes] = useState<FieldNotes>({
    whatFeltGood: '',
    whatDidntFeelGood: '',
    curiosities: '',
    inspiringPeople: '',
    flowWork: '',
    procrastinationWork: '',
    lessActivities: '',
    moreActivities: '',
    skillsToExplore: '',
  });

  const [patterns, setPatterns] = useState<PatternInsights>({
    patternA: '',
    patternB: '',
    patternC: '',
  });

  const [researchQuestion, setResearchQuestion] = useState<ResearchQuestion>({ question: '' });
  const [pact, setPact] = useState<ExperimentPact>({ action: '', duration: '' });

  const mutation = useMutation({
    mutationFn: () => {
      const parsedDuration = parseDuration(pact.duration) ?? { value: 2, type: 'weeks' as const };
      return api.experiments.create({
        domainId: selectedDomain!,
        fieldNotes,
        patterns,
        researchQuestion,
        pact,
        durationValue: parsedDuration.value,
        durationType: parsedDuration.type,
        startDate: new Date().toISOString().split('T')[0],
        suggestionSource: params.get('source') === 'wheel_of_life' ? 'wheel_of_life' : 'manual',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      router.push('/experiments');
    },
  });

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return selectedDomain !== null;
      case 2: return Object.values(fieldNotes).some(v => v.trim().length > 0);
      case 3: return patterns.patternA.trim().length > 0;
      case 4: return researchQuestion.question.trim().length > 0;
      case 5: return pact.action.trim().length > 0 && pact.duration.trim().length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep((currentStep + 1) as WizardStep);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
    else router.back();
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nový experiment</h1>
          <p className="text-muted-foreground text-sm">Krok {currentStep}/6</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {[1,2,3,4,5,6].map(s => (
          <div
            key={s}
            className={cn('h-1 flex-1 rounded-full transition-colors', s <= currentStep ? 'bg-purple-500' : 'bg-muted')}
          />
        ))}
      </div>

      {/* Step 1: Domain */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Vyber oblasť</h2>
            <p className="text-muted-foreground text-sm">V ktorej oblasti života chceš experimentovať?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BELIEF_DOMAINS.map((domain) => {
              const isSelected = selectedDomain === domain.id;
              return (
                <Card
                  key={domain.id}
                  className={cn('cursor-pointer transition-all', isSelected ? 'ring-2 ring-offset-2' : 'hover:bg-accent/50')}
                  style={isSelected ? { '--tw-ring-color': domain.color } as any : {}}
                  onClick={() => setSelectedDomain(domain.id)}
                >
                  <CardContent className="p-4">
                    <div
                      className="size-10 rounded-lg flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${domain.color}20` }}
                    >
                      <DomainIcon iconName={domain.icon} className="size-5" style={{ color: domain.color }} />
                    </div>
                    <p className="text-sm font-medium">{domain.label}</p>
                    {isSelected && (
                      <div className="mt-1 w-full h-0.5 rounded-full" style={{ backgroundColor: domain.color }} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Field Notes */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Terénne poznámky</h2>
            <p className="text-muted-foreground text-sm">Zodpovedaj otázky, ktoré ťa zaujímajú</p>
          </div>
          <div className="space-y-4">
            {[
              { key: 'whatFeltGood', label: 'Čo sa ti páčilo v poslednom čase?' },
              { key: 'whatDidntFeelGood', label: 'Čo sa ti nepáčilo?' },
              { key: 'curiosities', label: 'O čom si zvedavý/á?' },
              { key: 'skillsToExplore', label: 'Aké zručnosti chceš skúmať alebo zlepšiť?' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Textarea
                  value={fieldNotes[key as keyof FieldNotes]}
                  onChange={e => setFieldNotes({ ...fieldNotes, [key]: e.target.value })}
                  placeholder="Napíš tu..."
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Patterns */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Hľadaj vzory</h2>
            <p className="text-muted-foreground text-sm">Identifikuj svoje opakujúce sa správanie</p>
          </div>
          <div className="space-y-4">
            {[
              { key: 'patternA', label: 'Mám tendenciu...', placeholder: 'Mám tendenciu prokrastinovať pri dôležitých úlohách' },
              { key: 'patternB', label: 'Vždy...', placeholder: 'Vždy sa cítim lepšie po cvičení' },
              { key: 'patternC', label: 'Často...', placeholder: 'Často zabudnem na prestávky' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Textarea
                  value={patterns[key as keyof PatternInsights]}
                  onChange={e => setPatterns({ ...patterns, [key]: e.target.value })}
                  placeholder={`Napríklad: ${placeholder}`}
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Research Question */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Výskumná otázka</h2>
            <p className="text-muted-foreground text-sm">Premeň zvedavosť na testovateľnú otázku</p>
          </div>
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-1 text-sm text-muted-foreground">
              <p>Príklady otázok:</p>
              <p>• Bavilo by ma robiť X?</p>
              <p>• Bol by som produktívnejší, keby som robil X?</p>
              <p>• Cítil by som sa energickejší, keby som robil X?</p>
            </CardContent>
          </Card>
          <div className="space-y-1">
            <Label>Tvoja otázka</Label>
            <Textarea
              value={researchQuestion.question}
              onChange={e => setResearchQuestion({ question: e.target.value })}
              placeholder="Bol by som kreatívnejší, keby som meditoval každé ráno?"
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Step 5: Pact */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Vytvor pakt</h2>
            <p className="text-muted-foreground text-sm">Navrhni svoj mini-protokol</p>
          </div>
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-1 text-sm text-muted-foreground">
              <p>Príklady:</p>
              <p>• Budem čítať 2 minúty každý večer po dobu 2 týždňov</p>
              <p>• Spravím 100 fotiek za 100 dní</p>
              <p>• Pôjdem do posilňovne 3x týždenne po dobu 2 mesiacov</p>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Čo budeš robiť?</Label>
              <Textarea
                value={pact.action}
                onChange={e => setPact({ ...pact, action: e.target.value })}
                placeholder="Budem meditovať 10 minút každé ráno"
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label>Ako dlho?</Label>
              <Input
                value={pact.duration}
                onChange={e => setPact({ ...pact, duration: e.target.value })}
                placeholder="2 týždne, 30 dní, 3 mesiace"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Summary */}
      {currentStep === 6 && (() => {
        const domainInfo = selectedDomain ? getDomainInfo(selectedDomain) : null;
        const color = domainInfo?.color ?? '#8b5cf6';
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Zhrnutie</h2>
              <p className="text-muted-foreground text-sm">Skontroluj svoj experiment pred vytvorením</p>
            </div>

            {domainInfo && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="size-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <DomainIcon iconName={domainInfo.icon} className="size-5" style={{ color }} />
                  </div>
                  <p className="font-semibold">{domainInfo.label}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">PAKT</p>
                <p className="text-base">{pact.action}</p>
                <p className="text-sm text-muted-foreground">Trvanie: {pact.duration}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">VÝSKUMNÁ OTÁZKA</p>
                <p className="text-base">{researchQuestion.question}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">VZORY</p>
                {patterns.patternA && <p className="text-sm"><span className="font-medium">Mám tendenciu: </span>{patterns.patternA}</p>}
                {patterns.patternB && <p className="text-sm"><span className="font-medium">Vždy: </span>{patterns.patternB}</p>}
                {patterns.patternC && <p className="text-sm"><span className="font-medium">Často: </span>{patterns.patternC}</p>}
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={handleBack} disabled={mutation.isPending}>
          {currentStep === 1 ? 'Zrušiť' : 'Späť'}
        </Button>
        {currentStep < 6 ? (
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleNext} disabled={!canGoNext()}>
            Ďalej
          </Button>
        ) : (
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Vytváram...' : 'Vytvoriť'}
          </Button>
        )}
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive text-center">Nepodarilo sa vytvoriť experiment</p>
      )}
    </div>
  );
}

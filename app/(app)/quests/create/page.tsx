'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Briefcase, Heart } from 'lucide-react';
import {
  WORK_INTRO_QUESTION, LIFE_INTRO_QUESTION,
  WORK_DISCOVERY_QUESTIONS, LIFE_DISCOVERY_QUESTIONS,
  WORK_FORM_FIELDS, LIFE_FORM_FIELDS,
  QUEST_TYPE_LABELS,
  type QuestType, type DiscoveryAnswers,
  formatQuarterLabel, getCurrentQuarterAndYear,
} from '@/types/quarterly-quests';
import { cn } from '@/lib/utils';

type Step = 'intro' | 'discovery' | 'form' | 'summary';

export default function CreateQuestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const api = useApi();
  const queryClient = useQueryClient();
  const { quarter, year } = getCurrentQuarterAndYear();

  const [questType, setQuestType] = useState<QuestType>((params.get('type') as QuestType) ?? 'work');
  const [step, setStep] = useState<Step>('intro');
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [discoveryAnswers, setDiscoveryAnswers] = useState<DiscoveryAnswers>({});
  const [formData, setFormData] = useState({
    mainGoal: '', whyImportant: '', successCriteria: '', excitement: '', commitment: '',
  });

  const isWork = questType === 'work';
  const color = isWork ? '#3b82f6' : '#10b981';
  const Icon = isWork ? Briefcase : Heart;
  const introQuestion = isWork ? WORK_INTRO_QUESTION : LIFE_INTRO_QUESTION;
  const discoveryQuestions = isWork ? WORK_DISCOVERY_QUESTIONS : LIFE_DISCOVERY_QUESTIONS;
  const formFields = isWork ? WORK_FORM_FIELDS : LIFE_FORM_FIELDS;
  const currentQ = discoveryQuestions[discoveryIndex];
  const discoveryProgress = ((discoveryIndex + 1) / discoveryQuestions.length) * 100;

  const isFormValid = formData.mainGoal.trim() && formData.whyImportant.trim() &&
    formData.successCriteria.trim() && formData.excitement.trim() && formData.commitment.trim();

  const mutation = useMutation({
    mutationFn: () => api.quests.create({
      quarter, year, type: questType,
      discovery_answers: discoveryAnswers,
      main_goal: formData.mainGoal,
      why_important: formData.whyImportant,
      success_criteria: formData.successCriteria,
      excitement: formData.excitement,
      commitment: formData.commitment,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      router.push('/quests');
    },
  });

  const stepTitles: Record<Step, string> = {
    intro: 'Nový cieľ', discovery: 'Pomocné otázky',
    form: 'Definícia cieľa', summary: 'Súhrn',
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <X className="size-5" />
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold">{stepTitles[step]}</h1>
        <div className="w-10" />
      </div>

      {/* Intro Step */}
      {step === 'intro' && (
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="size-24 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="size-12" style={{ color }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{QUEST_TYPE_LABELS[questType]}</h2>
            <p className="text-purple-500 font-medium">{formatQuarterLabel(quarter, year)}</p>
          </div>
          <p className="text-muted-foreground">{introQuestion}</p>

          {!params.get('type') && (
            <div className="w-full grid grid-cols-2 gap-3">
              {(['work', 'life'] as QuestType[]).map(t => {
                const TIcon = t === 'work' ? Briefcase : Heart;
                const tColor = t === 'work' ? '#3b82f6' : '#10b981';
                return (
                  <button
                    key={t}
                    onClick={() => setQuestType(t)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-colors',
                      questType === t ? 'border-current' : 'border-border hover:border-muted-foreground'
                    )}
                    style={questType === t ? { borderColor: tColor } : {}}
                  >
                    <TIcon className="size-6 mx-auto mb-1" style={{ color: questType === t ? tColor : undefined }} />
                    <p className="text-sm font-medium" style={{ color: questType === t ? tColor : undefined }}>
                      {t === 'work' ? 'Práca' : 'Život'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="w-full space-y-3">
            <Button className="w-full" style={{ backgroundColor: color }} onClick={() => setStep('discovery')}>
              Pokračovať s pomocnými otázkami
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setStep('form')}>
              Preskočiť na definíciu cieľa
            </Button>
          </div>
        </div>
      )}

      {/* Discovery Step */}
      {step === 'discovery' && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Otázka {discoveryIndex + 1} z {discoveryQuestions.length}</span>
              <button className="text-purple-500" onClick={() => setStep('form')}>
                Preskočiť všetky
              </button>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${discoveryProgress}%`, backgroundColor: color }} />
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="font-medium">{currentQ.question}</p>
              <Textarea
                placeholder={currentQ.placeholder}
                value={discoveryAnswers[currentQ.key] ?? ''}
                onChange={e => setDiscoveryAnswers(prev => ({ ...prev, [currentQ.key]: e.target.value }))}
                rows={5}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => {
              if (discoveryIndex > 0) setDiscoveryIndex(i => i - 1);
              else setStep('intro');
            }}>
              Späť
            </Button>
            <Button
              className="flex-1 text-white"
              style={{ backgroundColor: color }}
              onClick={() => {
                if (discoveryIndex < discoveryQuestions.length - 1) setDiscoveryIndex(i => i + 1);
                else setStep('form');
              }}
            >
              {discoveryIndex < discoveryQuestions.length - 1 ? 'Ďalej' : 'Dokončiť'}
            </Button>
          </div>
        </div>
      )}

      {/* Form Step */}
      {step === 'form' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Definuj svoj cieľ</h2>
            <p className="text-muted-foreground text-sm">Vyplň všetky polia, aby si jasne zadefinoval svoju Hlavnú Úlohu.</p>
          </div>
          <div className="space-y-4">
            {formFields.map(field => (
              <div key={field.key} className="space-y-1">
                <Label>{field.label}</Label>
                <Textarea
                  placeholder={field.placeholder}
                  value={formData[field.key]}
                  onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  rows={3}
                />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Button className="w-full text-white" style={{ backgroundColor: color }} disabled={!isFormValid} onClick={() => setStep('summary')}>
              Zobraziť súhrn
            </Button>
            <Button variant="outline" className="w-full" onClick={() => {
              setDiscoveryIndex(discoveryQuestions.length - 1);
              setStep('discovery');
            }}>
              Späť na otázky
            </Button>
          </div>
        </div>
      )}

      {/* Summary Step */}
      {step === 'summary' && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="size-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Icon className="size-10" style={{ color }} />
            </div>
            <h2 className="text-2xl font-bold">{QUEST_TYPE_LABELS[questType]}</h2>
            <p className="text-purple-500">{formatQuarterLabel(quarter, year)}</p>
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Hlavná Úloha</p>
              <p className="text-lg font-semibold">{formData.mainGoal}</p>
            </CardContent>
          </Card>

          {[
            { key: 'whyImportant', label: 'Prečo je to dôležité' },
            { key: 'successCriteria', label: 'Kritériá úspechu' },
            { key: 'excitement', label: 'Čo ma vzrušuje' },
            { key: 'commitment', label: 'Môj záväzok' },
          ].map(item => (
            <Card key={item.key}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm">{formData[item.key as keyof typeof formData]}</p>
              </CardContent>
            </Card>
          ))}

          <div className="space-y-3 pt-2">
            <Button
              className="w-full text-white"
              style={{ backgroundColor: color }}
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Ukladám...' : 'Uložiť cieľ'}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setStep('form')}>
              Upraviť
            </Button>
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive text-center">Nepodarilo sa vytvoriť cieľ</p>
          )}
        </div>
      )}
    </div>
  );
}

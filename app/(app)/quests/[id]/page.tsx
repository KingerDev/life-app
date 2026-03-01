'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Briefcase, Heart } from 'lucide-react';
import {
  WORK_FORM_FIELDS, LIFE_FORM_FIELDS,
  WORK_DISCOVERY_QUESTIONS, LIFE_DISCOVERY_QUESTIONS,
  QUEST_TYPE_LABELS,
  formatQuarterLabel, isCurrentQuarter,
} from '@/types/quarterly-quests';

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    mainGoal: '', whyImportant: '', successCriteria: '', excitement: '', commitment: '',
  });

  const { data: quest, isLoading } = useQuery({
    queryKey: ['quests', id],
    queryFn: () => api.quests.get(id),
  });

  useEffect(() => {
    if (quest) {
      setFormData({
        mainGoal: quest.mainGoal,
        whyImportant: quest.whyImportant,
        successCriteria: quest.successCriteria,
        excitement: quest.excitement,
        commitment: quest.commitment,
      });
    }
  }, [quest?.id]);

  const updateMutation = useMutation({
    mutationFn: () => api.quests.update(id, {
      main_goal: formData.mainGoal,
      why_important: formData.whyImportant,
      success_criteria: formData.successCriteria,
      excitement: formData.excitement,
      commitment: formData.commitment,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.quests.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      router.push('/quests');
    },
  });

  if (isLoading || !quest) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  const isWork = quest.type === 'work';
  const color = isWork ? '#3b82f6' : '#10b981';
  const Icon = isWork ? Briefcase : Heart;
  const formFields = isWork ? WORK_FORM_FIELDS : LIFE_FORM_FIELDS;
  const discoveryQuestions = isWork ? WORK_DISCOVERY_QUESTIONS : LIFE_DISCOVERY_QUESTIONS;
  const isCurrent = isCurrentQuarter(quest.quarter, quest.year);

  const isFormValid = formData.mainGoal.trim() && formData.whyImportant.trim() &&
    formData.successCriteria.trim() && formData.excitement.trim() && formData.commitment.trim();

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          {isEditing ? 'Upraviť cieľ' : 'Detail cieľa'}
        </h1>
        <div className="w-10" />
      </div>

      {!isEditing ? (
        <>
          {/* View Mode */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="size-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Icon className="size-10" style={{ color }} />
            </div>
            <h2 className="text-2xl font-bold">{QUEST_TYPE_LABELS[quest.type]}</h2>
            <p className="text-purple-500">{formatQuarterLabel(quest.quarter, quest.year)}</p>
            {isCurrent && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                Aktuálny štvrťrok
              </Badge>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Hlavná Úloha</p>
              <p className="text-lg font-semibold">{quest.mainGoal}</p>
            </CardContent>
          </Card>

          {[
            { key: 'whyImportant', label: 'Prečo je to dôležité', value: quest.whyImportant },
            { key: 'successCriteria', label: 'Kritériá úspechu', value: quest.successCriteria },
            { key: 'excitement', label: 'Čo ma vzrušuje', value: quest.excitement },
            { key: 'commitment', label: 'Môj záväzok', value: quest.commitment },
          ].map(item => (
            <Card key={item.key}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm">{item.value}</p>
              </CardContent>
            </Card>
          ))}

          {/* Discovery Answers */}
          {quest.discoveryAnswers && Object.values(quest.discoveryAnswers).some(v => v?.trim()) && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Pomocné odpovede</h2>
              <div className="space-y-2">
                {discoveryQuestions.map((q, index) => {
                  const answer = quest.discoveryAnswers?.[q.key];
                  if (!answer?.trim()) return null;
                  return (
                    <Card key={q.key}>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Otázka {index + 1}</p>
                        <p className="text-sm">{answer}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button className="w-full text-white" style={{ backgroundColor: color }} onClick={() => setIsEditing(true)}>
              Upraviť
            </Button>
            {confirmDelete ? (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3">Naozaj chcete vymazať tento cieľ?</p>
                  <div className="flex gap-2">
                    <Button variant="destructive" className="flex-1" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? 'Mažem...' : 'Vymazať'}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>Zrušiť</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setConfirmDelete(true)}>
                Vymazať
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode */}
          <div>
            <h2 className="text-xl font-bold mb-1">Upraviť cieľ</h2>
            <p className="text-muted-foreground text-sm">Aktualizuj informácie o svojom cieli.</p>
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
            <Button
              className="w-full text-white"
              style={{ backgroundColor: color }}
              disabled={!isFormValid || updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              {updateMutation.isPending ? 'Ukladám...' : 'Uložiť zmeny'}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => {
              setFormData({
                mainGoal: quest.mainGoal, whyImportant: quest.whyImportant,
                successCriteria: quest.successCriteria, excitement: quest.excitement,
                commitment: quest.commitment,
              });
              setIsEditing(false);
            }}>
              Zrušiť
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

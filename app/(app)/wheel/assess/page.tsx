'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { LIFE_ASPECTS, AspectRating } from '@/types/wheel-of-life';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AssessPage() {
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();

  const { data: currentAssessment } = useQuery({
    queryKey: ['wheel', 'current-week'],
    queryFn: () => api.assessments.getCurrentWeek(),
  });

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    LIFE_ASPECTS.forEach(a => { initial[a.id] = 5; });
    return initial;
  });

  // Pre-fill from existing assessment
  useState(() => {
    if (currentAssessment) {
      const initial: Record<string, number> = {};
      currentAssessment.ratings.forEach(r => { initial[r.aspectId] = r.value; });
      setRatings(initial);
    }
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const ratingsArray: AspectRating[] = LIFE_ASPECTS.map(a => ({
        aspectId: a.id,
        value: ratings[a.id] ?? 5,
      }));

      const weekStart = monday.toISOString().split('T')[0];
      const weekEnd = sunday.toISOString().split('T')[0];

      if (currentAssessment) {
        return api.assessments.update(currentAssessment.id, {
          weekStart, weekEnd, ratings: ratingsArray,
        });
      } else {
        return api.assessments.create({
          weekStart, weekEnd, ratings: ratingsArray,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wheel'] });
      router.push('/wheel');
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/wheel">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {currentAssessment ? 'Aktualizovať hodnotenie' : 'Nové hodnotenie'}
          </h1>
          <p className="text-muted-foreground text-sm">Ohodnoť každú oblasť od 0 do 10</p>
        </div>
      </div>

      <div className="space-y-4">
        {LIFE_ASPECTS.map(aspect => {
          const value = ratings[aspect.id] ?? 5;
          return (
            <Card key={aspect.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full" style={{ backgroundColor: aspect.color }} />
                    <CardTitle className="text-base">{aspect.label}</CardTitle>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: aspect.color }}>{value}</span>
                </div>
              </CardHeader>
              <CardContent>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={value}
                  onChange={e => setRatings(prev => ({ ...prev, [aspect.id]: Number(e.target.value) }))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: aspect.color,
                    background: `linear-gradient(to right, ${aspect.color} ${value * 10}%, hsl(var(--muted)) ${value * 10}%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span className="text-xs text-muted-foreground">
                    {value <= 3 ? 'Veľmi nízke' : value <= 6 ? 'Priemerné' : value <= 8 ? 'Dobré' : 'Výborné'}
                  </span>
                  <span>10</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3 pb-4">
        <Link href="/wheel" className="flex-1">
          <Button variant="outline" className="w-full">Zrušiť</Button>
        </Link>
        <Button
          className="flex-1 gap-2"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          <Save className="size-4" />
          {mutation.isPending ? 'Ukladám...' : 'Uložiť hodnotenie'}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitCheckInButton } from '@/components/habits/HabitCheckInButton';
import { CalendarCheck, Plus, Flame } from 'lucide-react';
import Link from 'next/link';

export default function HabitsPage() {
  const api = useApi();

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits', 'today'],
    queryFn: () => api.habits.today(),
  });

  const { data: summary } = useQuery({
    queryKey: ['habits', 'summary'],
    queryFn: () => api.habits.summary(),
  });

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  const total = habits?.length ?? 0;
  const completed = habits?.filter(h => h.todayEntry?.completed).length ?? 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Návyky</h1>
          <p className="text-muted-foreground text-sm">Denný check-in</p>
        </div>
        <Link href="/habits/create">
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Nový návyk
          </Button>
        </Link>
      </div>

      {/* Status summary */}
      {total > 0 && (
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  Dnes: {completed}/{total} splnených
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {completed === total && total > 0
                    ? 'Všetky návyky splnené!'
                    : `${total - completed} ešte čaká`}
                </p>
              </div>
              {(summary?.longestCurrentStreak ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-orange-500">
                  <Flame className="size-5" />
                  <span className="font-bold text-lg">{summary?.longestCurrentStreak}</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 bg-emerald-200 dark:bg-emerald-900/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {total === 0 && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CalendarCheck className="size-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Začni sledovať návyky</h3>
            <p className="text-muted-foreground mb-6">Pridaj si prvý návyk a sleduj, ako buduje sériu</p>
            <Link href="/habits/create" className="w-full">
              <Button className="w-full">Pridať prvý návyk</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Habits list */}
      {total > 0 && (
        <Card>
          <CardContent className="p-2 divide-y divide-border">
            {habits?.map(habit => (
              <HabitCheckInButton key={habit.id} habit={habit} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

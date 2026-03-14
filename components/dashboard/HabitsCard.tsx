'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useModulesStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ChevronRight, Plus, Flame, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

export function HabitsCard() {
  const api = useApi();
  const { habitsEnabled } = useModulesStore();

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits', 'today'],
    queryFn: () => api.habits.today(),
    enabled: habitsEnabled,
  });

  const { data: summary } = useQuery({
    queryKey: ['habits', 'summary'],
    queryFn: () => api.habits.summary(),
    enabled: habitsEnabled,
  });

  if (!habitsEnabled) return null;

  const total = habits?.length ?? 0;
  const completed = habits?.filter(h => h.todayEntry?.completed).length ?? 0;
  const streak = summary?.longestCurrentStreak ?? 0;

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CalendarCheck className="size-5 text-emerald-500" />
          <CardTitle className="text-base">Návyky</CardTitle>
          {streak > 0 && (
            <div className="flex items-center gap-0.5 text-orange-500 text-xs font-medium">
              <Flame className="size-3.5" />
              <span>{streak}</span>
            </div>
          )}
        </div>
        <Link href="/habits">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Detail <ChevronRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Načítavam...</div>
          </div>
        ) : total === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Žiadne aktívne návyky</p>
            <Link href="/habits/create">
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Prvý návyk
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Dnes</span>
                <span>{completed}/{total}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Top habits preview */}
            {habits?.slice(0, 3).map(habit => (
              <div key={habit.id} className="flex items-center gap-2">
                {habit.todayEntry?.completed
                  ? <CheckCircle2 className="size-4 shrink-0" style={{ color: habit.color }} />
                  : <Circle className="size-4 shrink-0 text-muted-foreground" />}
                <span className={`text-sm flex-1 truncate ${habit.todayEntry?.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {habit.name}
                </span>
                <div
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
              </div>
            ))}

            {total > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{total - 3} ďalších návykov
              </p>
            )}

            {completed < total && (
              <Link href="/habits">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Urobiť check-in
                </Button>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

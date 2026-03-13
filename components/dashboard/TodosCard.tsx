'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useModulesStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { TodoItem } from '@/components/todos/TodoItem';

export function TodosCard() {
  const api = useApi();
  const { todosEnabled } = useModulesStore();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['todos', 'summary'],
    queryFn: () => api.todos.summary(),
    enabled: todosEnabled,
  });

  if (!todosEnabled) return null;

  const totalActive = summary?.totalActive ?? 0;
  const completedToday = summary?.completedToday ?? 0;
  const overdueCount = summary?.overdueCount ?? 0;
  const topTodos = summary?.topTodos ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-5 text-amber-500" />
          <CardTitle className="text-base">Úlohy</CardTitle>
          {overdueCount > 0 && (
            <div className="flex items-center gap-0.5 text-destructive text-xs font-medium">
              <AlertCircle className="size-3.5" />
              <span>{overdueCount}</span>
            </div>
          )}
        </div>
        <Link href="/todos">
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
        ) : totalActive === 0 && completedToday === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Žiadne úlohy na dnes</p>
            <Link href="/todos/create">
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Prvá úloha
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span><span className="font-medium text-foreground">{completedToday}</span> splnených dnes</span>
              <span><span className="font-medium text-foreground">{totalActive}</span> aktívnych</span>
            </div>

            {/* Top todos preview */}
            <div className="divide-y divide-border -mx-2">
              {topTodos.map(todo => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>

            {totalActive > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{totalActive - 3} ďalších úloh
              </p>
            )}

            <Link href="/todos">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Zobraziť všetky
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TodoItem } from '@/components/todos/TodoItem';
import { TodoQuickAdd } from '@/components/todos/TodoQuickAdd';
import { CheckSquare, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TodosPage() {
  const api = useApi();
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');

  const { data: todayData, isLoading } = useQuery({
    queryKey: ['todos', 'today'],
    queryFn: () => api.todos.today(),
  });

  const { data: allData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['todos', 'list'],
    queryFn: () => api.todos.getAll(),
    enabled: activeTab === 'all',
  });

  const overdueCount = todayData?.overdue.length ?? 0;
  const todayCount = todayData?.dueToday.length ?? 0;
  const completedTodayCount = todayData?.completedToday.length ?? 0;
  const totalToday = overdueCount + todayCount;

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  const hasAnyTodos = totalToday > 0 || completedTodayCount > 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Úlohy</h1>
          <p className="text-muted-foreground text-sm">Denné úlohy a projekty</p>
        </div>
        <Link href="/todos/create">
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Nová úloha
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'today'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('today')}
        >
          Dnes
          {overdueCount > 0 && (
            <span className="ml-1.5 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">
              {overdueCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'all'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Všetky
        </button>
      </div>

      {/* TODAY TAB */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Empty state */}
          {!hasAnyTodos && (
            <Card>
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="size-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <CheckSquare className="size-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Žiadne úlohy na dnes</h3>
                <p className="text-muted-foreground mb-6">Pridaj si prvú úlohu a začni produktívny deň</p>
                <Link href="/todos/create" className="w-full">
                  <Button className="w-full">Pridať prvú úlohu</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Overdue section */}
          {overdueCount > 0 && (
            <Card className="border-destructive/30">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 px-3 py-2">
                  <AlertCircle className="size-4 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">
                    Oneskorené ({overdueCount})
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {todayData?.overdue.map(todo => (
                    <TodoItem key={todo.id} todo={todo} queryKey={['todos', 'today']} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Due today section */}
          {(todayCount > 0 || completedTodayCount > 0) && (
            <Card>
              <CardContent className="p-2">
                {todayCount > 0 && (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-muted-foreground">
                        Dnes ({todayCount})
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {todayData?.dueToday.map(todo => (
                        <TodoItem key={todo.id} todo={todo} queryKey={['todos', 'today']} />
                      ))}
                    </div>
                  </>
                )}

                {/* Completed today */}
                {completedTodayCount > 0 && (
                  <>
                    <div className={`px-3 py-2 ${todayCount > 0 ? 'mt-2 border-t border-border' : ''}`}>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Splnené dnes ({completedTodayCount})
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {todayData?.completedToday.map(todo => (
                        <TodoItem key={todo.id} todo={todo} queryKey={['todos', 'today']} />
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick add */}
          <TodoQuickAdd defaultDueDate={new Date().toISOString().split('T')[0]} />
        </div>
      )}

      {/* ALL TAB */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {isLoadingAll && (
            <div className="h-32 flex items-center justify-center text-muted-foreground">Načítavam...</div>
          )}
          {!isLoadingAll && (allData?.data.length ?? 0) === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Žiadne aktívne úlohy</p>
                <Link href="/todos/create">
                  <Button className="mt-4" size="sm">Pridať úlohu</Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {!isLoadingAll && (allData?.data.length ?? 0) > 0 && (
            <Card>
              <CardContent className="p-2 divide-y divide-border">
                {allData?.data.map(todo => (
                  <TodoItem key={todo.id} todo={todo} queryKey={['todos', 'list']} />
                ))}
              </CardContent>
            </Card>
          )}
          <TodoQuickAdd />
        </div>
      )}
    </div>
  );
}

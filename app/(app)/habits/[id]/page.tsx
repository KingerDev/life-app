'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useRouter } from 'next/navigation';
import { LIFE_ASPECTS } from '@/types/wheel-of-life';
import { buildHeatmapData, getTodayString } from '@/types/habits';
import { HabitHeatmap } from '@/components/habits/HabitHeatmap';
import { HabitStatsGrid } from '@/components/habits/HabitStatsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Edit, Archive, Trash2, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const today = getTodayString();

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: habit, isLoading: loadingHabit } = useQuery({
    queryKey: ['habits', id],
    queryFn: () => api.habits.get(id),
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['habits', id, 'stats'],
    queryFn: () => api.habits.stats(id),
    enabled: !!habit,
  });

  const { data: entries, isLoading: loadingEntries } = useQuery({
    queryKey: ['habits', id, 'entries'],
    queryFn: () => api.habits.getEntries(id),
    enabled: !!habit,
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.habits.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      router.push('/habits');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.habits.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      router.push('/habits');
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async ({ completed }: { completed: boolean }) => {
      const todayEntry = entries?.find(e => e.date === today);
      if (todayEntry) {
        return api.habits.updateEntry(id, todayEntry.id, { completed });
      }
      return api.habits.storeEntry(id, { date: today, completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', id] });
      queryClient.invalidateQueries({ queryKey: ['habits', id, 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['habits', id, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'today'] });
    },
  });

  if (loadingHabit) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  if (!habit) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Návyk nebol nájdený.</p>
        <Link href="/habits"><Button variant="ghost" className="mt-4">Späť na zoznam</Button></Link>
      </div>
    );
  }

  const aspect = LIFE_ASPECTS.find(a => a.id === habit.aspectId);
  const todayEntry = entries?.find(e => e.date === today);
  const completedToday = todayEntry?.completed ?? false;
  const heatmapData = entries ? buildHeatmapData(entries) : [];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/habits">
          <Button variant="ghost" size="icon" className="shrink-0 mt-0.5">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: habit.color }}
            >
              {aspect?.label ?? habit.aspectId}
            </span>
          </div>
          <h1 className="text-xl font-bold">{habit.name}</h1>
          {habit.description && (
            <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
          )}
        </div>
        <Link href={`/habits/${id}/edit`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Edit className="size-4" />
          </Button>
        </Link>
      </div>

      {/* Today check-in */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dnes</p>
              <p className="text-sm text-muted-foreground">
                {completedToday ? 'Splnené ✓' : 'Ešte nesplnené'}
              </p>
            </div>
            <Button
              variant={completedToday ? 'default' : 'outline'}
              className="gap-2"
              style={completedToday ? { backgroundColor: habit.color, borderColor: habit.color } : {}}
              onClick={() => checkInMutation.mutate({ completed: !completedToday })}
              disabled={checkInMutation.isPending}
            >
              {completedToday
                ? <><CheckCircle2 className="size-4" /> Splnené</>
                : <><Circle className="size-4" /> Označiť</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      {stats && !loadingStats && (
        <HabitStatsGrid stats={stats} color={habit.color} />
      )}

      {/* Heatmap */}
      {!loadingEntries && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posledných 26 týždňov</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <HabitHeatmap days={heatmapData} color={habit.color} />
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          {/* Archive dialog */}
          <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2 text-muted-foreground">
                <Archive className="size-4" />
                Archivovať
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Archivovať návyk?</DialogTitle>
                <DialogDescription>
                  Návyk bude skrytý z denného check-inu, ale záznamy zostanú zachované.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setArchiveOpen(false)}>Zrušiť</Button>
                <Button
                  onClick={() => { archiveMutation.mutate(); setArchiveOpen(false); }}
                  disabled={archiveMutation.isPending}
                >
                  Archivovať
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2 text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
                Zmazať
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zmazať návyk?</DialogTitle>
                <DialogDescription>
                  Táto akcia je nevratná. Návyk a všetky záznamy budú trvalo zmazané.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Zrušiť</Button>
                <Button
                  variant="destructive"
                  onClick={() => { deleteMutation.mutate(); setDeleteOpen(false); }}
                  disabled={deleteMutation.isPending}
                >
                  Zmazať
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

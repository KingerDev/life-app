'use client';

import type { HabitStats } from '@/types/habits';

interface HabitStatsGridProps {
  stats: HabitStats;
  color: string;
}

function StatCard({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="rounded-lg bg-muted p-3 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold leading-none">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export function HabitStatsGrid({ stats }: HabitStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Aktuálna séria" value={stats.currentStreak} unit="dní" />
      <StatCard label="Najdlhšia séria" value={stats.longestStreak} unit="dní" />
      <StatCard label="Splnené celkom" value={stats.completedDays} unit="dní" />
      <StatCard label="% plnenia" value={`${Math.round(stats.completionRate)}`} unit="%" />
    </div>
  );
}

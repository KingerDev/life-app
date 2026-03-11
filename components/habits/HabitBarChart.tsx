'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { HabitStats } from '@/types/habits';

interface HabitBarChartProps {
  stats: HabitStats;
  color: string;
}

const WEEK_LABELS = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

function buildWeeklyData(weeklyCompletions: number[], color: string) {
  return WEEK_LABELS.map((label, i) => ({
    label,
    value: weeklyCompletions[i] ?? 0,
    color: (weeklyCompletions[i] ?? 0) > 0 ? color : 'hsl(var(--muted))',
  }));
}

function buildMonthlyData(monthlyCompletions: Record<string, boolean>, color: string) {
  const entries = Object.entries(monthlyCompletions).slice(-30);
  return entries.map(([date, completed]) => ({
    label: date.slice(8), // day number
    value: completed ? 1 : 0,
    color: completed ? color : 'hsl(var(--muted))',
  }));
}

export function HabitBarChart({ stats, color }: HabitBarChartProps) {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');

  const data = view === 'weekly'
    ? buildWeeklyData(stats.weeklyCompletions, color)
    : buildMonthlyData(stats.monthlyCompletions, color);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Plnenie</p>
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setView('weekly')}
            className={`px-3 py-1 transition-colors ${view === 'weekly' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            Týždeň
          </button>
          <button
            type="button"
            onClick={() => setView('monthly')}
            className={`px-3 py-1 transition-colors ${view === 'monthly' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            Mesiac
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} barSize={view === 'monthly' ? 6 : 24} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload;
              return (
                <div className="rounded border border-border bg-card px-2 py-1 text-xs shadow-sm">
                  {item.label}: {item.value > 0 ? 'Splnené' : 'Nesplnené'}
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

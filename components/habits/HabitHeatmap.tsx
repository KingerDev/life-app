'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { HeatmapDay } from '@/types/habits';
import { cn } from '@/lib/utils';

interface HabitHeatmapProps {
  days: HeatmapDay[];
  color: string;
}

const DAY_LABELS = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' });
}

export function HabitHeatmap({ days, color }: HabitHeatmapProps) {
  // days is a flat array Mon–Sun × 26 weeks, total 182 days
  const weeks = Math.ceil(days.length / 7);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-1 mr-1">
            {DAY_LABELS.map((label) => (
              <div key={label} className="h-3.5 text-xs text-muted-foreground flex items-center w-5 justify-end">
                {label}
              </div>
            ))}
          </div>

          {/* Grid columns = weeks */}
          {Array.from({ length: weeks }, (_, weekIdx) => {
            const weekDays = days.slice(weekIdx * 7, weekIdx * 7 + 7);
            return (
              <div key={weekIdx} className="flex flex-col gap-1">
                {weekDays.map((day) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'size-3.5 rounded-sm cursor-default transition-opacity',
                          day.isFuture && 'opacity-0 pointer-events-none',
                          !day.isFuture && !day.completed && 'bg-muted',
                          day.isToday && !day.completed && 'ring-1 ring-primary',
                        )}
                        style={
                          day.completed && !day.isFuture
                            ? { backgroundColor: color }
                            : undefined
                        }
                      />
                    </TooltipTrigger>
                    {!day.isFuture && (
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{formatDate(day.date)}</p>
                        <p>{day.completed ? '✓ Splnené' : '✗ Nesplnené'}</p>
                        {day.note && <p className="text-muted-foreground mt-0.5">{day.note}</p>}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

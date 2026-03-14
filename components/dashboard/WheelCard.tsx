'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useModulesStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { LIFE_ASPECTS } from '@/types/wheel-of-life';
import { ChevronRight, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import Link from 'next/link';

export function WheelCard() {
  const api = useApi();
  const { wheelEnabled } = useModulesStore();

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['wheel', 'latest'],
    queryFn: () => api.assessments.getLatest(),
    enabled: wheelEnabled,
  });

  if (!wheelEnabled) return null;

  const chartData = LIFE_ASPECTS.map(aspect => ({
    aspect: aspect.label.split(' ')[0],
    fullLabel: aspect.label,
    value: assessment?.ratings.find(r => r.aspectId === aspect.id)?.value ?? 0,
    color: aspect.color,
  }));

  const avgScore = assessment
    ? Math.round(assessment.ratings.reduce((sum, r) => sum + r.value, 0) / assessment.ratings.length * 10) / 10
    : null;

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Circle className="size-5 text-blue-400" />
          <CardTitle className="text-base">Koleso života</CardTitle>
        </div>
        <Link href="/wheel">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Detail <ChevronRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Načítavam...</div>
          </div>
        ) : assessment ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">Priemerné skóre</span>
                {assessment.weekStart && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(assessment.weekStart), 'd. MMM', { locale: sk })} – {format(new Date(assessment.weekEnd), 'd. MMM yyyy', { locale: sk })}
                  </p>
                )}
              </div>
              <span className="text-2xl font-bold text-blue-400">{avgScore}/10</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="aspect"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.[0]) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
                          <p className="font-medium">{item.fullLabel}</p>
                          <p className="text-blue-400 font-bold">{item.value}/10</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Radar
                  name="Skóre"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground text-sm">Zatiaľ žiadne hodnotenie tento týždeň</p>
            <Link href="/wheel/assess">
              <Button size="sm">Ohodnotiť oblasti</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

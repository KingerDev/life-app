'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { LIFE_ASPECTS } from '@/types/wheel-of-life';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';
import Link from 'next/link';
import { History, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

export default function WheelPage() {
  const api = useApi();

  const { data: history, isLoading } = useQuery({
    queryKey: ['wheel', 'history'],
    queryFn: () => api.assessments.getAll(1),
  });

  const assessment = history?.data?.[0] ?? null;
  const previousAssessment = history?.data?.[1] ?? null;

  const chartData = LIFE_ASPECTS.map(aspect => {
    const current = assessment?.ratings.find(r => r.aspectId === aspect.id)?.value ?? 0;
    const previous = previousAssessment?.ratings.find(r => r.aspectId === aspect.id)?.value ?? 0;
    return {
      aspect: aspect.label.split(' ')[0],
      fullLabel: aspect.label,
      current,
      previous,
      color: aspect.color,
    };
  });

  const avgScore = assessment
    ? Math.round(assessment.ratings.reduce((sum, r) => sum + r.value, 0) / assessment.ratings.length * 10) / 10
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Koleso života</h1>
          <p className="text-muted-foreground text-sm mt-1">Týždenné hodnotenie 8 oblastí života</p>
        </div>
        <div className="flex gap-2">
          <Link href="/wheel/history">
            <Button variant="outline" size="sm" className="gap-2">
              <History className="size-4" />
              História
            </Button>
          </Link>
          <Link href="/wheel/assess">
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              Hodnotiť týždeň
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Načítavam...</div>
        </div>
      ) : assessment ? (
        <>
          {/* Radar Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Prehľad týždenného hodnotenia</CardTitle>
                {assessment?.weekStart && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(assessment.weekStart), 'd. MMM', { locale: sk })} – {format(new Date(assessment.weekEnd), 'd. MMM yyyy', { locale: sk })}
                  </p>
                )}
              </div>
              {avgScore !== null && (
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Ø {avgScore}/10
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis
                    dataKey="aspect"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm space-y-1">
                            <p className="font-medium">{item.fullLabel}</p>
                            <p className="text-blue-400">Teraz: <strong>{item.current}/10</strong></p>
                            {item.previous > 0 && (
                              <p className="text-muted-foreground">Predtým: {item.previous}/10</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {previousAssessment && (
                    <Radar
                      name="Predchádzajúci týždeň"
                      dataKey="previous"
                      stroke="#6b7280"
                      fill="#6b7280"
                      fillOpacity={0.15}
                      strokeDasharray="5 5"
                    />
                  )}
                  <Radar
                    name="Tento týždeň"
                    dataKey="current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.25}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              {previousAssessment && (
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[#6b7280]" style={{ borderTop: '2px dashed #6b7280' }} />
                    <span>Predchádzajúci týždeň</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-500" />
                    <span>Tento týždeň</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aspects list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LIFE_ASPECTS.map(aspect => {
              const rating = assessment.ratings.find(r => r.aspectId === aspect.id);
              const value = rating?.value ?? 0;
              const prevValue = previousAssessment?.ratings.find(r => r.aspectId === aspect.id)?.value;
              const diff = prevValue !== undefined ? value - prevValue : null;

              return (
                <Link key={aspect.id} href={`/wheel/aspect/${aspect.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: aspect.color }}
                          />
                          <span className="text-sm font-medium">{aspect.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {diff !== null && diff !== 0 && (
                            <span className={`text-xs ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {diff > 0 ? '+' : ''}{diff}
                            </span>
                          )}
                          <span className="text-lg font-bold" style={{ color: aspect.color }}>
                            {value}
                          </span>
                          <span className="text-xs text-muted-foreground">/10</span>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${value * 10}%`, backgroundColor: aspect.color }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="p-8 text-center space-y-4">
          <div className="text-5xl">⚙️</div>
          <h3 className="text-lg font-semibold">Zatiaľ žiadne hodnotenie</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Ohodnoť každú oblasť svojho života od 0 do 10 a získaj vizuálny prehľad toho, kde sa nachádzaš.
          </p>
          <Link href="/wheel/assess">
            <Button className="gap-2">
              <Plus className="size-4" />
              Začať hodnotenie
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}

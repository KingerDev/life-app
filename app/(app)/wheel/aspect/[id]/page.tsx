'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { LIFE_ASPECTS, LifeAspectId } from '@/types/wheel-of-life';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

export default function AspectDetailPage() {
  const params = useParams();
  const aspectId = params.id as LifeAspectId;
  const api = useApi();

  const aspect = LIFE_ASPECTS.find(a => a.id === aspectId);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['wheel', 'history', 'all'],
    queryFn: () => api.assessments.getAll(1),
  });

  if (!aspect) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Oblasť nenájdená</p>
        <Link href="/wheel"><Button className="mt-4">Späť</Button></Link>
      </div>
    );
  }

  const chartData = historyData?.data
    .slice()
    .reverse()
    .map(a => ({
      week: format(new Date(a.weekStart), 'd. MMM', { locale: sk }),
      value: a.ratings.find(r => r.aspectId === aspectId)?.value ?? 0,
    })) ?? [];

  const currentValue = chartData[chartData.length - 1]?.value ?? 0;
  const previousValue = chartData[chartData.length - 2]?.value;
  const trend = previousValue !== undefined ? currentValue - previousValue : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/wheel">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="size-4 rounded-full" style={{ backgroundColor: aspect.color }} />
          <h1 className="text-2xl font-bold">{aspect.label}</h1>
        </div>
      </div>

      {/* Current score */}
      <Card style={{ borderColor: `${aspect.color}40` }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Aktuálne skóre</p>
              <p className="text-5xl font-bold mt-1" style={{ color: aspect.color }}>
                {currentValue}
              </p>
              <p className="text-muted-foreground text-sm">/ 10</p>
            </div>
            {trend !== null && (
              <div className={`flex items-center gap-2 text-lg font-semibold ${
                trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-muted-foreground'
              }`}>
                {trend > 0 ? <TrendingUp className="size-6" /> :
                 trend < 0 ? <TrendingDown className="size-6" /> :
                 <Minus className="size-6" />}
                {trend > 0 ? '+' : ''}{trend} oproti minulému týždňu
              </div>
            )}
          </div>

          {/* Score bar */}
          <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${currentValue * 10}%`, backgroundColor: aspect.color }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trend chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vývoj v čase</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.[0]) {
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
                          <p className="text-muted-foreground">{payload[0].payload.week}</p>
                          <p className="font-bold" style={{ color: aspect.color }}>
                            {payload[0].value}/10
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={aspect.color}
                  strokeWidth={2}
                  dot={{ fill: aspect.color, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href="/wheel/assess" className="flex-1">
          <Button className="w-full" style={{ backgroundColor: aspect.color }}>
            Aktualizovať hodnotenie
          </Button>
        </Link>
      </div>
    </div>
  );
}

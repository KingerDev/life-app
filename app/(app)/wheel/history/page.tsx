'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { LIFE_ASPECTS } from '@/types/wheel-of-life';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

export default function WheelHistoryPage() {
  const api = useApi();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['wheel', 'history', page],
    queryFn: () => api.assessments.getAll(page),
  });

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd. MMM yyyy', { locale: sk });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/wheel">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">História hodnotení</h1>
          <p className="text-muted-foreground text-sm">Všetky minulé hodnotenia kolesa života</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>
      ) : data?.data.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Zatiaľ žiadne hodnotenia</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.data.map(assessment => {
            const avg = Math.round(
              assessment.ratings.reduce((sum, r) => sum + r.value, 0) / assessment.ratings.length * 10
            ) / 10;

            return (
              <Card key={assessment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {formatDate(assessment.weekStart)} – {formatDate(assessment.weekEnd)}
                    </CardTitle>
                    <span className="text-lg font-bold text-blue-400">Ø {avg}/10</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LIFE_ASPECTS.map(aspect => {
                      const rating = assessment.ratings.find(r => r.aspectId === aspect.id);
                      const value = rating?.value ?? 0;
                      return (
                        <div key={aspect.id} className="flex items-center gap-2">
                          <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: aspect.color }} />
                          <span className="text-xs text-muted-foreground truncate">{aspect.label.split(' ')[0]}</span>
                          <span className="text-xs font-semibold ml-auto" style={{ color: aspect.color }}>{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          {data && data.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {data.meta.last_page}
              </span>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                disabled={page === data.meta.last_page}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

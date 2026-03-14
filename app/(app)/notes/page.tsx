'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { PREDEFINED_TAGS } from '@/types/notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

export default function NotesPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notes', page],
    queryFn: () => api.notes.getAll(page),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.notes.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const notes = data?.data ?? [];
  const filtered = activeTag ? notes.filter(n => n.tags.includes(activeTag)) : notes;

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Poznámky</h1>
          <p className="text-muted-foreground text-sm mt-1">Tvoje myšlienky a nápady</p>
        </div>
        <Link href="/notes/create">
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Nová poznámka
          </Button>
        </Link>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeTag === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-foreground'
            }`}
          >
            Všetky
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeTag === tag
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center space-y-4">
          <FileText className="size-10 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">Žiadne poznámky</h3>
          <p className="text-muted-foreground text-sm">Začni písať svoje myšlienky a nápady.</p>
          <Link href="/notes/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              Prvá poznámka
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(note => (
              <Card key={note.id} className="group hover:bg-accent/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/notes/${note.id}`} className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-snug line-clamp-1 hover:text-primary transition-colors">
                        {note.title || 'Bez názvu'}
                      </CardTitle>
                    </Link>
                    <button
                      onClick={() => deleteMutation.mutate(note.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(note.createdAt), 'd. MMM yyyy', { locale: sk })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {note.content.replace(/[#*`_~\[\]]/g, '')}
                    </p>
                  )}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {data && data.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {data.meta.last_page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))} disabled={page === data.meta.last_page}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

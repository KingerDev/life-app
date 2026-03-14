'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { useModulesStore } from '@/lib/store';
import { PREDEFINED_TAGS } from '@/types/notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

export function NotesCard() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { notesEnabled } = useModulesStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const { data } = useQuery({
    queryKey: ['notes', 1],
    queryFn: () => api.notes.getAll(1),
    enabled: notesEnabled,
  });

  const recentNotes = data?.data.slice(0, 2) ?? [];

  const mutation = useMutation({
    mutationFn: () => api.notes.create({ title, content, tags }),
    onSuccess: () => {
      setTitle('');
      setContent('');
      setTags([]);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  if (!notesEnabled) return null;

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const canSave = title.trim() || content.trim();

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-violet-400" />
          <CardTitle className="text-base">Poznámky</CardTitle>
        </div>
        <Link href="/notes">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Detail <ChevronRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick capture form */}
        <div className="space-y-2 border border-border rounded-lg p-3">
          <input
            type="text"
            placeholder="Nadpis..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-sm font-medium bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
          />
          <textarea
            placeholder="Myšlienka, nápad..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full text-sm bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/50 leading-relaxed"
          />
          <div className="flex flex-wrap gap-1">
            {PREDEFINED_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  tags.includes(tag)
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/50'
                    : 'border-border text-muted-foreground hover:border-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              className="gap-1.5 h-7 text-xs"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !canSave}
            >
              <Plus className="size-3" />
              {mutation.isPending ? 'Ukladám...' : 'Uložiť'}
            </Button>
          </div>
        </div>

        {/* Recent notes */}
        {recentNotes.length > 0 && (
          <div className="space-y-2">
            {recentNotes.map(note => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <div className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{note.title || 'Bez názvu'}</p>
                    {note.content && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {note.content.replace(/[#*`_~\[\]]/g, '').substring(0, 60)}
                      </p>
                    )}
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {note.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs py-0">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(note.createdAt), 'd. MMM', { locale: sk })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

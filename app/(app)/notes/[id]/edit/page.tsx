'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { PREDEFINED_TAGS } from '@/types/notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function EditNotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();

  const { data: note } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => api.notes.get(id),
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
    }
  }, [note]);

  const mutation = useMutation({
    mutationFn: () => api.notes.update(id, { title, content, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.push(`/notes/${id}`);
    },
  });

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const addCustomTag = () => {
    const t = customTagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags(prev => [...prev, t]);
      setCustomTagInput('');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href={`/notes/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Upraviť poznámku</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div>
            <input
              type="text"
              placeholder="Nadpis..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-lg font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <hr className="border-border" />
          <div>
            <textarea
              placeholder="Píš svoje myšlienky... (podporuje Markdown)"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              className="w-full bg-transparent border-none outline-none resize-none text-sm placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground font-medium">Štítky</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  tags.includes(tag)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {tags.filter(t => !PREDEFINED_TAGS.includes(t as typeof PREDEFINED_TAGS[number])).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.filter(t => !PREDEFINED_TAGS.includes(t as typeof PREDEFINED_TAGS[number])).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs gap-1">
                  {tag}
                  <button onClick={() => toggleTag(tag)}>
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Vlastný štítok..."
              value={customTagInput}
              onChange={e => setCustomTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addCustomTag(); } }}
              className="flex-1 text-sm bg-muted rounded-md px-3 py-1.5 outline-none border border-transparent focus:border-border"
            />
            <Button variant="outline" size="sm" onClick={addCustomTag} disabled={!customTagInput.trim()}>
              Pridať
            </Button>
          </div>
        </CardContent>
      </Card>

      {mutation.isError && (
        <p className="text-sm text-destructive text-center">
          Uloženie zlyhalo. Skontroluj pripojenie a skús znova.
        </p>
      )}
      <div className="flex gap-3">
        <Link href={`/notes/${id}`} className="flex-1">
          <Button variant="outline" className="w-full">Zrušiť</Button>
        </Link>
        <Button
          className="flex-1 gap-2"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || (!title.trim() && !content.trim())}
        >
          <Save className="size-4" />
          {mutation.isPending ? 'Ukladám...' : 'Uložiť zmeny'}
        </Button>
      </div>
    </div>
  );
}

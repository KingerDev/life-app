'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();

  const { data: note, isLoading } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => api.notes.get(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.notes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.push('/notes');
    },
  });

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  if (!note) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-muted-foreground">Poznámka nebola nájdená.</p>
        <Link href="/notes"><Button variant="outline">Späť</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <Link href="/notes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/notes/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="size-4" />
              Upraviť
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4" />
            Zmazať
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{note.title || 'Bez názvu'}</h1>
        <p className="text-xs text-muted-foreground">
          {format(new Date(note.createdAt), 'd. MMMM yyyy, HH:mm', { locale: sk })}
          {note.updatedAt !== note.createdAt && (
            <span> · upravené {format(new Date(note.updatedAt), 'd. MMM yyyy', { locale: sk })}</span>
          )}
        </p>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {note.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content || '*Žiadny obsah*'}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import clsx from 'clsx';

interface LinkPreview {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
  error?: string;
}

interface LinkChipsProps {
  urls: string[];
}

const unique = (arr: string[]) => Array.from(new Set(arr));

export default function LinkChips({ urls }: LinkChipsProps) {
  const [previews, setPreviews] = useState<LinkPreview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = unique(urls).slice(0, 6);
    if (u.length === 0) { setPreviews([]); return; }

    let mounted = true;
    setLoading(true);

    supabase.functions.invoke('link-preview', { body: { urls: u } })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('link-preview error', error);
          setPreviews([]);
          return;
        }
        setPreviews((data?.results as LinkPreview[]) || []);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [urls.join('|')]);

  const previewsWithImages = previews.filter(p => p.image);
  
  if (loading || previewsWithImages.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
      {previewsWithImages.map((p) => (
        <a
          key={p.url}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Card
            className={clsx(
              'relative overflow-hidden rounded-xl border bg-card hover:shadow-md transition-shadow',
            )}
          >
            <div className="relative h-24 w-full">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title || p.domain || 'website'}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-2">
                  {p.domain && (
                    <img
                      src={`https://icons.duckduckgo.com/ip3/${p.domain}.ico`}
                      alt="favicon"
                      loading="lazy"
                      className="h-4 w-4 rounded-sm"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <span className="text-xs text-muted-foreground truncate">{p.domain}</span>
                </div>
                <div className="text-sm font-medium truncate text-foreground">{p.title || p.url}</div>
              </div>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}

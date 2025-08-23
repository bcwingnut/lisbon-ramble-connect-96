import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function absoluteUrl(url: string, base: string) {
  try {
    return new URL(url, base).toString();
  } catch (_) {
    return null;
  }
}

async function getTextWithTimeout(url: string, timeoutMs = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    const html = await res.text();
    return { ok: res.ok, status: res.status, html };
  } finally {
    clearTimeout(id);
  }
}

function extractOg(html: string, baseUrl: string) {
  const getMeta = (property: string) => {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
    const m = html.match(re);
    return m?.[1] ?? null;
  };

  const titleTag = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null;

  let image = getMeta('og:image') || getMeta('twitter:image') || null;
  if (image) {
    const abs = absoluteUrl(image, baseUrl);
    image = abs || image;
  }

  const description = getMeta('og:description') || getMeta('description') || null;
  const title = getMeta('og:title') || titleTag;

  return { title, description, image };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const urls: string[] = Array.isArray(body?.urls)
      ? body.urls
      : body?.url
        ? [body.url]
        : [];

    if (!urls.length) {
      return new Response(JSON.stringify({ error: 'No URLs provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = await Promise.all(urls.map(async (raw) => {
      try {
        const u = new URL(raw);
        const base = `${u.protocol}//${u.host}`;
        const res = await getTextWithTimeout(raw);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const { title, description, image } = extractOg(res.html, base);
        const domain = u.hostname;
        const fallbackFavicon = `${u.protocol}//icons.duckduckgo.com/ip3/${domain}.ico`;
        return { url: raw, title, description, image: image || fallbackFavicon, domain };
      } catch (e) {
        return { url: raw, error: (e as Error).message };
      }
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('link-preview error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

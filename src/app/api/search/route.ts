import { NextRequest, NextResponse } from 'next/server';
import {
  getDramaBoxSearch,
  getDramaNovaSearch,
  getFreeReelsSearch,
  getMeloloSearch,
  getNetShortSearch,
  getReelShortSearch,
  getShortMaxSearch,
} from '@/lib/api';

export const revalidate = 60;

type Provider = 'dramabox' | 'reelshort' | 'shortmax' | 'netshort' | 'melolo' | 'freereels' | 'dramanova';

function pickStringDeep(input: unknown, keys: string[]): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    for (const v of input) {
      const found = pickStringDeep(v, keys);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    for (const v of Object.values(obj)) {
      const found = pickStringDeep(v, keys);
      if (found) return found;
    }
  }
  return undefined;
}

function toList(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const obj = payload as Record<string, unknown>;
  for (const key of ['data', 'result', 'results', 'list', 'lists', 'items', 'books', 'cell']) {
    const val = obj[key];
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      const nested = toList(val);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

function normalize(provider: Provider, items: any[]) {
  return items.slice(0, 8).map((item, idx) => {
    const id =
      pickStringDeep(item, ['bookId', 'book_id', 'shortPlayId', 'id', 'bookid']) ||
      String(idx);
    const title =
      pickStringDeep(item, ['bookName', 'book_name', 'book_title', 'shortPlayName', 'title', 'name']) ||
      'Unknown';
    let image =
      pickStringDeep(item, [
        'coverWap',
        'cover',
        'book_pic',
        'first_chapter_cover',
        'thumb_url',
        'poster',
        'image',
        'thumbnail',
        'cover_url',
      ]) ||
      '/placeholder.svg';
    if (image.startsWith('//')) image = `https:${image}`;
    if (!image.includes('x-signature=')) {
      image = image.replace(/\.heic(\?.*)?$/i, '.jpg$1');
    }

    return { id, title, image, provider };
  });
}

export async function GET(request: NextRequest) {
  const provider = (request.nextUrl.searchParams.get('provider') || 'dramabox') as Provider;
  const q = (request.nextUrl.searchParams.get('q') || '').trim();

  if (!q) return NextResponse.json({ items: [] });

  let raw: any = null;
  if (provider === 'dramabox') raw = await getDramaBoxSearch(q);
  else if (provider === 'reelshort') raw = await getReelShortSearch(q);
  else if (provider === 'shortmax') raw = await getShortMaxSearch(q);
  else if (provider === 'netshort') raw = await getNetShortSearch(q);
  else if (provider === 'melolo') raw = await getMeloloSearch(q);
  else if (provider === 'freereels') raw = await getFreeReelsSearch(q);
  else if (provider === 'dramanova') raw = await getDramaNovaSearch(q);

  const items = normalize(provider, toList(raw));
  return NextResponse.json(
    { items },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  );
}

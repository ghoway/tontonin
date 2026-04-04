import { NextRequest, NextResponse } from 'next/server';
import { getReelShortEpisode } from '@/lib/api';

export const revalidate = 300;

function pickStreamUrl(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === 'string') {
    return payload.startsWith('http://') || payload.startsWith('https://') ? payload : null;
  }
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = pickStreamUrl(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    for (const key of ['url', 'streamUrl', 'playUrl', 'videoUrl', 'src', 'link', 'mediaUrl']) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim()) {
        if (value.startsWith('http://') || value.startsWith('https://')) return value;
      }
    }
    for (const value of Object.values(obj)) {
      const found = pickStreamUrl(value);
      if (found) return found;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get('bookId');
  const episodeParam = request.nextUrl.searchParams.get('episodeNumber');
  const episodeNumber = Number(episodeParam);

  if (!bookId || !Number.isFinite(episodeNumber) || episodeNumber <= 0) {
    return NextResponse.json({ error: 'Missing bookId or episodeNumber' }, { status: 400 });
  }

  const result = await getReelShortEpisode(bookId, episodeNumber);
  if (!result) {
    return NextResponse.json({ error: 'Failed to fetch episode' }, { status: 502 });
  }

  const streamUrl = pickStreamUrl(result);
  if (!streamUrl) {
    return NextResponse.json({ error: 'Stream URL not found' }, { status: 404 });
  }

  return NextResponse.json(
    { streamUrl },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}

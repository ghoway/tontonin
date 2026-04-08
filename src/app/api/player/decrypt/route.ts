import { NextRequest, NextResponse } from 'next/server';
import { decryptDramaBoxUrl } from '@/lib/api';

export const revalidate = 300;

function rewriteStreamUrl(value: unknown, requestUrl: string): unknown {
  if (typeof value === 'string') {
    const upstreamPrefix = 'https://api.sansekai.my.id/api/dramabox/decrypt-stream?url=';
    if (value.startsWith(upstreamPrefix)) {
      const streamUrl = value.slice(upstreamPrefix.length);
      const proxyUrl = new URL('/api/player/decrypt-stream', requestUrl);
      proxyUrl.searchParams.set('url', streamUrl);
      return proxyUrl.toString();
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewriteStreamUrl(item, requestUrl));
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    return Object.fromEntries(
      entries.map(([key, item]) => [key, rewriteStreamUrl(item, requestUrl)])
    );
  }

  return value;
}

export async function GET(request: NextRequest) {
  const encryptedUrl = request.nextUrl.searchParams.get('url');

  if (!encryptedUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const result = await decryptDramaBoxUrl(encryptedUrl);

  if (!result) {
    return NextResponse.json({ error: 'Failed to decrypt url' }, { status: 502 });
  }

  const rewritten = rewriteStreamUrl(result, request.url);

  return NextResponse.json(rewritten, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

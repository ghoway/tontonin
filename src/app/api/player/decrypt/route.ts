import { NextRequest, NextResponse } from 'next/server';
import { decryptDramaBoxUrl } from '@/lib/api';

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const encryptedUrl = request.nextUrl.searchParams.get('url');

  if (!encryptedUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const result = await decryptDramaBoxUrl(encryptedUrl);

  if (!result) {
    return NextResponse.json({ error: 'Failed to decrypt url' }, { status: 502 });
  }

  return NextResponse.json(result, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

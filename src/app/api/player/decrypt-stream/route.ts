import { NextRequest } from 'next/server';

export const revalidate = 300;

function forwardableHeaders(request: NextRequest) {
  const headers = new Headers();
  const range = request.headers.get('range');
  const accept = request.headers.get('accept');
  const acceptEncoding = request.headers.get('accept-encoding');
  const userAgent = request.headers.get('user-agent');

  if (range) headers.set('range', range);
  if (accept) headers.set('accept', accept);
  if (acceptEncoding) headers.set('accept-encoding', acceptEncoding);
  if (userAgent) headers.set('user-agent', userAgent);

  return headers;
}

function responseHeaders(upstreamResponse: Response) {
  const headers = new Headers();
  for (const key of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control', 'etag', 'last-modified']) {
    const value = upstreamResponse.headers.get(key);
    if (value) {
      headers.set(key, value);
    }
  }
  return headers;
}

export async function GET(request: NextRequest) {
  const encryptedUrl = request.nextUrl.searchParams.get('url');

  if (!encryptedUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const upstreamUrl = `https://api.sansekai.my.id/api/dramabox/decrypt-stream?url=${encodeURIComponent(encryptedUrl)}`;
  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'GET',
    headers: forwardableHeaders(request),
    cache: 'no-store',
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders(upstreamResponse),
  });
}
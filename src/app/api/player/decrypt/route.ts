import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const encryptedUrl = request.nextUrl.searchParams.get('url');

  if (!encryptedUrl) {
    console.error('Missing url parameter');
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const decryptUrl = `https://api.sansekai.my.id/dramabox/decrypt?url=${encodeURIComponent(encryptedUrl)}`;
    console.log('[DECRYPT] Calling external API:', decryptUrl.substring(0, 100) + '...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(decryptUrl, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });

    clearTimeout(timeoutId);
    console.log('[DECRYPT] API response status:', response.status);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorText = '';
      
      if (contentType?.includes('application/json')) {
        try {
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
        } catch {
          errorText = await response.text();
        }
      } else {
        errorText = await response.text();
      }
      
      console.error('[DECRYPT] API error response:', response.status, errorText.substring(0, 200));
      return NextResponse.json(
        { error: 'Failed to decrypt url from external API', apiStatus: response.status },
        { status: 502 }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('[DECRYPT] Invalid response content type:', contentType);
      return NextResponse.json({ error: 'Invalid API response format' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[DECRYPT] Success! Response keys:', Object.keys(result).join(', '));

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[DECRYPT] Error:', error.name, error.message);
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
      }
    } else {
      console.error('[DECRYPT] Unknown error:', error);
    }
    return NextResponse.json({ error: 'Failed to decrypt url' }, { status: 502 });
  }
}

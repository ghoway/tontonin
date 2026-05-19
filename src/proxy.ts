import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store for rate limiting
// Note: In a serverless environment (like Vercel), this map might be reset frequently.
// For a VPS/Node.js server, this works effectively as a per-process cache.
const rateLimit = new Map<string, { count: number; startTime: number }>();

export function proxy(request: NextRequest) {
  // Only apply rate limiting to /api routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Identify user by IP
  // Use headers for more reliable detection in various environments
  let ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  
  if (ip === '::1') ip = '127.0.0.1';

  const limit = 150; // Requests per window
  const windowMs = 60 * 1000; // 1 minute window

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 0, startTime: Date.now() });
  }

  const data = rateLimit.get(ip)!;
  
  // Reset window if time passed
  if (Date.now() - data.startTime > windowMs) {
    data.count = 0;
    data.startTime = Date.now();
  }

  data.count++;

  // Check limit
  if (data.count > limit) {
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Too Many Requests',
        error: "Terlalu banyak permintaan. Mohon tunggu sebentar."
      }),
      { status: 429, headers: { 'content-type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

// Configure which paths the proxy runs on
export const config = {
  matcher: '/api/:path*',
}

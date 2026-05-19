import { NextRequest, NextResponse } from "next/server";
import https from "https";
import http from "http";

export const dynamic = 'force-dynamic';

// Custom agent to ignore SSL issues
const agent = new https.Agent({
  rejectUnauthorized: false
});

// Helper: Make a request with redirect handling
function fetchHead(url: string, redirectCount = 5): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    if (redirectCount <= 0) return reject(new Error("Too many redirects"));

    const isHttp = url.startsWith("http:");
    const requestModule = isHttp ? http : https;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttp ? 80 : 443),
      path: urlObj.pathname + urlObj.search,
      method: 'GET', // Use GET with Range to properly activate stream
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Range": "bytes=0-0" // Request just the first byte
      },
      agent: isHttp ? undefined : agent,
      rejectUnauthorized: false,
      timeout: 8000,
    };

    const request = requestModule.request(options, (res) => {
      // Handle redirects manualy
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const newUrl = new URL(res.headers.location, url).href;
        res.resume(); // Consume response to free memory
        return resolve(fetchHead(newUrl, redirectCount - 1));
      }

      // Read/discard data to complete request
      res.resume();
      
      resolve({ 
        statusCode: res.statusCode || 500,
        headers: res.headers
      });
    });

    request.on('error', (e) => reject(e));
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error("Timeout"));
    });

    request.end();
  });
}

// Warm-up a video URL by making a GET (Range: 0-0) request
// This "activates" the URL on the CDN by following redirects and starting the stream
export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams;
  let url = urlParams.get("url");

  if (!url) {
    return NextResponse.json({ success: false, error: "Missing URL" }, { status: 400 });
  }

  // Handle double-encoded URLs (same logic as video proxy)
  const originalUrl = url;
  try {
    const [baseUrl, queryString] = url.split('?');
    if (baseUrl.includes('%2F') || baseUrl.includes('%3A')) {
      const decodedBase = decodeURIComponent(baseUrl);
      url = queryString ? `${decodedBase}?${queryString}` : decodedBase;
    }
  } catch (e) {
    url = originalUrl;
  }

  try {
    const { statusCode, headers } = await fetchHead(url!);
    
    // Consider 2xx as success (200 or 206 Partial Content)
    const success = statusCode >= 200 && statusCode < 400;

    return NextResponse.json({ 
      success, 
      status: statusCode,
      contentType: headers['content-type'],
      contentLength: headers['content-length'],
      contentRange: headers['content-range'],
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error("[Warmup] Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server"; 
import https from "https";
import http from "http";

export const dynamic = 'force-dynamic'; // Prevent static optimization

// Custom agent to ignore SSL issues
const agent = new https.Agent({
  rejectUnauthorized: false
});

// Helper: Fetch stream with redirect handling
function fetchStream(url: string, headers: any, redirectCount = 5): Promise<{ res: http.IncomingMessage; url: string }> {
  return new Promise((resolve, reject) => {
    if (redirectCount <= 0) return reject(new Error("Too many redirects"));

    const isHttp = url.startsWith("http:");
    const requestModule = isHttp ? http : https;
    
    const options = {
        headers: headers,
        agent: isHttp ? undefined : agent,
        rejectUnauthorized: false, 
        method: 'GET'
    };

    const req = requestModule.request(url, options, (res) => {
        if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
             const newUrl = new URL(res.headers.location, url).href;
             res.resume(); 
             return resolve(fetchStream(newUrl, headers, redirectCount - 1));
        }
        resolve({ res, url });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

// Helper: Consume stream to buffer (for rewriting text)
function streamToBuffer(stream: http.IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (c) => chunks.push(c));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Helper: Convert Node stream to Web ReadableStream (for streaming response)
// With proper error handling to prevent "Controller is already closed" errors
function nodeToWebStream(nodeStream: http.IncomingMessage): ReadableStream {
    let isClosed = false;
    
    return new ReadableStream({
        start(controller) {
            const safeClose = () => {
                if (!isClosed) {
                    isClosed = true;
                    try {
                        controller.close();
                    } catch (e) {
                        // Controller already closed, ignore
                    }
                }
            };
            
            const safeError = (err: Error) => {
                if (!isClosed) {
                    isClosed = true;
                    try {
                        controller.error(err);
                    } catch (e) {
                        // Controller already closed, ignore
                    }
                }
            };
            
            nodeStream.on('data', (chunk) => {
                if (!isClosed) {
                    try {
                        controller.enqueue(chunk);
                    } catch (e) {
                        // Controller closed (client disconnected), cleanup
                        isClosed = true;
                        nodeStream.destroy();
                    }
                }
            });
            
            nodeStream.on('end', safeClose);
            nodeStream.on('error', safeError);
            nodeStream.on('close', safeClose); // Handle abrupt close
        },
        cancel() {
            // Called when the consumer cancels the stream (e.g., client disconnects)
            isClosed = true;
            nodeStream.destroy();
        }
    });
}

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams;
  const url = urlParams.get("url");
  const refererParam = urlParams.get("referer");

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    const range = req.headers.get("range");
    const headers: any = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Referer": refererParam || new URL(url).origin + "/", 
      // NOTE: Do NOT send Origin header - video CDN returns 403 if Origin doesn't match their whitelist
    };

    if (range) {
      headers["Range"] = range;
    }

    // 1. Start Request (Get Stream)
    const { res: upstreamRes, url: finalUrl } = await fetchStream(url, headers);

    if ((upstreamRes.statusCode || 500) >= 400) {
       console.error(`Proxy fetch failed for ${url}: ${upstreamRes.statusCode}`);
       return new NextResponse(`Upstream Error: ${upstreamRes.statusMessage}`, { status: upstreamRes.statusCode });
    }

    const contentType = (upstreamRes.headers['content-type'] || "").toLowerCase();
    const lowUrl = finalUrl.toLowerCase();
    
    // 2. Identify Type
    const isM3u8 = contentType.includes("application/vnd.apple.mpegurl") || 
                   contentType.includes("application/x-mpegurl") ||
                   lowUrl.includes(".m3u8");
                   
    const isVtt = contentType.includes("text/vtt") || lowUrl.endsWith(".vtt") || lowUrl.endsWith(".srt") || urlParams.get("type") === "sub";

    // 3. IF BINARY (MP4, TS, etc) -> STREAM DIRECTLY
    if (!isM3u8 && !isVtt && (lowUrl.includes(".mp4") || lowUrl.includes(".ts") || contentType.includes("video/"))) {
        const stream = nodeToWebStream(upstreamRes);
        
        const responseHeaders = new Headers();
        responseHeaders.set("Content-Type", contentType || "video/mp4");
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Accept-Ranges", "bytes");
        
        if (upstreamRes.headers['content-length']) {
            responseHeaders.set("Content-Length", upstreamRes.headers['content-length']);
        }
        if (upstreamRes.headers['content-range']) {
            responseHeaders.set("Content-Range", upstreamRes.headers['content-range']);
        }

        return new NextResponse(stream as any, {
            status: upstreamRes.statusCode || 200,
            statusText: upstreamRes.statusMessage,
            headers: responseHeaders
        });
    }

    // 4. IF TEXT/HLS -> BUFFER & REWRITE
    const buffer = await streamToBuffer(upstreamRes);
    const decoder = new TextDecoder();
    
    // Double check content (sometimes headers lie)
    const firstChunk = decoder.decode(buffer.slice(0, 100)); 
    const isM3u8Content = firstChunk.includes("#EXTM3U");
    
    // DETERMINE VALID ORIGIN for rewrites
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https"; 
    const origin = `${proto}://${host}`;

    if (isM3u8 || isM3u8Content) {
        const text = decoder.decode(buffer);
        const baseUrl = new URL(finalUrl); 

        const subUrl = urlParams.get("sub");
        const isMasterPlaylist = text.includes("#EXT-X-STREAM-INF");

        let rewritten = text.split(/\r?\n/).map(line => {
            const trimmed = line.trim();
            if (!trimmed) return line;

            const createProxyUrl = (targetUrl: string) => {
                let base = `${origin}/api/proxy/video?url=${encodeURIComponent(targetUrl)}`;
                if (refererParam) base += `&referer=${encodeURIComponent(refererParam)}`;
                return base;
            };

            if (trimmed.startsWith('#')) {
                return line.replace(/URI="([^"]+)"/g, (match, uri) => {
                    try {
                        const absoluteUrl = new URL(uri, baseUrl.href).href;
                        return `URI="${createProxyUrl(absoluteUrl)}"`;
                    } catch (e) { return match; }
                });
            }
            
            try {
                const absoluteUrl = new URL(trimmed, baseUrl.href).href;
                return createProxyUrl(absoluteUrl);
            } catch (e) { return line; }
        }).join('\n');

        if (isMasterPlaylist && subUrl) {
            let proxiedSubUrl = `${origin}/api/proxy/video?url=${encodeURIComponent(subUrl)}`;
            if (refererParam) proxiedSubUrl += `&referer=${encodeURIComponent(refererParam)}`;
            
            const mediaLine = `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Indonesia",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="id",URI="${proxiedSubUrl}"`;
            rewritten = rewritten.replace("#EXTM3U", "#EXTM3U\n" + mediaLine);
            rewritten = rewritten.replace(/#EXT-X-STREAM-INF:(.*)/g, (match, attrs) => {
                if (attrs.includes("SUBTITLES=")) return match; 
                return `#EXT-X-STREAM-INF:${attrs},SUBTITLES="subs"`;
            });
        }

        return new NextResponse(rewritten, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.apple.mpegurl",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-store",
            }
        });
    }

    // VTT/SRT Logic
    if (isVtt || lowUrl.endsWith(".srt") || urlParams.get("type") === "sub") {
       let vttContent = decoder.decode(buffer);
       const isSrt = lowUrl.includes(".srt") || urlParams.get("type") === "sub";
       
       if (isSrt && !firstChunk.includes("WEBVTT")) {
           vttContent = vttContent.replace(/\r\n/g, '\n')
                        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
           vttContent = "WEBVTT\n\n" + vttContent;
       }
       
       vttContent = vttContent.replace(
           /((?:\d{2}:)?\d{2}:\d{2}\.\d{3} --> (?:\d{2}:)?\d{2}:\d{2}\.\d{3})(.*)/g, 
           (match, time, rest) => rest.includes("line:") ? match : `${time} line:75%${rest}`
       );

       return new NextResponse(vttContent, {
         status: 200,
         headers: {
           "Content-Type": "text/vtt",
           "Access-Control-Allow-Origin": "*",
           "Cache-Control": "no-store",
         }
       });
    }

    // FALLBACK: Just return buffered content (e.g. small unknown files)
    return new NextResponse(buffer as any, {
        status: upstreamRes.statusCode || 200,
        headers: {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
        }
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

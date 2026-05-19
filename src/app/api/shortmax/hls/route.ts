import { NextRequest } from "next/server";
import https from "https";
import http from "http";
import crypto from "crypto";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const AES_IV = Buffer.from('shortmax00000000', 'ascii');

function decryptSegment(buf: Buffer): Buffer {
  // Already a clean TS segment
  if (buf[0] === 0x47) return buf;

  // Check for "shortmax" header
  if (buf.length < 1040) return buf;
  const magic = buf.slice(0, 8).toString('ascii');
  if (magic !== 'shortmax') return buf;

  try {
    // 1. Parse header: extract key position
    const keyPos = parseInt(buf.slice(16, 20).toString('ascii'), 10);
    const keyOffset = keyPos - 24; // Convert absolute offset to key_data-relative

    // 2. Extract the 16-byte AES key from the key data
    const aesKey = buf.slice(24 + keyOffset, 24 + keyOffset + 16);

    // 3. Assemble ciphertext: tail16 + first 1024 bytes of payload
    const tail16 = buf.slice(1024, 1040);
    const payload = buf.slice(1040);
    const ciphertext = Buffer.concat([tail16, payload.slice(0, 1024)]);

    // 4. AES-128-CBC decrypt
    const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, AES_IV);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    // 5. Verify TS sync byte
    if (decrypted[0] !== 0x47) {
      console.log('[decrypt] ⚠ decrypted but no TS sync — serving raw');
      return buf.slice(1040);
    }

    // 6. Combine: decrypted first 1024 bytes + plaintext remainder
    return Buffer.concat([decrypted, payload.slice(1024)]);
  } catch (e: any) {
    console.log('[decrypt] ⚠ error:', e.message, '— stripping header');
    return buf.slice(1040);
  }
}

// ── Fetch with redirect support ─────────────────────────────────
const agent = new https.Agent({ rejectUnauthorized: false });

function fetchBuffer(url: string, redirectCount = 5): Promise<{ buffer: Buffer; finalUrl: string }> {
  return new Promise((resolve, reject) => {
    if (redirectCount <= 0) return reject(new Error("Too many redirects"));
    const isHttp = url.startsWith("http:");
    const mod = isHttp ? http : https;
    const req = mod.request(url, {
      method: 'GET',
      agent: isHttp ? undefined : agent,
      headers: {
        'User-Agent': 'okhttp/4.12.0',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
      },
      timeout: 30000,
    }, (res) => {
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const newUrl = new URL(res.headers.location, url).href;
        res.resume();
        return resolve(fetchBuffer(newUrl, redirectCount - 1));
      }
      if ((res.statusCode || 500) >= 400) {
        res.resume();
        return reject(new Error(`Upstream ${res.statusCode}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), finalUrl: url }));
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
    req.end();
  });
}

// ── Helper: return binary response ──────────────────────────────
function binaryResponse(data: Buffer, ct: string, cache = false): Response {
  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": ct,
      "Content-Length": String(data.length),
      "Access-Control-Allow-Origin": "*",
      ...(cache ? { "Cache-Control": "public, max-age=3600" } : {}),
    },
  });
}

// ── Main handler ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const { buffer, finalUrl } = await fetchBuffer(urlParam);
    const lowUrl = finalUrl.toLowerCase();
    const isM3u8 = lowUrl.includes('.m3u8') || buffer.slice(0, 7).toString().includes('#EXTM3U');
    const isTs = lowUrl.includes('.ts');

    // ── M3U8: rewrite segment URLs ──
    if (isM3u8) {
      const text = buffer.toString('utf8');
      const baseUrl = new URL(finalUrl);
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "http";
      const origin = `${proto}://${host}`;

      const rewritten = text.split(/\r?\n/).map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          // Rewrite URI="" attributes in #EXT tags (e.g. #EXT-X-KEY)
          return line.replace(/URI="([^"]+)"/g, (_m, uri) => {
            try {
              const abs = new URL(uri, baseUrl.href).href;
              return `URI="${origin}/api/shortmax/hls?url=${encodeURIComponent(abs)}"`;
            } catch { return _m; }
          });
        }
        // Segment or playlist URL line
        try {
          const abs = new URL(trimmed, baseUrl.href).href;
          return `${origin}/api/shortmax/hls?url=${encodeURIComponent(abs)}`;
        } catch { return line; }
      }).join('\n');

      return new Response(rewritten, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      });
    }

    // ── .ts segment: decrypt with AES-128-CBC ──
    if (isTs) {
      const decrypted = decryptSegment(buffer);
      // console.log(`[shortmax-hls] ${buffer.length} → ${decrypted.length} bytes, sync=${decrypted[0] === 0x47 ? '✓' : '✗'}`);
      return binaryResponse(decrypted, "video/mp2t", true);
    }

    // ── Fallback: pass through ──
    return binaryResponse(buffer, "application/octet-stream");
  } catch (error) {
    console.error("[SHORTMAX HLS Proxy Error]", error);
    return new Response(`Proxy error: ${error}`, { status: 502 });
  }
}

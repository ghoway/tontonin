const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TTL_MS = 5 * 60 * 1000;
const API_ERROR_TTL_MS = 30 * 1000;

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

type CacheEntry = {
  expiresAt: number;
  data: any;
};

declare global {
  // eslint-disable-next-line no-var
  var __nontoninApiCache: Map<string, CacheEntry> | undefined;
  // eslint-disable-next-line no-var
  var __nontoninApiInflight: Map<string, Promise<any>> | undefined;
}

const apiCache = globalThis.__nontoninApiCache ?? new Map<string, CacheEntry>();
const inflight = globalThis.__nontoninApiInflight ?? new Map<string, Promise<any>>();

if (!globalThis.__nontoninApiCache) {
  globalThis.__nontoninApiCache = apiCache;
}

if (!globalThis.__nontoninApiInflight) {
  globalThis.__nontoninApiInflight = inflight;
}

function makeCacheKey(endpoint: string, options: FetchOptions) {
  return JSON.stringify({
    endpoint,
    method: options.method || 'GET',
    body: options.body ?? null,
  });
}

async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const url = new URL(endpoint, API_URL);
  const method = options.method || 'GET';
  const cacheable = method === 'GET';
  const cacheKey = makeCacheKey(endpoint, options);

  if (cacheable) {
    const cached = apiCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const pending = inflight.get(cacheKey);
    if (pending) {
      return pending;
    }
  }
  
  const requestPromise = (async () => {
    try {
      const response = await fetch(url.toString(), {
        method,
        cache: method !== 'GET' ? 'no-store' : 'force-cache',
        next: method !== 'GET' ? undefined : { revalidate: 300 },
        headers: {
          'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);

        if (cacheable) {
          apiCache.set(cacheKey, {
            data: null,
            expiresAt: Date.now() + API_ERROR_TTL_MS,
          });
        }

        return null;
      }

      const json = await response.json();

      if (cacheable) {
        apiCache.set(cacheKey, {
          data: json,
          expiresAt: Date.now() + API_TTL_MS,
        });
      }

      return json;
    } catch (error) {
      console.error('API Fetch Error:', error);

      if (cacheable) {
        apiCache.set(cacheKey, {
          data: null,
          expiresAt: Date.now() + API_ERROR_TTL_MS,
        });
      }

      return null;
    } finally {
      if (cacheable) {
        inflight.delete(cacheKey);
      }
    }
  })();

  if (cacheable) {
    inflight.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

// DramaBox APIs
export async function getDramaBoxForYou(page?: number) {
  return apiFetch(`/api/dramabox/foryou${page ? `?page=${page}` : ''}`);
}

export async function getDramaBoxLatest() {
  return apiFetch('/api/dramabox/latest');
}

export async function getDramaBoxTrending() {
  return apiFetch('/api/dramabox/trending');
}

export async function getDramaBoxSearch(query: string) {
  return apiFetch(`/api/dramabox/search?query=${encodeURIComponent(query)}`);
}

export async function getDramaBoxDetail(bookId: string) {
  return apiFetch(`/api/dramabox/detail?bookId=${bookId}`);
}

export async function getDramaBoxAllEpisode(bookId: string) {
  return apiFetch(`/api/dramabox/allepisode?bookId=${bookId}`);
}

export async function decryptDramaBoxUrl(url: string) {
  return apiFetch(`/api/dramabox/decrypt?url=${encodeURIComponent(url)}`);
}

// ReelShort APIs
export async function getReelShortForYou(page?: number) {
  return apiFetch(`/api/reelshort/foryou${page ? `?page=${page}` : ''}`);
}

export async function getReelShortSearch(query: string) {
  return apiFetch(`/api/reelshort/search?query=${encodeURIComponent(query)}`);
}

export async function getReelShortDetail(bookId: string) {
  return apiFetch(`/api/reelshort/detail?bookId=${bookId}`);
}

// ShortMax APIs
export async function getShortMaxForYou(page?: number) {
  return apiFetch(`/api/shortmax/foryou${page ? `?page=${page}` : ''}`);
}

export async function getShortMaxLatest() {
  return apiFetch('/api/shortmax/latest');
}

export async function getShortMaxSearch(query: string) {
  return apiFetch(`/api/shortmax/search?query=${encodeURIComponent(query)}`);
}

export async function getShortMaxDetail(shortPlayId: string) {
  return apiFetch(`/api/shortmax/detail?shortPlayId=${shortPlayId}`);
}

// NetShort APIs
export async function getNetShortForYou(page?: number) {
  return apiFetch(`/api/netshort/foryou${page ? `?page=${page}` : ''}`);
}

export async function getNetShortSearch(query: string) {
  return apiFetch(`/api/netshort/search?query=${encodeURIComponent(query)}`);
}

// Melolo APIs
export async function getMeloloForYou(offset?: number) {
  return apiFetch(`/api/melolo/foryou${offset ? `?offset=${offset}` : ''}`);
}

export async function getMeloloLatest() {
  return apiFetch('/api/melolo/latest');
}

export async function getMeloloTrending() {
  return apiFetch('/api/melolo/trending');
}

export async function getMeloloSearch(query: string) {
  return apiFetch(`/api/melolo/search?query=${encodeURIComponent(query)}`);
}

// FreeReels APIs
export async function getFreeReelsForYou(offset?: number) {
  return apiFetch(`/api/freereels/foryou${offset ? `?offset=${offset}` : ''}`);
}

export async function getFreeReelsHomepage() {
  return apiFetch('/api/freereels/homepage');
}

export async function getFreeReelsSearch(query: string) {
  return apiFetch(`/api/freereels/search?query=${encodeURIComponent(query)}`);
}

// DramaNova APIs
export async function getDramaNovaHome(page?: number) {
  return apiFetch(`/api/dramanova/home${page ? `?page=${page}` : ''}`);
}

export async function getDramaNovaSearch(query: string) {
  return apiFetch(`/api/dramanova/search?query=${encodeURIComponent(query)}`);
}

export async function getDramaNovaDetail(id: string) {
  return apiFetch(`/api/dramanova/detail?id=${id}`);
}

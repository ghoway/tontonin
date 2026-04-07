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
    } catch {

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

function asArray(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const candidateKeys = [
    'data',
    'result',
    'results',
    'list',
    'lists',
    'items',
    'dramas',
    'episodes',
    'books',
    'cell',
    'rows',
    'contentInfos',
  ];
  for (const key of candidateKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
      const nested = asArray(value);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

// DramaBox APIs
export async function getDramaBoxForYou(page?: number) {
  const result = await apiFetch(`/api/dramabox/foryou${page ? `?page=${page}` : ''}`);
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getDramaBoxLatest() {
  const result = await apiFetch('/api/dramabox/latest');
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getDramaBoxTrending() {
  const result = await apiFetch('/api/dramabox/trending');
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getDramaBoxSearch(query: string) {
  return apiFetch(`/api/dramabox/search?query=${encodeURIComponent(query)}`);
}

export async function getDramaBoxDetail(bookId: string) {
  return apiFetch(`/api/dramabox/detail?bookId=${bookId}`);
}

export async function getDramaBoxAllEpisode(bookId: string) {
  const result = await apiFetch(`/api/dramabox/allepisode?bookId=${bookId}`);
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return result;
}

export async function decryptDramaBoxUrl(url: string) {
  return apiFetch(`/api/dramabox/decrypt?url=${encodeURIComponent(url)}`);
}

// ReelShort APIs
export async function getReelShortForYou(page?: number) {
  const result = await apiFetch(`/api/reelshort/foryou${page ? `?page=${page}` : ''}`);
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getReelShortSearch(query: string) {
  return apiFetch(`/api/reelshort/search?query=${encodeURIComponent(query)}`);
}

export async function getReelShortDetail(bookId: string) {
  return apiFetch(`/api/reelshort/detail?bookId=${bookId}`);
}

export async function getReelShortEpisode(bookId: string, episodeNumber: number) {
  return apiFetch(
    `/api/reelshort/episode?bookId=${encodeURIComponent(bookId)}&episodeNumber=${episodeNumber}`
  );
}

// ShortMax APIs
export async function getShortMaxForYou(page?: number) {
  const result = await apiFetch(`/api/shortmax/foryou${page ? `?page=${page}` : ''}`);
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getShortMaxLatest() {
  const result = await apiFetch('/api/shortmax/latest');
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getShortMaxSearch(query: string) {
  return apiFetch(`/api/shortmax/search?query=${encodeURIComponent(query)}`);
}

export async function getShortMaxDetail(shortPlayId: string) {
  return apiFetch(`/api/shortmax/detail?shortPlayId=${shortPlayId}`);
}

export async function getShortMaxAllEpisode(shortPlayId: string) {
  return apiFetch(`/api/shortmax/allepisode?shortPlayId=${shortPlayId}`);
}

// NetShort APIs
export async function getNetShortForYou(page?: number) {
  const result = await apiFetch(`/api/netshort/foryou${page ? `?page=${page}` : ''}`);
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getNetShortSearch(query: string) {
  return apiFetch(`/api/netshort/search?query=${encodeURIComponent(query)}`);
}

export async function getNetShortAllEpisode(shortPlayId: string) {
  return apiFetch(`/api/netshort/allepisode?shortPlayId=${shortPlayId}`);
}

// Melolo APIs
export async function getMeloloForYou(offset?: number) {
  const result = await apiFetch(`/api/melolo/foryou${offset ? `?offset=${offset}` : ''}`);
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getMeloloLatest() {
  const result = await apiFetch('/api/melolo/latest');
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getMeloloTrending() {
  const result = await apiFetch('/api/melolo/trending');
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getMeloloSearch(query: string) {
  const result = await apiFetch(`/api/melolo/search?query=${encodeURIComponent(query)}`);

  const searchData = (result as any)?.data?.search_data;
  if (Array.isArray(searchData)) {
    const books = searchData.flatMap((entry: any) =>
      Array.isArray(entry?.books) ? entry.books : []
    );
    if (books.length > 0) return books;
  }

  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getMeloloDetail(bookId: string) {
  return apiFetch(`/api/melolo/detail?bookId=${bookId}`);
}

export async function getMeloloStream(videoId: string) {
  return apiFetch(`/api/melolo/stream?videoId=${videoId}`);
}

// FreeReels APIs
export async function getFreeReelsForYou(offset?: number) {
  const result = await apiFetch(`/api/freereels/foryou${offset ? `?offset=${offset}` : ''}`);
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getFreeReelsHomepage() {
  const result = await apiFetch('/api/freereels/homepage');
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getFreeReelsSearch(query: string) {
  return apiFetch(`/api/freereels/search?query=${encodeURIComponent(query)}`);
}

export async function getFreeReelsDetailAndAllEpisode(key: string) {
  return apiFetch(`/api/freereels/detailAndAllEpisode?key=${encodeURIComponent(key)}`);
}

// DramaNova APIs
export async function getDramaNovaHome(page?: number) {
  const result = await apiFetch(`/api/dramanova/home${page ? `?page=${page}` : ''}`);
  const normalized = asArray(result);
  if (normalized.length > 0) return normalized;
  return [];
}

export async function getDramaNovaSearch(query: string) {
  return apiFetch(`/api/dramanova/search?query=${encodeURIComponent(query)}`);
}

export async function getDramaNovaDetail(id: string) {
  const byDramaId = await apiFetch(`/api/dramanova/detail?dramaId=${encodeURIComponent(id)}`);
  if (byDramaId) return byDramaId;

  // Backward-compatible fallback for deployments still expecting `id`.
  return apiFetch(`/api/dramanova/detail?id=${encodeURIComponent(id)}`);
}

export async function getDramaNovaGetVideo(fileId: string) {
  return apiFetch(`/api/dramanova/getvideo?fileId=${fileId}`);
}

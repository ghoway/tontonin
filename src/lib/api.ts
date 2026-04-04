const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const url = new URL(endpoint, API_URL);
  
  try {
    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    return null;
  }
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

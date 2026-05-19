import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { Drama, SearchResult } from "@/types/drama";

const API_BASE = "/api/dramabox";

import { fetchJson } from "@/lib/fetcher";

const REC_API_BASE = "/api/reelshort";

// Infinite Scroll Hook for DramaBox "Lainnya"
export function useInfiniteForYouDramas() {
  return useInfiniteQuery({
    queryKey: ["dramas", "foryou", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchJson<Drama[]>(`${API_BASE}/foryou?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage: Drama[], allPages: Drama[][]) => {
        // Stop if we received no data or less than expected
        // Also limit to 100 pages as requested
        if (!lastPage || lastPage.length === 0 || allPages.length >= 100) return undefined;
        return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Infinite Scroll Hook for ReelShort "Lainnya"
export function useInfiniteReelShortDramas() {
  return useInfiniteQuery({
    queryKey: ["reels", "foryou", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchJson<Drama[]>(`${REC_API_BASE}/foryou?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage: Drama[], allPages: Drama[][]) => {
        if (!lastPage || lastPage.length === 0 || allPages.length >= 100) return undefined;
        return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ... existing imports

export function useForYouDramas() {
  return useQuery({
    queryKey: ["dramas", "foryou"],
    queryFn: () => fetchJson<Drama[]>(`${API_BASE}/foryou`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLatestDramas() {
  return useQuery({
    queryKey: ["dramas", "latest"],
    queryFn: () => fetchJson<Drama[]>(`${API_BASE}/latest`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrendingDramas() {
  return useQuery({
    queryKey: ["dramas", "trending"],
    queryFn: () => fetchJson<Drama[]>(`${API_BASE}/trending`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchDramas(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["dramas", "search", normalizedQuery],
    queryFn: async () => {
         if (!normalizedQuery) return [];
         return fetchJson<SearchResult[]>(`${API_BASE}/search?query=${encodeURIComponent(normalizedQuery)}`);
    },
    enabled: normalizedQuery.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDubindoDramas() {
  return useQuery({
    queryKey: ["dramas", "dubindo"],
    queryFn: () => fetchJson<Drama[]>(`${API_BASE}/dubindo`),
    staleTime: 1000 * 60 * 5,
  });
}


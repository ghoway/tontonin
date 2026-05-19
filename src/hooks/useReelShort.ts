import { useQuery } from "@tanstack/react-query";
import type {
  ReelShortHomepageResponse,
  ReelShortSearchResponse,
} from "@/types/reelshort";

import { fetchJson } from "@/lib/fetcher";

const API_BASE = "/api/reelshort";

export function useReelShortHomepage() {
  return useQuery({
    queryKey: ["reelshort", "homepage"],
    queryFn: () => fetchJson<ReelShortHomepageResponse>(`${API_BASE}/homepage`),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useReelShortSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["reelshort", "search", normalizedQuery],
    queryFn: async () => {
         if (!normalizedQuery) return { success: true, data: [] };
         return fetchJson<ReelShortSearchResponse>(`${API_BASE}/search?query=${encodeURIComponent(normalizedQuery)}`);
    },
    enabled: normalizedQuery.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

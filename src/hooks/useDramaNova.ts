import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { DramaNovaListResponse, DramaNovaPagedResponse, DramaNovaItem, DramaNovaDetailResponse, DramaNovaVideoOuterResponse } from "@/types/dramanova";
import { decryptData } from "@/lib/crypto";

// Fetch Drama 18+
export function useDramaNovaDrama18() {
  return useQuery({
    queryKey: ["dramanova", "drama18"],
    queryFn: async () => {
      const res = await fetch("/api/dramanova/drama18");
      if (!res.ok) throw new Error("Gagal mengambil data Drama 18+");
      const resJson = await res.json();
      const data: DramaNovaListResponse = decryptData(resJson.data);
      const items = data.data?.flatMap(category => category.recommendModules) || [];
      const seen = new Set();
      return items.filter((item) => {
        if (seen.has(item.dramaId)) return false;
        seen.add(item.dramaId);
        return true;
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch Komik
export function useDramaNovaKomik() {
  return useQuery({
    queryKey: ["dramanova", "komik"],
    queryFn: async () => {
      const res = await fetch("/api/dramanova/komik");
      if (!res.ok) throw new Error("Gagal mengambil data Komik");
      const resJson = await res.json();
      const data: DramaNovaPagedResponse = decryptData(resJson.data);
      return data.rows || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch Lainnya (Home Infinite Scroll)
export function useInfiniteDramaNovaHome() {
  return useInfiniteQuery({
    queryKey: ["dramanova", "home"],
    queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
      const res = await fetch(`/api/dramanova/home?page=${pageParam}`);
      if (!res.ok) throw new Error("Gagal mengambil data home");
      const resJson = await res.json();
      const data: DramaNovaPagedResponse = decryptData(resJson.data);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Assuming 100 max pages as specified, or stop when no rows returned
      if (!lastPage.rows || lastPage.rows.length === 0 || allPages.length >= 100) return undefined;
      return allPages.length + 1;
    },
  });
}

// Fetch Search
export function useDramaNovaSearch(query: string) {
  return useQuery({
    queryKey: ["dramanova", "search", query],
    queryFn: async () => {
      if (!query) return [];
      const res = await fetch(`/api/dramanova/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Gagal mengambil data search");
      const resJson = await res.json();
      const data: DramaNovaPagedResponse = decryptData(resJson.data);
      return data.rows || [];
    },
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch Detail
export function useDramaNovaDetail(dramaId: string) {
  return useQuery({
    queryKey: ["dramanova", "detail", dramaId],
    queryFn: async () => {
      if (!dramaId) throw new Error("ID Drama tidak diberikan");
      const res = await fetch(`/api/dramanova/detail?dramaId=${encodeURIComponent(dramaId)}`);
      if (!res.ok) throw new Error("Gagal mengambil data detail");
      const resJson = await res.json();
      const responseBody: DramaNovaDetailResponse = decryptData(resJson.data);
      return responseBody.data;
    },
    enabled: !!dramaId,
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch Video
export function useDramaNovaVideo(fileId: string) {
  return useQuery({
    queryKey: ["dramanova", "video", fileId],
    queryFn: async () => {
      if (!fileId) throw new Error("File ID tidak diberikan");
      const res = await fetch(`/api/dramanova/getvideo?fileId=${encodeURIComponent(fileId)}`);
      if (!res.ok) throw new Error("Gagal mengambil data video");
      const resJson = await res.json();
      const responseBody: DramaNovaVideoOuterResponse = decryptData(resJson.data);
      return responseBody.Result;
    },
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000,
  });
}

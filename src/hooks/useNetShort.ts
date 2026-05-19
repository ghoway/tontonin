"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

interface NetShortDrama {
  shortPlayId: string;
  shortPlayLibraryId: string;
  title: string;
  cover: string;
  labels: string[];
  heatScore: string;
  scriptName?: string;
  totalEpisodes?: number;
}

interface NetShortGroup {
  groupId: string;
  groupName: string;
  contentRemark: string;
  dramas: NetShortDrama[];
}

interface TheatersResponse {
  success: boolean;
  data: NetShortGroup[];
}

interface ForYouResponse {
  success: boolean;
  data: NetShortDrama[];
  maxOffset?: number;
  completed?: boolean;
}

interface SearchResponse {
  success: boolean;
  data: NetShortDrama[];
}

interface NetShortEpisode {
  episodeId: string;
  episodeNo: number;
  cover: string;
  videoUrl: string;
  quality: string;
  isLock: boolean;
  likeNums: string;
  subtitleUrl?: string;
}

interface DetailResponse {
  success: boolean;
  shortPlayId: string;
  shortPlayLibraryId: string;
  title: string;
  cover: string;
  description: string;
  labels: string[];
  totalEpisodes: number;
  isFinish: boolean;
  payPoint: number;
  episodes: NetShortEpisode[];
}

import { fetchJson } from "@/lib/fetcher";

// ... existing interfaces

export function useNetShortTheaters() {
  return useQuery<TheatersResponse>({
    queryKey: ["netshort", "theaters"],
    queryFn: () => fetchJson<TheatersResponse>("/api/netshort/theaters"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useNetShortForYou(page = 1) {
  return useQuery<ForYouResponse>({
    queryKey: ["netshort", "foryou", page],
    queryFn: () => fetchJson<ForYouResponse>(`/api/netshort/foryou?page=${page}`),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useInfiniteNetShortDramas() {
  return useInfiniteQuery<ForYouResponse>({
    queryKey: ["netshort", "foryou", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchJson<ForYouResponse>(`/api/netshort/foryou?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Check API completed flag or page limit
      if (lastPage.completed || allPages.length >= 100) return undefined;
      return allPages.length + 1;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNetShortSearch(query: string) {
  return useQuery<SearchResponse>({
    queryKey: ["netshort", "search", query],
    queryFn: () => fetchJson<SearchResponse>(`/api/netshort/search?query=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useNetShortDetail(shortPlayId: string) {
  return useQuery<DetailResponse>({
    queryKey: ["netshort", "detail", shortPlayId],
    queryFn: () => fetchJson<DetailResponse>(`/api/netshort/detail?shortPlayId=${shortPlayId}`),
    enabled: !!shortPlayId,
    staleTime: 5 * 60 * 1000,
  });
}

export type { NetShortDrama, NetShortGroup, NetShortEpisode, DetailResponse };

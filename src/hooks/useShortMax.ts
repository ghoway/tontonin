"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";

export interface ShortMaxDrama {
  shortPlayId: number;
  title: string;
  cover: string;
  totalEpisodes: number;
  label?: string;
  collectNum?: number;
  playNum?: number;
  summary?: string;
}

export interface ShortMaxSearchResult {
  shortPlayId: number;
  shortPlayCode: number;
  title: string;
  cover: string;
  genre: string[];
}

interface ShortMaxResponse {
  success: boolean;
  data: ShortMaxDrama[];
  total?: number;
}

interface ShortMaxForYouResponse {
  success: boolean;
  data: ShortMaxDrama[];
  page: number;
  isEnd: boolean;
  total?: number;
}

interface ShortMaxSearchResponse {
  success: boolean;
  data: ShortMaxSearchResult[];
  total?: number;
}

interface ShortMaxDetailResponse {
  success: boolean;
  shortPlayId: number;
  shortPlayCode: number;
  title: string;
  cover: string;
  description: string;
  labels: string[];
  totalEpisodes: number;
  updateEpisode: number;
  lockBegin: number;
  collectNum: number;
}

interface ShortMaxEpisodeResponse {
  success: boolean;
  shortPlayId: number;
  shortPlayName: string;
  totalEpisodes: number;
  episode: {
    episodeNum: number;
    id: number;
    duration: number;
    locked: boolean;
    cover: string;
    videoUrl: {
      video_480?: string;
      video_720?: string;
      video_1080?: string;
    };
  };
}

export function useShortMaxRekomendasi() {
  return useQuery<ShortMaxResponse>({
    queryKey: ["shortmax", "rekomendasi"],
    queryFn: () => fetchJson<ShortMaxResponse>("/api/shortmax/rekomendasi"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useShortMaxLatest() {
  return useQuery<ShortMaxResponse>({
    queryKey: ["shortmax", "latest"],
    queryFn: () => fetchJson<ShortMaxResponse>("/api/shortmax/latest"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInfiniteShortMaxDramas() {
  return useInfiniteQuery<ShortMaxForYouResponse>({
    queryKey: ["shortmax", "foryou", "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchJson<ShortMaxForYouResponse>(`/api/shortmax/foryou?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.isEnd || allPages.length >= 100) return undefined;
      return allPages.length + 1;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useShortMaxSearch(query: string) {
  return useQuery<ShortMaxSearchResponse>({
    queryKey: ["shortmax", "search", query],
    queryFn: () => fetchJson<ShortMaxSearchResponse>(`/api/shortmax/search?query=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useShortMaxDetail(shortPlayId: string) {
  return useQuery<ShortMaxDetailResponse>({
    queryKey: ["shortmax", "detail", shortPlayId],
    queryFn: () => fetchJson<ShortMaxDetailResponse>(`/api/shortmax/detail?shortPlayId=${shortPlayId}`),
    enabled: !!shortPlayId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useShortMaxEpisode(shortPlayId: string, episodeNumber: number) {
  return useQuery<ShortMaxEpisodeResponse>({
    queryKey: ["shortmax", "episode", shortPlayId, episodeNumber],
    queryFn: () => fetchJson<ShortMaxEpisodeResponse>(
      `/api/shortmax/episode?shortPlayId=${shortPlayId}&episodeNumber=${episodeNumber}`
    ),
    enabled: !!shortPlayId && episodeNumber > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export type { ShortMaxResponse, ShortMaxForYouResponse, ShortMaxSearchResponse, ShortMaxDetailResponse, ShortMaxEpisodeResponse };


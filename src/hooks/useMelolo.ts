
"use client";

import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";

// Interfaces based on Melolo JSON response
export interface MeloloBook {
  book_id: string;
  book_name: string;
  thumb_url: string;
  abstract?: string;
  author?: string;
  book_status?: string; // "1" ?
  category_info?: string; // JSON string
  stat_infos?: string[];
  serial_count?: number;
  [key: string]: any;
}

export interface MeloloResponse {
  algo: number;
  books: MeloloBook[];
  has_more?: boolean;
  next_offset?: number;
}

export interface MeloloSearchResponse {
  code: number;
  data: {
    search_data: {
      books: MeloloBook[];
    }[];
  };
}

export interface MeloloVideo {
  vid: string;
  vid_index: number;
  title: string;
  cover: string;
  episode_cover: string;
  duration: number;
  digged_count: number;
  comment_count: number;
  [key: string]: any;
}

export interface MeloloDetailResponse {
  code: number;
  data: {
    video_data: {
      series_id_str: string;
      series_title: string;
      series_cover: string;
      series_intro: string;
      episode_cnt: number;
      video_list: MeloloVideo[];
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export interface MeloloStreamResponse {
  code: number;
  data: {
    main_url: string;
    video_model: string | any; // JSON string or object containing more details if needed
    [key: string]: any;
  };
}

export function useMeloloLatest() {
  return useQuery<MeloloResponse>({
    queryKey: ["melolo", "latest"],
    queryFn: () => fetchJson<MeloloResponse>("/api/melolo/latest"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMeloloTrending() {
  return useQuery<MeloloResponse>({
    queryKey: ["melolo", "trending"],
    queryFn: () => fetchJson<MeloloResponse>("/api/melolo/trending"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMeloloSearch(query: string) {
  return useQuery<MeloloSearchResponse>({
    queryKey: ["melolo", "search", query],
    queryFn: () => fetchJson<MeloloSearchResponse>(`/api/melolo/search?query=${encodeURIComponent(query)}`),
    enabled: !!query,
  });
}

export function useMeloloDetail(bookId: string) {
  return useQuery<MeloloDetailResponse>({
    queryKey: ["melolo", "detail", bookId],
    queryFn: () => fetchJson<MeloloDetailResponse>(`/api/melolo/detail?bookId=${bookId}`),
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMeloloStream(videoId: string) {
  return useQuery<MeloloStreamResponse>({
    queryKey: ["melolo", "stream", videoId],
    queryFn: () => fetchJson<MeloloStreamResponse>(`/api/melolo/stream?videoId=${videoId}`),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

// Infinite Scroll Hook for Melolo
export function useInfiniteMeloloDramas() {
  return useInfiniteQuery<MeloloResponse>({
    queryKey: ["melolo", "foryou", "infinite"],
    queryFn: ({ pageParam = 0 }) => fetchJson<MeloloResponse>(`/api/melolo/foryou?offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.has_more && lastPage.next_offset !== undefined) {
          return lastPage.next_offset;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

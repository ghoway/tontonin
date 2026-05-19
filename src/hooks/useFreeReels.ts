
"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";

// Interfaces based on FreeReels JSON response
export interface FreeReelsItem {
  key: string;
  cover: string;
  title: string;
  desc: string;
  episode_count: number;
  follow_count: number;
  content_tags?: string[];
  container?: {
    kind: string;
    episode_info?: {
      id: string;
      name: string;
    };
    next_episode?: {
      id: string;
      name: string;
    };
  };
  link?: string;
  [key: string]: any;
}

export interface FreeReelsForYouResponse {
  code: number;
  message: string;
  data: {
    items: FreeReelsItem[];
    page_info?: {
       next: string;
       has_more: boolean;
    };
  };
}

// ... types
export interface FreeReelsModule {
  type: string;
  module_name?: string;
  items: FreeReelsItem[];
  // For 'recommend' type which has nested card
  [key: string]: any;
}

export interface FreeReelsPageResponse {
  code: number;
  message: string;
  data: {
    items: FreeReelsModule[];
  };
}

export interface FreeReelsHomeResponse {
  code: number;
  message: string;
  data: {
    items: FreeReelsItem[];
  };
}

export interface FreeReelsDetailResponse {
  data: FreeReelsItem;
}

export function useFreeReelsForYou() {
  return useQuery<FreeReelsForYouResponse>({
    queryKey: ["freereels", "foryou"],
    queryFn: () => fetchJson<FreeReelsForYouResponse>("/api/freereels/foryou"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInfiniteFreeReelsDramas() {
  return useInfiniteQuery<FreeReelsForYouResponse>({
    queryKey: ["freereels", "foryou", "infinite"],
    queryFn: ({ pageParam = 0 }) => fetchJson<FreeReelsForYouResponse>(`/api/freereels/foryou?offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
        // User requested multiples of 20 (0, 20, 40...)
        if (lastPage.data?.page_info?.has_more) {
             const nextOffset = allPages.length * 20;
             if (nextOffset >= 100) return undefined; // safety limit
             return nextOffset;
        }
        return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFreeReelsHome() {
  return useQuery<FreeReelsPageResponse>({
    queryKey: ["freereels", "home"],
    queryFn: () => fetchJson<FreeReelsPageResponse>("/api/freereels/home"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFreeReelsAnime() {
  return useQuery<FreeReelsPageResponse>({
    queryKey: ["freereels", "anime"],
    queryFn: () => fetchJson<FreeReelsPageResponse>("/api/freereels/anime"),
    staleTime: 5 * 60 * 1000,
  });
}

// Search Response Interface
export interface FreeReelsSearchItem {
  id: string;
  name: string;
  cover: string;
  desc?: string;
  episode_count?: number;
  [key: string]: any;
}

export interface FreeReelsSearchResponse {
  code: number;
  message: string;
  data: {
    items: FreeReelsSearchItem[];
  };
}

export function useFreeReelsDetail(bookId: string) {
  return useQuery({
    queryKey: ["freereels", "detail", bookId],
    queryFn: () => fetchJson<any>(`/api/freereels/detail?id=${bookId}`),
     select: (response) => {
       // Response has { data: { info: { ... }, ... } }
       const info = response.data?.info;
       if (!info) return null;
       
       // Transform info to FreeReelsItem
       const episodes = info.episode_list?.map((ep: any) => {
           // Find Indonesian subtitle if available
           const indoSub = ep.subtitle_list?.find((sub: any) => sub.language === 'id-ID');
           
           return {
               id: ep.id,
               name: ep.name,
               index: (info.episode_list?.indexOf(ep) || 0),
               videoUrl: ep.video_url || ep.external_audio_h264_m3u8 || "", 
               m3u8_url: ep.m3u8_url || "",
               external_audio_h264_m3u8: ep.external_audio_h264_m3u8 || "",
               external_audio_h265_m3u8: ep.external_audio_h265_m3u8 || "",
               cover: ep.cover || info.cover,
               // Subtitle extraction
               subtitleUrl: indoSub?.subtitle || indoSub?.vtt || "",
               originalAudioLanguage: ep.original_audio_language || "",
           };
       }) || [];

       return {
         data: {
           ...info,
           key: info.id,
           title: info.name,
           follow_count: info.follow_count || 0,
           episodes: episodes,
         } as FreeReelsItem
       };
    },
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFreeReelsSearch(query: string) {
  return useQuery({
    queryKey: ["freereels", "search", query],
    queryFn: () => fetchJson<FreeReelsSearchResponse>(`/api/freereels/search?query=${encodeURIComponent(query)}`),
    select: (response) => {
        // Transform search items to FreeReelsItem format
        return response.data?.items?.map(item => ({
            ...item,
            key: item.id,
            title: item.name,
            follow_count: item.follow_count || 0,
        })) as FreeReelsItem[] || [];
    },
    enabled: !!query,
    staleTime: 60 * 1000,
  });
}

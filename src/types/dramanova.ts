export interface DramaNovaItem {
  dramaId: string;
  defaultLanguage: string;
  sourceProvider: string;
  videoSource?: string | null;
  subtitleStyle?: string;
  posterImg: string;
  posterImgUrl: string;
  bannerImg?: string | null;
  bannerImgUrl?: string | null;
  totalEpisodes: number;
  isCompleted: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  publishedAt: string;
  title: string;
  synopsis: string;
  description: string;
  categoryNames: string[];
}

export interface DramaNovaCategory {
  categoryKey: string;
  categoryName: string;
  recommendModules: DramaNovaItem[];
}

export interface DramaNovaListResponse {
  code: number;
  msg: string;
  data: DramaNovaCategory[];
}

export interface DramaNovaPagedResponse {
  code: number;
  msg: string;
  total: number;
  rows: DramaNovaItem[];
}

export interface DramaNovaCategoryDetail {
  id: number;
  name: string;
}

export interface DramaNovaSubtitleTrack {
  id: string;
  episodeId: string;
  language: string;
  label: string;
  url: string | null;
}

export interface DramaNovaEpisode {
  id: string;
  episodeNumber: number;
  episodeTitle: string;
  episodeType: number;
  thumbnailImg: string;
  viewCount: number;
  likeCount: number;
  previewDuration: number;
  status: string;
  fileId: string;
  videos: any[];
  subtitleTracks: DramaNovaSubtitleTrack[];
}

export interface DramaNovaDetailData {
  dramaId: string;
  sourceProvider: string;
  subtitleStyle?: string;
  defaultLanguage: string;
  posterImg: string;
  posterImgUrl: string;
  bannerImg?: string | null;
  bannerImgUrl?: string | null;
  totalEpisodes: number;
  isCompleted: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  publishedAt: string;
  title: string;
  synopsis: string;
  description: string;
  categories: DramaNovaCategoryDetail[];
  episodes: DramaNovaEpisode[];
}

export interface DramaNovaDetailResponse {
  code: number;
  msg: string;
  data: DramaNovaDetailData;
}

export interface DramaNovaPlayInfo {
  FileId: string;
  FileType: string;
  Format: string;
  Definition: string;
  MainPlayUrl: string;
  BackupPlayUrl: string;
}

export interface DramaNovaSubtitleInfo {
  LanguageId: number;
  Language: string;
  SubtitleUrl: string;
  Format: string;
}

export interface DramaNovaVideoResult {
  Vid: string;
  PlayInfoList: DramaNovaPlayInfo[];
  SubtitleInfoList: DramaNovaSubtitleInfo[];
}

export interface DramaNovaVideoOuterResponse {
  ResponseMetadata?: any;
  Result: DramaNovaVideoResult;
}

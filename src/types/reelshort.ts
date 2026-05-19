// ReelShort API Types

export interface ReelShortTag {
  tag_id: string;
  tag_name: string;
}

export interface ReelShortBookMark {
  type?: number;
  color?: string;
  text?: string;
  text_color?: string;
}

export interface ReelShortStartPlay {
  screen_mode: number;
  chapter_id: string;
  duration: number;
  video_pic: string;
  video_type: number;
  chapter_index: number;
  episode_index: number;
  play_info: string;
  aspect_ratio: number;
}

export interface ReelShortBook {
  book_id: string;
  book_type: number;
  book_title: string;
  book_pic: string;
  special_desc?: string;
  chapter_count: number;
  theme?: string[];
  collect_count?: number;
  read_count?: number;
  t_book_id?: string;
  screen_mode?: number;
  start_play_episode?: number;
  is_new?: number;
  first_chapter_id?: string;
  start_play?: ReelShortStartPlay;
  tag_list?: ReelShortTag[];
  have_trailer?: boolean;
  score?: number;
  book_mark?: ReelShortBookMark;
  rank_level?: string;
}

export interface ReelShortBannerJumpParam {
  book_id: string;
  t_book_id: string;
  book_type: number;
  book_title: string;
  book_theme?: string[];
  book_pic: string;
  collect_count?: number;
  chapter_count?: number;
}

export interface ReelShortBanner {
  b_id: number;
  title: string;
  pic: string;
  jump_type: number;
  app_page: number;
  jump_param: ReelShortBannerJumpParam;
  play_button?: number;
  pic_artistic_word?: string;
  book_mark?: ReelShortBookMark;
}

export interface ReelShortList {
  bs_id: number;
  tab_id: number;
  ui_style: number;
  banners?: ReelShortBanner[];
  books?: ReelShortBook[];
  display_play_num?: boolean;
  display_theme?: boolean;
  last_book_id?: string;
}

export interface ReelShortTab {
  tab_id: number;
  tab_name: string;
  last_modified_time: number;
  is_current?: number;
  tab_md5: string;
  sort: number;
  tab_category?: number;
}

export interface ReelShortHomepageData {
  hall_id: number;
  search_keyword_list: string[];
  tabs_md5: string;
  tab_list: ReelShortTab[];
  lists: ReelShortList[];
}

export interface ReelShortHomepageResponse {
  success: boolean;
  data: ReelShortHomepageData;
}

// Search types
export interface ReelShortSearchResult {
  book_id: string;
  book_title: string;
  book_pic: string;
  special_desc?: string;
  chapter_count: number;
  theme?: string[];
  book_mark?: ReelShortBookMark;
}

export interface ReelShortSearchResponse {
  success: boolean;
  data: ReelShortSearchResult[];
}

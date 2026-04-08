'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useError } from '@/components/ErrorModal';

type EpisodeStream = {
  episode: number;
  encryptedUrl?: string;
  streamUrl?: string;
  providerVideoId?: string;
};

interface WatchClientProps {
  drama: {
    bookId: string;
    bookName: string;
    coverWap: string;
    chapterCount: number;
    introduction: string;
    tags?: string[];
    playCount?: string;
  };
  streams: EpisodeStream[];
  initialEpisode?: string;
  backHref?: string;
  provider?: 'dramabox' | 'reelshort' | 'melolo' | 'shortmax' | 'netshort' | 'freereels' | 'dramanova';
  providerBookId?: string;
}

function pickStreamUrl(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === 'string') {
    // Only return valid URLs
    if (payload.startsWith('http://') || payload.startsWith('https://')) {
      return payload;
    }
    return null;
  }
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = pickStreamUrl(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    // Priority key order for finding stream URLs
    const directKeys = [
      'url', 'streamUrl', 'playUrl', 'videoUrl', 'src', 'link',
      'mediaUrl', 'downloadUrl', 'streamLink', 'video', 'stream',
      'streamingUrl', 'watchUrl', 'playStream', 'source'
    ];
    
    for (const key of directKeys) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim()) {
        // Verify it's a valid URL
        if (value.startsWith('http://') || value.startsWith('https://')) {
          return value;
        }
      }
    }
    
    // Recursively search nested objects and arrays
    for (const value of Object.values(obj)) {
      const found = pickStreamUrl(value);
      if (found) return found;
    }
  }
  return null;
}

export function WatchClient({
  drama,
  streams,
  initialEpisode = '1',
  backHref,
  provider,
  providerBookId,
}: WatchClientProps) {
  const { showError } = useError();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Tontonin';
  const [currentEpisode, setCurrentEpisode] = useState(parseInt(initialEpisode));
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [showPagination, setShowPagination] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const paginationHideTimerRef = useRef<number | null>(null);
  const resolvedUrlCacheRef = useRef<Map<number, string>>(new Map());
  const shouldAutoplayOnSourceChangeRef = useRef(true);
  const maxEpisode = drama.chapterCount || streams.length || 0;
  const episodeButtons = useMemo(
    () => Array.from({ length: maxEpisode }, (_, i) => i + 1),
    [maxEpisode]
  );

  const streamMap = useMemo(() => {
    const map = new Map<number, EpisodeStream>();
    for (const stream of streams) {
      map.set(stream.episode, stream);
    }
    return map;
  }, [streams]);

  const sourceType = useMemo(() => {
    if (!resolvedUrl) return undefined;
    const clean = resolvedUrl.split('?')[0].toLowerCase();
    if (clean.endsWith('.m3u8')) return 'application/x-mpegURL';
    if (clean.endsWith('.mpd')) return 'application/dash+xml';
    if (clean.endsWith('.webm')) return 'video/webm';
    return undefined;
  }, [resolvedUrl]);

  const clearPaginationHideTimer = useCallback(() => {
    if (paginationHideTimerRef.current !== null) {
      window.clearTimeout(paginationHideTimerRef.current);
      paginationHideTimerRef.current = null;
    }
  }, []);

  const schedulePaginationHide = useCallback(() => {
    clearPaginationHideTimer();
    paginationHideTimerRef.current = window.setTimeout(() => {
      setShowPagination(false);
    }, 1000);
  }, [clearPaginationHideTimer]);

  const showPaginationTemporarily = useCallback(() => {
    setShowPagination(true);
    schedulePaginationHide();
  }, [schedulePaginationHide]);

  useEffect(() => {
    showPaginationTemporarily();
  }, [currentEpisode, showPaginationTemporarily]);

  useEffect(() => {
    return () => {
      clearPaginationHideTimer();
    };
  }, [clearPaginationHideTimer]);

  useEffect(() => {
    let isActive = true;

    const tryResolveFromProvider = async () => {
      if (provider === 'reelshort' && providerBookId) {
        setIsResolving(true);
        try {
          const response = await fetch(
            `/api/player/reelshort?bookId=${encodeURIComponent(providerBookId)}&episodeNumber=${currentEpisode}`,
            { cache: 'force-cache' }
          );
          if (!response.ok) {
            setResolvedUrl('');
            return;
          }
          const payload = await response.json();
          const realUrl = pickStreamUrl(payload);
          if (!realUrl) {
            setResolvedUrl('');
            return;
          }
          resolvedUrlCacheRef.current.set(currentEpisode, realUrl);
          if (isActive) setResolvedUrl(realUrl);
          return;
        } catch {
          if (isActive) setResolvedUrl('');
          return;
        } finally {
          if (isActive) setIsResolving(false);
        }
        return;
      }

      if (provider === 'melolo') {
        const selectedStream = streamMap.get(currentEpisode);
        const videoId = selectedStream?.providerVideoId;
        if (!videoId) {
          setResolvedUrl('');
          return;
        }

        setIsResolving(true);
        try {
          const response = await fetch(
            `/api/player/melolo?videoId=${encodeURIComponent(videoId)}`,
            { cache: 'force-cache' }
          );
          if (!response.ok) {
            setResolvedUrl('');
            return;
          }
          const payload = await response.json();
          const realUrl = pickStreamUrl(payload);
          if (!realUrl) {
            setResolvedUrl('');
            return;
          }
          resolvedUrlCacheRef.current.set(currentEpisode, realUrl);
          if (isActive) setResolvedUrl(realUrl);
          return;
        } catch {
          if (isActive) setResolvedUrl('');
          return;
        } finally {
          if (isActive) setIsResolving(false);
        }
        return;
      }

      if (provider === 'dramanova') {
        const selectedStream = streamMap.get(currentEpisode);
        const fileId = selectedStream?.providerVideoId;
        if (!fileId) {
          setResolvedUrl('');
          return;
        }

        setIsResolving(true);
        try {
          const response = await fetch(
            `/api/player/dramanova?fileId=${encodeURIComponent(fileId)}`,
            { cache: 'force-cache' }
          );
          if (!response.ok) {
            setResolvedUrl('');
            return;
          }
          const payload = await response.json();
          const realUrl = pickStreamUrl(payload);
          if (!realUrl) {
            setResolvedUrl('');
            return;
          }
          resolvedUrlCacheRef.current.set(currentEpisode, realUrl);
          if (isActive) setResolvedUrl(realUrl);
          return;
        } catch {
          if (isActive) setResolvedUrl('');
          return;
        } finally {
          if (isActive) setIsResolving(false);
        }
      }

      setResolvedUrl('');
    };

    const resolveEpisodeUrl = async () => {
      const cached = resolvedUrlCacheRef.current.get(currentEpisode);
      if (cached) {
        setResolvedUrl(cached);
        return;
      }

      const selectedStream = streamMap.get(currentEpisode);
      if (!selectedStream) {
        await tryResolveFromProvider();
        return;
      }

      if (selectedStream.streamUrl) {
        resolvedUrlCacheRef.current.set(currentEpisode, selectedStream.streamUrl);
        setResolvedUrl(selectedStream.streamUrl);
        return;
      }

      if (!selectedStream.encryptedUrl) {
        await tryResolveFromProvider();
        return;
      }

      setIsResolving(true);
      try {
        const response = await fetch(
          `/api/player/decrypt?url=${encodeURIComponent(selectedStream.encryptedUrl)}`,
          { cache: 'force-cache' }
        );

        if (!response.ok) {
          showError('Silahkan coba beberapa saat lagi');
          setResolvedUrl('');
          return;
        }

        const payload = await response.json();
        const realUrl = pickStreamUrl(payload);
        if (!realUrl) {
          showError('Video tidak tersedia saat ini');
          setResolvedUrl('');
          return;
        }

        resolvedUrlCacheRef.current.set(currentEpisode, realUrl);
        if (isActive) {
          setResolvedUrl(realUrl);
        }
      } catch {
        showError('Silahkan coba beberapa saat lagi');
        if (isActive) {
          setResolvedUrl('');
        }
      } finally {
        if (isActive) {
          setIsResolving(false);
        }
      }
    };

    resolveEpisodeUrl();

    return () => {
      isActive = false;
    };
  }, [currentEpisode, streamMap, provider, providerBookId, showError]);

  const handleEpisodeChange = (ep: number) => {
    shouldAutoplayOnSourceChangeRef.current = true;
    setCurrentEpisode(ep);
    showPaginationTemporarily();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Auto-play to next episode when current episode ends
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleVideoEnd = () => {
      if (currentEpisode < maxEpisode) {
        handleEpisodeChange(currentEpisode + 1);
      }
    };

    // Use a small delay to ensure video is fully ready
    const timer = setTimeout(() => {
      videoElement.addEventListener('ended', handleVideoEnd);
    }, 100);

    return () => {
      clearTimeout(timer);
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentEpisode, maxEpisode, resolvedUrl]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <div
        className="w-full h-full relative"
        onMouseMove={showPaginationTemporarily}
        onMouseEnter={showPaginationTemporarily}
        onTouchStart={showPaginationTemporarily}
      >
        {/* Back Button */}
        <Link
          href={backHref || `/dramabox/${drama.bookId}`}
          prefetch={false}
          className={`absolute top-4 left-4 z-20 flex items-center gap-2 text-white/90 hover:text-white transition-all duration-300 p-2 -ml-2 rounded-full hover:bg-white/10 ${
            showPagination ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="m15 18-6-6 6-6"></path>
          </svg>
          <span className="font-bold hidden sm:inline shadow-black drop-shadow-md">{appName}</span>
        </Link>

        {/* Right Controls */}
        <div
          className={`absolute top-4 right-4 z-20 transition-all duration-300 ${
            showPagination ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <button 
            onClick={() => setShowEpisodeList(!showEpisodeList)}
            className="p-2 text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 drop-shadow-md"
            >
              <path d="M3 12h.01"></path>
              <path d="M3 18h.01"></path>
              <path d="M3 6h.01"></path>
              <path d="M8 12h13"></path>
              <path d="M8 18h13"></path>
              <path d="M8 6h13"></path>
            </svg>
          </button>
        </div>

        {/* Top Title Overlay */}
        <div
          className={`absolute top-0 left-0 right-0 z-10 pointer-events-none transition-all duration-300 ${
            showPagination ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div className="h-12 bg-linear-to-b from-black/55 via-black/20 to-transparent" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-center px-4 max-w-[85vw]">
            <p className="text-white text-lg font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] line-clamp-1">
              {drama.bookName}
            </p>
            <p className="text-zinc-200 text-xs font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              EP {currentEpisode}
            </p>
          </div>
        </div>

        {/* Video Player */}
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay
          playsInline
          preload="metadata"
          controlsList="nodownload"
          poster={drama.coverWap}
          key={`${currentEpisode}-${resolvedUrl}`}
          onLoadedMetadata={() => {
            if (!shouldAutoplayOnSourceChangeRef.current || !videoRef.current) return;
            videoRef.current.play().catch(() => {
              // Silently fail if autoplay is blocked
            });
            shouldAutoplayOnSourceChangeRef.current = false;
          }}
          onClick={(e) => {
            e.preventDefault();
            showPaginationTemporarily();
            if (!videoRef.current) return;
            if (videoRef.current.paused) {
              videoRef.current.play().catch(() => {
                // Silently fail if autoplay is blocked
              });
              return;
            }
            videoRef.current.pause();
          }}
        >
          {resolvedUrl ? <source src={resolvedUrl} type={sourceType} /> : null}
          Your browser does not support the video tag.
        </video>

        {/* Bottom Episode Counter with Navigation */}
        <div
          className={`absolute bottom-20 sm:bottom-20 md:bottom-20 left-1/2 transform -translate-x-1/2 z-20 transition-transform duration-1000 ease-out ${
            showPagination ? 'translate-y-0 opacity-100' : 'translate-y-40 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-4 bg-black/60 px-4 py-2 rounded text-white text-sm font-semibold">
            <button
              onClick={() => {
                if (currentEpisode > 1) handleEpisodeChange(currentEpisode - 1);
              }}
              disabled={currentEpisode <= 1}
              className="hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <span>Ep {currentEpisode} / {maxEpisode}</span>
            <button
              onClick={() => {
                if (currentEpisode < maxEpisode) handleEpisodeChange(currentEpisode + 1);
              }}
              disabled={currentEpisode >= maxEpisode}
              className="hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        {/* Episode List Modal */}
        {showEpisodeList && (
          <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-lg max-w-md w-full max-h-96 flex flex-col">
              <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Daftar Episode</h3>
                <button 
                  onClick={() => setShowEpisodeList(false)}
                  className="text-white hover:text-zinc-300 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4">
                <div className="grid grid-cols-5 gap-2">
                  {episodeButtons.map((ep) => (
                    <button
                      key={ep}
                      onClick={() => {
                        handleEpisodeChange(ep);
                        setShowEpisodeList(false);
                      }}
                      className={`py-2 px-1 rounded text-sm font-semibold transition-colors ${
                        currentEpisode === ep
                          ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {ep}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading/Error Indicators */}
        {isResolving && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <div className="flex flex-col items-center justify-center text-center gap-3 px-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-700/70" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 border-r-indigo-500 animate-spin" />
              </div>
              <p className="text-white text-3xl font-semibold">Memuat video...</p>
              <p className="text-zinc-300 text-lg">Mohon tunggu sebentar, data sedang diambil.</p>
            </div>
          </div>
        )}
        {!isResolving && !resolvedUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <p className="text-red-400 text-center">
              ❌ Video tidak tersedia
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

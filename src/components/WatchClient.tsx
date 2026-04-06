'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [currentEpisode, setCurrentEpisode] = useState(parseInt(initialEpisode));
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      <div className="w-full h-full relative">
        {/* Back Button */}
        <Link
          href={backHref || `/dramabox/${drama.bookId}`}
          prefetch={false}
          className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-lg transition-colors"
        >
          ←
        </Link>

        {/* Right Controls */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={() => setShowEpisodeList(!showEpisodeList)}
            className="w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors text-lg"
          >
            ≡
          </button>
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
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
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
            <p className="text-yellow-400 text-center">⏳ Memuat video...</p>
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

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useError } from '@/components/ErrorModal';

type EpisodeStream = {
  episode: number;
  encryptedUrl?: string;
  streamUrl?: string;
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
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolvedUrlCacheRef = useRef<Map<number, string>>(new Map());

  const qualities = ['1080p', '720p', '540p', '360p', '144p'];
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
  }, [currentEpisode, streamMap]);

  const handleEpisodeChange = (ep: number) => {
    setCurrentEpisode(ep);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={backHref || `/dramabox/${drama.bookId}`}
        prefetch={false}
        className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
      >
        ← Kembali
      </Link>

      {/* Video Player Container */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden">
        <div className="aspect-video bg-zinc-900 relative">
          {/* Video Player */}
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
            poster={drama.coverWap}
            key={`${currentEpisode}-${resolvedUrl}`}
          >
            {resolvedUrl ? <source src={resolvedUrl} type={sourceType} /> : null}
            Your browser does not support the video tag.
          </video>

          {/* Quality Selector Overlay */}
          <div className="absolute top-4 right-4 z-10">
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer text-sm"
            >
              {qualities.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Episode Info */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {drama.bookName}
        </h2>
        <p className="text-zinc-400">
          Episode {currentEpisode} dari {drama.chapterCount}
        </p>
        {isResolving && <p className="text-yellow-400 text-sm">⏳ Memuat video...</p>}
        {!isResolving && !resolvedUrl && (
          <p className="text-red-400 text-sm">
            ❌ Video untuk episode ini belum tersedia.
          </p>
        )}
      </div>

      {/* Episode List */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Daftar Episode</h3>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-80 overflow-y-auto pr-2">
          {episodeButtons.map((ep) => (
            <button
              key={ep}
              onClick={() => handleEpisodeChange(ep)}
              className={`
                py-2 px-2 rounded font-semibold text-sm transition-colors
                ${
                  currentEpisode === ep
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }
              `}
            >
              {ep}
            </button>
          ))}
        </div>
      </div>

      {/* Synopsis */}
      <div className="space-y-3 bg-zinc-900 p-4 rounded-lg">
        <h3 className="text-xl font-semibold text-white">Sinopsis</h3>
        <p className="text-zinc-300 leading-relaxed">{drama.introduction}</p>
      </div>

      {/* Tags/Genres */}
      {drama.tags && drama.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Genre</h3>
          <div className="flex flex-wrap gap-2">
            {drama.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {drama.playCount && (
        <div className="space-y-2 text-zinc-400">
          <p>👁 {drama.playCount} views</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

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
  initialEpisode?: string;
}

export function WatchClient({ drama, initialEpisode = '1' }: WatchClientProps) {
  const [currentEpisode, setCurrentEpisode] = useState(parseInt(initialEpisode));
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const videoRef = useRef<HTMLVideoElement>(null);

  const qualities = ['1080p', '720p', '540p', '360p', '144p'];

  // Mock video source - replace with actual API endpoint
  const getVideoUrl = (episodeNum: number, quality: string) => {
    return `https://via.placeholder.com/1280x720?text=EP+${episodeNum}+${quality}`;
  };

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
        href={`/dramabox/${drama.bookId}`}
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
            controlsList="nodownload"
            poster={drama.coverWap}
          >
            <source src={getVideoUrl(currentEpisode, selectedQuality)} type="video/mp4" />
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
      </div>

      {/* Episode List */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Daftar Episode</h3>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-80 overflow-y-auto pr-2">
          {Array.from({ length: drama.chapterCount }, (_, i) => i + 1).map((ep) => (
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

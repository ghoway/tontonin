'use client';

import Link from 'next/link';

interface DramaCardProps {
  id: string;
  title: string;
  image: string;
  episodes?: number;
  views?: number | string;
  rating?: number;
  type?: 'dramabox' | 'reelshort' | 'shortmax' | 'netshort' | 'melolo' | 'freereels' | 'dramanova';
}

export function DramaCard({
  id,
  title,
  image,
  episodes,
  views,
  rating,
  type = 'dramabox',
}: DramaCardProps) {
  const baseUrl = type === 'dramabox' ? '/dramabox' : `/${type}`;
  
  return (
    <Link href={`${baseUrl}/${id}`} prefetch={false} className="group">
      <div className="relative overflow-hidden rounded-lg bg-zinc-900 cursor-pointer hover:shadow-lg transition-shadow h-full">
        {/* Image */}
        <div className="relative h-60 w-full overflow-hidden bg-zinc-800">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/placeholder.svg';
            }}
          />
          
          {/* Overlay with stats */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
            {rating && (
              <div className="flex items-center gap-1 self-end bg-yellow-500 px-2 py-1 rounded text-sm font-semibold text-black">
                ⭐ {rating.toFixed(1)}
              </div>
            )}
            <div className="space-y-1">
              {episodes && (
                <div className="flex items-center gap-2 text-white text-sm">
                  <span>▶</span>
                  <span>{episodes} Ep</span>
                </div>
              )}
              {views && (
                <div className="flex items-center gap-2 text-zinc-300 text-xs">
                  <span>👁</span>
                  <span>{typeof views === 'number' ? views.toLocaleString() : views}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="p-3">
          <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

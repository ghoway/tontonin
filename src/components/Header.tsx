'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function Header() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Nontonin';
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const searchBasePath = useMemo(() => {
    const providers = ['/dramabox', '/reelshort', '/melolo', '/shortmax', '/netshort', '/freereels', '/dramanova'];
    return providers.find((p) => pathname.startsWith(p)) || '/dramabox';
  }, [pathname]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`${searchBasePath}?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">▶</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">{appName}</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <form onSubmit={submitSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari drama, film, anime..."
                className="w-full px-4 py-2 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors sm:hidden"
            >
              🔍
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="pb-4 block sm:hidden">
            <form onSubmit={submitSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari drama, film, anime..."
                className="w-full px-4 py-2 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

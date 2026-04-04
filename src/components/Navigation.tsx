'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { label: 'DramaBox', href: '/dramabox', icon: '▶' },
  { label: 'ReelShort', href: '/reelshort', icon: '▶' },
  { label: 'ShortMax', href: '/shortmax', icon: '▶' },
  { label: 'NetShort', href: '/netshort', icon: '▶' },
  { label: 'Melolo', href: '/melolo', icon: '▶' },
  { label: 'FreeReels', href: '/freereels', icon: '▶' },
  { label: 'DramaNova', href: '/dramanova', icon: '▶' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-4 border-b border-zinc-800">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

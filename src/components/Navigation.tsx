'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'DramaBox', href: '/dramabox' },
  { label: 'ReelShort', href: '/reelshort' },
  { label: 'ShortMax', href: '/shortmax' },
  { label: 'NetShort', href: '/netshort' },
  { label: 'Melolo', href: '/melolo' },
  { label: 'FreeReels', href: '/freereels' },
  { label: 'DramaNova', href: '/dramanova' },
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const activeProvider = navItems.find((item) => pathname.startsWith(item.href));
  const activeValue = activeProvider?.href || '';

  const handleProviderChange = (value: string) => {
    router.push(value);
  };

  return (
    <div className="w-full">
      <Select value={activeValue} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-full bg-linear-to-r from-violet-600 to-indigo-600 border-0 text-white font-semibold hover:opacity-90">
          <SelectValue placeholder="Select Provider" />
        </SelectTrigger>
        <SelectContent>
          {navItems.map((item) => (
            <SelectItem key={item.href} value={item.href} className="font-semibold">
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { getDramaNovaKomik } from '@/lib/api';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get('page');
  const page = Number.parseInt(pageParam || '1', 10);
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const data = await getDramaNovaKomik(safePage);
  const rows = Array.isArray(data) ? data : [];

  return NextResponse.json(rows, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

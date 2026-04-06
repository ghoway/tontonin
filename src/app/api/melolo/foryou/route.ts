import { NextRequest, NextResponse } from 'next/server';
import { getMeloloForYou, getMeloloLatest, getMeloloTrending } from '@/lib/api';

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get('page') || '1');

  try {
    // Melolo upstream pagination is inconsistent, so we rotate sources to keep
    // "Lainnya" populated with real data and let client-side dedup handle overlap.
    let data: any[] = [];

    if (page === 2) {
      data = asArray(await getMeloloLatest());
    } else if (page === 3) {
      data = asArray(await getMeloloTrending());
    } else {
      data = asArray(await getMeloloForYou(page > 1 ? (page - 1) * 18 : undefined));
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

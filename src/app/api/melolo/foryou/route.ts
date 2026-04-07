import { NextRequest, NextResponse } from 'next/server';
import { getMeloloDetail, getMeloloForYou } from '@/lib/api';

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function pickMeloloDetailObject(input: any): any | null {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.video_data,
    input.data?.book,
    input.data?.detail,
    input.data,
    input.result,
    input.book,
    input.detail,
    input,
  ];

  for (const c of candidates) {
    if (c && typeof c === 'object' && !Array.isArray(c)) return c;
  }

  return null;
}

function normalizeThumbUrl(url: unknown) {
  if (typeof url !== 'string' || !url.trim()) return '';
  const match = url.match(/\/novel-images-sg\/([^?]+)~tplv-/i);
  if (!match?.[1]) return url;

  return `https://p16-novel-sg.ibyteimg.com/novel-images-sg/${match[1]}~tplv-shrink:640:0.jpg`;
}

async function enrichMeloloCovers(dramas: any[]): Promise<any[]> {
  if (!Array.isArray(dramas) || dramas.length === 0) return [];

  return Promise.all(
    dramas.map(async (drama) => {
      const hasStrongCover = Boolean(drama?.series_cover || drama?.book_pic);
      const idRaw = drama?.bookId || drama?.book_id || drama?.series_id_str;
      const id = idRaw == null ? '' : String(idRaw).trim();

      if (hasStrongCover || !id) {
        return {
          ...drama,
          thumb_url: normalizeThumbUrl(drama?.thumb_url),
        };
      }

      try {
        const detail = await getMeloloDetail(id);
        const obj = pickMeloloDetailObject(detail);
        if (!obj) {
          return {
            ...drama,
            thumb_url: normalizeThumbUrl(drama?.thumb_url),
          };
        }

        return {
          ...drama,
          series_cover: obj.series_cover || drama.series_cover,
          book_pic: obj.book_pic || drama.book_pic,
          first_chapter_cover: obj.first_chapter_cover || drama.first_chapter_cover,
          thumb_url: normalizeThumbUrl(drama?.thumb_url),
        };
      } catch {
        return {
          ...drama,
          thumb_url: normalizeThumbUrl(drama?.thumb_url),
        };
      }
    })
  );
}

export async function GET(request: NextRequest) {
  const offset = Number(request.nextUrl.searchParams.get('offset') || '10');
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 10;

  try {
    const data = asArray(await getMeloloForYou(safeOffset));
    const enriched = await enrichMeloloCovers(data);

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json([]);
  }
}

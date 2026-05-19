import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/melolo";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offset = searchParams.get("offset") || "0";
    
    // Melolo uses offset-based pagination
    const response = await fetch(`${UPSTREAM_API}/foryou?offset=${offset}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
        return encryptedResponse({ 
            books: [], 
            has_more: false, 
            next_offset: 0 
        });
    }

    const json = await safeJson<any>(response);
    const data = json.data;

    let books: any[] = [];
    
    // The structure is deeply nested: data.cell.cell_data[].books[]
    if (data?.cell?.cell_data && Array.isArray(data.cell.cell_data)) {
        data.cell.cell_data.forEach((section: any) => {
            if (section.books && Array.isArray(section.books)) {
                books = [...books, ...section.books];
            }
        });
    }

    // Also check for direct 'books' array inside 'cell'
    if (data?.cell?.books && Array.isArray(data.cell.books)) {
        books = [...books, ...data.cell.books];
    }

    // Also check for direct 'books' array in data just in case structure varies
    if (data?.books && Array.isArray(data.books)) {
        books = [...books, ...data.books];
    }
    
    // Extract pagination info
    // Prefer the top-level has_more/next_offset if available, otherwise check cell
    const hasMore = data?.has_more ?? data?.cell?.has_more ?? false;
    const nextOffset = data?.next_offset ?? data?.cell?.next_offset ?? 0;

    return encryptedResponse({
      books: books,
      has_more: hasMore,
      next_offset: nextOffset,
    });
  } catch (error) {
    console.error("Melolo ForYou Error:", error);
    return encryptedResponse({ 
        books: [], 
        has_more: false, 
        next_offset: 0 
    });
  }
}

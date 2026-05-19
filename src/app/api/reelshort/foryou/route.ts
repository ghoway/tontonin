import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/reelshort";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    
    const response = await fetch(`${UPSTREAM_API}/foryou?page=${page}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: response.status }
      );
    }

    const json = await safeJson<any>(response);
    
    // Check if the response has the expected structure
    // API returns: { success: true, data: { lists: [...] } }
    const rawList = json?.data?.lists || [];

    // Map the snake_case keys from ReelShort API to our standard camelCase Drama interface
    const mappedData = Array.isArray(rawList) 
      ? rawList.map((item: any) => ({
          bookId: item.book_id,
          bookName: item.book_title,
          coverWap: item.book_pic, // Map book_pic to coverWap
          cover: item.book_pic,    // Also map to cover for fallback
          chapterCount: item.chapter_count,
          introduction: item.special_desc,
          corner: item.start_play_episode ? { name: "Boleh Ditonton", color: "#FF4D4F" } : undefined // Mock corner if needed, or omit
        }))
      : [];
      
    // Filter out invalid items just in case
    const filteredData = mappedData.filter((item: any) => item && item.bookId);

    return encryptedResponse(filteredData);
  } catch (error) {
    console.error("ReelShort API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

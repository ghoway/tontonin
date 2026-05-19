import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/dramabox";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classify = searchParams.get("classify") || "terbaru";
  const page = searchParams.get("page") || "1";

  try {
    const response = await fetch(
      `${UPSTREAM_API}/dubindo?classify=${classify}&page=${page}`,
      { cache: 'no-store',}
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: response.status }
      );
    }

    const data = await safeJson(response);
    
    // Filter out items without bookId to prevent blank cards
    // Note: data is directly an array for dubindo
    const filteredData = Array.isArray(data) 
      ? data.filter((item: any) => item && item.bookId) 
      : [];

    return encryptedResponse(filteredData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


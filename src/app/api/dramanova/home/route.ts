import { encryptedResponse } from "@/lib/api-utils";

const UPSTREAM_API = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = new URL(`${UPSTREAM_API}/dramanova/home`);
    
    // Pass along query params (like pageNum or pageSize)
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    const res = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "okhttp/4.12.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch home: ${res.status}`);
    }

    const data = await res.json();
    return encryptedResponse(data);
  } catch (error) {
    console.error("DramaNova home fetch error:", error);
    return encryptedResponse(
      { code: 500, msg: "Failed to fetch from DramaNova", total: 0, rows: [] },
      500
    );
  }
}

import { encryptedResponse } from "@/lib/api-utils";
import { NextResponse } from "next/server";

const UPSTREAM_API = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = searchParams.get("page") || "1";

    const targetUrl = new URL(`${UPSTREAM_API}/dramanova/search`);
    targetUrl.searchParams.set("query", query);
    targetUrl.searchParams.set("page", page);

    const res = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "okhttp/4.12.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch search: ${res.status}`);
    }

    const data = await res.json();
    return encryptedResponse(data);
  } catch (error) {
    console.error("DramaNova search fetch error:", error);
    return encryptedResponse(
      { code: 500, msg: "Failed to fetch search from DramaNova", total: 0, rows: [] },
      500
    );
  }
}

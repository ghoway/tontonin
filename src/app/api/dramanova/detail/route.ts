import { encryptedResponse } from "@/lib/api-utils";
import { NextResponse } from "next/server";

const UPSTREAM_API = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dramaId = searchParams.get("dramaId");

    if (!dramaId) {
      return encryptedResponse({ code: 400, msg: "dramaId is required", data: null }, 400);
    }

    const targetUrl = new URL(`${UPSTREAM_API}/dramanova/detail`);
    targetUrl.searchParams.set("dramaId", dramaId);

    const res = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "okhttp/4.12.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch detail: ${res.status}`);
    }

    const data = await res.json();
    return encryptedResponse(data);
  } catch (error) {
    console.error("DramaNova detail fetch error:", error);
    return encryptedResponse(
      { code: 500, msg: "Failed to fetch detail from DramaNova", data: null },
      500
    );
  }
}


import { type NextRequest } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookId = searchParams.get("bookId");

  if (!bookId) {
    return Response.json({ error: "Missing bookId" }, { status: 400 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api";
    const response = await fetch(`${baseUrl}/melolo/detail?bookId=${bookId}`);
    const data = await response.json();
    return encryptedResponse(data);
  } catch (error) {
    console.error("Error fetching Melolo detail:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

import { getDramaBoxForYou } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const pageNum = page ? parseInt(page, 10) : 1;

    const data = await getDramaBoxForYou(pageNum);
    const dramas = Array.isArray(data) ? data : [];

    return Response.json(dramas);
  } catch (error) {
    console.error('Error fetching DramaBox foryou:', error);
    return Response.json([], { status: 500 });
  }
}

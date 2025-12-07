import { NextRequest, NextResponse } from 'next/server';
import { getFromIPFS, extractImageFromContent } from '@/lib/ipfs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postId = searchParams.get('id');
  const query = searchParams.get('query')?.toLowerCase() || '';

  if (!postId || !query) {
    return NextResponse.json({ matches: false });
  }

  try {
    // In real implementation, fetch post content and check
    // For now, simple match
    return NextResponse.json({ matches: true });
  } catch (error) {
    return NextResponse.json({ matches: false });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function POST(request: NextRequest, { params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = await params;
  const body = await request.json();
  const payload = await backendFetch(`/api/resumes/${resumeId}/manual-text`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return NextResponse.json(payload);
}

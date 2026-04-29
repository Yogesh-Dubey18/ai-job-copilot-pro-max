import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function POST(request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const body = await request.json();
  const payload = await backendFetch(`/api/applications/${applicationId}/response`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return NextResponse.json(payload);
}

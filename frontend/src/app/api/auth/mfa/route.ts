import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = await backendFetch('/api/auth/mfa', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return NextResponse.json(payload);
}

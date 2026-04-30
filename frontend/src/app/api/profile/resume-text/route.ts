import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const payload = await backendFetch('/api/profile/resume-text', {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  return NextResponse.json(payload);
}

import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function GET() {
  const payload = await backendFetch('/api/notifications?limit=10');
  return NextResponse.json(payload);
}

import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function GET() {
  const payload = await backendFetch('/api/profile/export');
  return NextResponse.json(payload);
}

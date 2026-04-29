import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function POST() {
  const payload = await backendFetch('/api/admin/jobs/sync', { method: 'POST' });
  return NextResponse.json(payload);
}

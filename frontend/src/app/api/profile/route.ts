import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function DELETE() {
  const payload = await backendFetch('/api/profile', { method: 'DELETE' });
  return NextResponse.json(payload);
}

import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function GET() {
  const payload = await backendFetch('/api/auth/me').catch(() => ({ success: false, user: null }));
  return NextResponse.json(payload);
}

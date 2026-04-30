import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

const allowed = new Set(['connect', 'disconnect', 'sync']);

export async function POST(_request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!allowed.has(action)) return NextResponse.json({ success: false, message: 'Unknown Gmail action.' }, { status: 404 });
  const payload = await backendFetch(`/api/gmail/${action}`, { method: 'POST', body: JSON.stringify({}) });
  return NextResponse.json(payload);
}

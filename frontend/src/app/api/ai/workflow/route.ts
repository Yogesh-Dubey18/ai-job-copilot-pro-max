import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';
import { WorkflowResult } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = await backendFetch<{ success: boolean; data: WorkflowResult }>('/api/ai/workflow', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  return NextResponse.json(payload);
}

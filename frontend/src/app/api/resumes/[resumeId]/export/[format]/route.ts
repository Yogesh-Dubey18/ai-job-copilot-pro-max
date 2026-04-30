import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ resumeId: string; format: string }> }) {
  const { resumeId, format } = await params;
  const payload = await backendFetch<{ success: boolean; data: { fileName: string; content: string; message: string } }>(
    `/api/resumes/${resumeId}/export/${format}`,
    { method: 'POST', body: JSON.stringify({}) }
  );
  return new NextResponse(payload.data.content, {
    headers: {
      'Content-Type': format === 'docx' ? 'text/plain; charset=utf-8' : 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${payload.data.fileName}"`
    }
  });
}

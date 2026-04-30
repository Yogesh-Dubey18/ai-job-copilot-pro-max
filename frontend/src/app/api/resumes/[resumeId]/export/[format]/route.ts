import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ resumeId: string; format: string }> }) {
  const { resumeId, format } = await params;
  const payload = await backendFetch<{ success: boolean; data: { fileName: string; mimeType: string; base64: string; content: string; message: string } }>(
    `/api/resumes/${resumeId}/export/${format}`,
    { method: 'POST', body: JSON.stringify({}) }
  );
  const bytes = Buffer.from(payload.data.base64, 'base64');
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': payload.data.mimeType,
      'Content-Disposition': `attachment; filename="${payload.data.fileName}"`
    }
  });
}

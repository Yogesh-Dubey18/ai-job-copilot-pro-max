import { Buffer } from 'buffer';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';
import { AppError } from '../utils/AppError';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'
]);

export const parseResumeFile = async (mimeType: string, fileBase64 = '', fallbackText = '') => {
  if (fallbackText.trim()) return fallbackText.trim();
  if (!fileBase64) throw new AppError('Resume text or file content is required.', 400);
  if (!allowedMimeTypes.has(mimeType)) throw new AppError('Only PDF, DOC, DOCX, or TXT resumes are supported.', 400);

  const sizeBytes = Math.ceil((fileBase64.length * 3) / 4);
  if (sizeBytes > 5 * 1024 * 1024) throw new AppError('Resume upload must be 5MB or smaller.', 413);

  const buffer = Buffer.from(fileBase64, 'base64');
  try {
    if (mimeType === 'text/plain') {
      return buffer.toString('utf8').replace(/\s+/g, ' ').trim();
    }

    if (mimeType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(buffer);
      return parsed.text.replace(/\s+/g, ' ').trim();
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = await import('mammoth');
      const parsed = await mammoth.extractRawText({ buffer });
      return parsed.value.replace(/\s+/g, ' ').trim();
    }

    return buffer.toString('utf8').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    return [
      'Resume file uploaded successfully.',
      'Automatic text extraction could not read the full file in this environment.',
      'Paste resume text in the upload form for the most accurate ATS analysis.',
      buffer.toString('utf8').replace(/[^\x20-\x7E\n]/g, ' ').slice(0, 5000)
    ].join('\n');
  }
};

export const buildResumeExport = async (format: string, fileName: string, content: string) => {
  if (format === 'docx') {
    const doc = new Document({
      sections: [
        {
          children: content.split(/\n+/).map((line) => new Paragraph({ children: [new TextRun(line)] }))
        }
      ]
    });
    const buffer = await Packer.toBuffer(doc);
    return {
      fileName: `${fileName}.docx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      base64: buffer.toString('base64')
    };
  }

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fontSize(12).text(content, { lineGap: 4 });
    doc.end();
  });

  return {
    fileName: `${fileName}.pdf`,
    mimeType: 'application/pdf',
    base64: pdfBuffer.toString('base64')
  };
};

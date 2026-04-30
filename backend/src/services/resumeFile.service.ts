import { Buffer } from 'buffer';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';
import { AppError } from '../utils/AppError';
import { isReadableResumeText, sanitizeResumeText } from '../utils/resumeText';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'
]);

export const parseResumeFile = async (mimeType: string, fileBase64 = '', fallbackText = '') => {
  const manualText = sanitizeResumeText(fallbackText);
  if (manualText) return manualText;
  if (!fileBase64) throw new AppError('Resume text or file content is required.', 400);
  if (!allowedMimeTypes.has(mimeType)) throw new AppError('Only PDF, DOC, DOCX, or TXT resumes are supported.', 400);

  const sizeBytes = Math.ceil((fileBase64.length * 3) / 4);
  if (sizeBytes > 5 * 1024 * 1024) throw new AppError('Resume upload must be 5MB or smaller.', 413);

  const buffer = Buffer.from(fileBase64, 'base64');
  try {
    let extracted = '';
    if (mimeType === 'text/plain') {
      extracted = buffer.toString('utf8');
    } else if (mimeType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(buffer);
      extracted = parsed.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = await import('mammoth');
      const parsed = await mammoth.extractRawText({ buffer });
      extracted = parsed.value;
    } else {
      extracted = buffer.toString('utf8');
    }

    const clean = sanitizeResumeText(extracted);
    return isReadableResumeText(clean) || mimeType === 'text/plain' ? clean : '';
  } catch {
    return '';
  }
};

export const buildResumeExport = async (format: string, fileName: string, content: string) => {
  const safeContent = sanitizeResumeText(content) || 'Readable resume text is not available yet. Paste clean resume text before exporting.';
  if (format === 'docx') {
    const doc = new Document({
      sections: [
        {
          children: safeContent.split(/\n+/).map((line) => new Paragraph({ children: [new TextRun(line)] }))
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
    doc.fontSize(12).text(safeContent, { lineGap: 4 });
    doc.end();
  });

  return {
    fileName: `${fileName}.pdf`,
    mimeType: 'application/pdf',
    base64: pdfBuffer.toString('base64')
  };
};

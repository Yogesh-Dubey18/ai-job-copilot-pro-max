import { Buffer } from 'buffer';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { isReadableResumeText, sanitizeResumeText } from '../utils/resumeText';

const allowedExtensionsByMime: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt']
};

const allowedMimeTypes = new Set(Object.keys(allowedExtensionsByMime));

export const resumeUploadSizeBytes = (fileBase64 = '', fallbackText = '') => {
  if (fileBase64) return Math.ceil((fileBase64.length * 3) / 4);
  return Buffer.byteLength(fallbackText || '', 'utf8');
};

export const safeResumeFileName = (fileName = 'resume.txt') => {
  const sanitized = fileName
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
    .replace(/^-|-$/g, '');

  return sanitized || 'resume.txt';
};

export const validateResumeUpload = (mimeType: string, fileBase64 = '', fileName = '') => {
  if (!allowedMimeTypes.has(mimeType)) {
    throw new AppError('Only PDF, DOC, DOCX, or TXT resumes are supported.', 400);
  }

  if (fileName) {
    const normalizedName = safeResumeFileName(fileName).toLowerCase();
    const allowedExtensions = allowedExtensionsByMime[mimeType] || [];
    if (!allowedExtensions.some((extension) => normalizedName.endsWith(extension))) {
      throw new AppError('Resume file extension does not match the uploaded file type.', 400);
    }
  }

  const sizeBytes = resumeUploadSizeBytes(fileBase64);
  const maxBytes = env.MAX_FILE_SIZE_MB * 1024 * 1024;
  if (fileBase64 && sizeBytes > maxBytes) {
    throw new AppError(`Resume upload must be ${env.MAX_FILE_SIZE_MB}MB or smaller.`, 413);
  }
};

export const parseResumeFile = async (mimeType: string, fileBase64 = '', fallbackText = '', fileName = '') => {
  const manualText = sanitizeResumeText(fallbackText);
  if (manualText) return manualText;
  if (!fileBase64) throw new AppError('Resume text or file content is required.', 400);
  validateResumeUpload(mimeType, fileBase64, fileName);

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

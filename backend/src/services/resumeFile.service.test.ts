import { describe, expect, it } from 'vitest';
import { buildResumeExport, parseResumeFile } from './resumeFile.service';
import { isPdfInternalText, isReadableResumeText, sanitizeResumeText } from '../utils/resumeText';

describe('resume file parsing and export', () => {
  it('parses TXT resume uploads', async () => {
    const text = await parseResumeFile('text/plain', Buffer.from('React Node MongoDB resume text').toString('base64'));
    expect(text).toContain('React');
  });

  it('keeps PDF/DOCX fallback text when provided', async () => {
    await expect(parseResumeFile('application/pdf', '', 'PDF fallback resume text with React')).resolves.toContain('React');
    await expect(
      parseResumeFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document', '', 'DOCX fallback resume text with Node')
    ).resolves.toContain('Node');
  });

  it('exports PDF and DOCX buffers as base64', async () => {
    const pdf = await buildResumeExport('pdf', 'resume', 'Resume content');
    const docx = await buildResumeExport('docx', 'resume', 'Resume content');
    expect(pdf.mimeType).toBe('application/pdf');
    expect(docx.mimeType).toContain('wordprocessingml');
    expect(Buffer.from(pdf.base64, 'base64').length).toBeGreaterThan(100);
    expect(Buffer.from(docx.base64, 'base64').length).toBeGreaterThan(100);
  });

  it('rejects raw PDF internals instead of returning them as resume text', async () => {
    const raw = '%PDF-1.4\n1 0 obj\nstream\nFontDescriptor\nxref\n%%EOF';
    expect(isPdfInternalText(raw)).toBe(true);
    expect(sanitizeResumeText(raw)).toBe('');
    expect(isReadableResumeText(raw)).toBe(false);
    await expect(parseResumeFile('application/pdf', Buffer.from(raw).toString('base64'))).resolves.toBe('');
  });
});

const pdfInternalPatterns = [
  /%PDF/i,
  /\bendobj\b/i,
  /\bstream\b/i,
  /\bxref\b/i,
  /FontDescriptor/i,
  /FlateDecode/i,
  /\/Type\s*\/Catalog/i,
  /%%EOF/i
];

const invisibleControlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const isPdfInternalText = (text = '') =>
  pdfInternalPatterns.some((pattern) => pattern.test(text));

export const sanitizeResumeText = (text = '') => {
  if (!text) return '';
  if (isPdfInternalText(text)) return '';

  return text
    .replace(invisibleControlChars, ' ')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const isReadableResumeText = (text = '') => {
  const clean = sanitizeResumeText(text);
  if (clean.length < 200) return false;

  const alphaNumeric = clean.replace(/[^a-z0-9]/gi, '').length;
  const readableRatio = clean.length ? alphaNumeric / clean.length : 0;

  return readableRatio > 0.35 && !isPdfInternalText(clean);
};

export const sanitizeForAiContext = (text = '') => sanitizeResumeText(text).slice(0, 12000);

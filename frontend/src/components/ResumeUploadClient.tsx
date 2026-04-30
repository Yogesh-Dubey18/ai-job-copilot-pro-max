'use client';

import { useState } from 'react';

const allowed = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'
]);

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function ResumeUploadClient() {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setMessage('');
    setPending(true);
    const form = new FormData(formElement);
    const file = form.get('file');
    const parsedText = String(form.get('parsedText') || '');

    try {
      if (!(file instanceof File) || file.size === 0) {
        if (parsedText.trim().length < 20) throw new Error('Upload a resume file or paste at least 20 characters of resume text.');
      } else {
        if (!allowed.has(file.type)) throw new Error('Only PDF, DOC, DOCX, and TXT files are supported.');
        if (file.size > 2 * 1024 * 1024) throw new Error('Resume file must be 2MB or smaller.');
      }

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: String(form.get('title') || (file instanceof File && file.size > 0 ? file.name : 'Base Resume')),
          fileName: file instanceof File ? file.name : '',
          mimeType: file instanceof File && file.size > 0 ? file.type : 'text/plain',
          fileBase64: file instanceof File && file.size > 0 ? await toBase64(file) : '',
          parsedText
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Resume upload failed.');
      setMessage(
        payload.data?.extractionStatus === 'needs_manual_text'
          ? 'Readable resume text could not be extracted. Paste clean resume text manually.'
          : `Resume saved. ATS score: ${payload.data?.atsScore ?? 'not available yet'}.`
      );
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <label className="grid gap-1 text-sm font-medium">
        Resume title
        <input name="title" className="rounded-md border border-slate-200 px-3 py-2" placeholder="Frontend resume" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        PDF/DOCX/DOC/TXT file
        <input name="file" type="file" accept=".pdf,.doc,.docx,.txt" className="rounded-md border border-slate-200 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Optional resume text for higher accuracy
        <textarea name="parsedText" rows={8} className="rounded-md border border-slate-200 px-3 py-2" placeholder="Paste resume text for best ATS accuracy." />
      </label>
      <button disabled={pending} className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? 'Uploading...' : 'Upload and analyze'}
      </button>
      {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
    </form>
  );
}

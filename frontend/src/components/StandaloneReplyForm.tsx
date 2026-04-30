'use client';

import { FormEvent, useState } from 'react';

export function StandaloneReplyForm() {
  const [reply, setReply] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/ai/company-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        incomingMessage: form.get('incomingMessage'),
        intent: form.get('intent'),
        tone: form.get('tone')
      })
    });
    const payload = await response.json().catch(() => ({}));
    setReply(response.ok ? JSON.stringify(payload.data, null, 2) : payload.message || 'Could not generate reply.');
    setPending(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">HR Reply Draft</h2>
      <textarea name="incomingMessage" required rows={6} placeholder="Paste company or recruiter message" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="intent" className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          {['interview availability', 'salary expectation', 'notice period', 'assignment submission', 'follow-up after applying', 'follow-up after interview', 'rejection response', 'offer acceptance', 'offer negotiation', 'joining date negotiation', 'recruiter cold message', 'referral request'].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select name="tone" className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          {['Professional', 'Friendly', 'Short', 'Confident'].map((tone) => (
            <option key={tone} value={tone.toLowerCase()}>{tone}</option>
          ))}
        </select>
      </div>
      <button disabled={pending} className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? 'Generating...' : 'Generate reply'}
      </button>
      {reply ? <pre className="whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-sm text-white">{reply}</pre> : null}
    </form>
  );
}

'use client';

import { useState } from 'react';

export function ResponseAssistantForm({ applicationId }: { applicationId: string }) {
  const [reply, setReply] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/applications/${applicationId}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        companyMessage: form.get('companyMessage'),
        intent: form.get('intent'),
        tone: form.get('tone')
      })
    });
    const payload = await response.json().catch(() => ({}));
    setReply(response.ok ? `${payload.data.subject}\n\n${payload.data.detailedReply}\n\n${payload.data.shortChannelReply}\n\nWarning: ${payload.data.warnings?.[0]}` : payload.message || 'Could not generate reply.');
    setPending(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Company Reply Assistant</h2>
      <textarea name="companyMessage" required rows={5} placeholder="Paste company message" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="intent" className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          <option value="accept">Accept</option>
          <option value="negotiate">Negotiate</option>
          <option value="ask_question">Ask question</option>
          <option value="decline_politely">Decline politely</option>
          <option value="request_more_info">Request more info</option>
        </select>
        <select name="tone" className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          <option value="professional">Professional</option>
          <option value="confident">Confident</option>
          <option value="polite">Polite</option>
          <option value="hinglish-friendly">Hinglish-friendly</option>
          <option value="short">Short</option>
        </select>
      </div>
      <button disabled={pending} className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? 'Generating...' : 'Generate reply'}
      </button>
      {reply ? <pre className="whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-sm text-white">{reply}</pre> : null}
    </form>
  );
}

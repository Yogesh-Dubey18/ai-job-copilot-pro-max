'use client';

import { useState } from 'react';

export function ManualApplyForm({ jobId, applicationId }: { jobId?: string; applicationId?: string }) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const checklist = {
      resumeTailored: form.get('resumeTailored') === 'on',
      coverLetterReady: form.get('coverLetterReady') === 'on',
      portfolioReady: form.get('portfolioReady') === 'on',
      formSubmitted: form.get('formSubmitted') === 'on',
      confirmationSaved: form.get('confirmationSaved') === 'on',
      followUpReminderSet: form.get('followUpReminderSet') === 'on'
    };
    const response = await fetch('/api/applications/manual-apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jobId,
        applicationId,
        dateApplied: form.get('dateApplied'),
        portalSource: form.get('portalSource'),
        resumeVersionUsed: form.get('resumeVersionUsed'),
        coverLetterUsed: form.get('coverLetterUsed'),
        contactName: form.get('contactName'),
        recruiterContact: form.get('recruiterContact'),
        notes: form.get('notes'),
        followUpDate: form.get('followUpDate'),
        checklist
      })
    });
    const payload = await response.json().catch(() => ({}));
    setMessage(response.ok ? 'Manual application tracked.' : payload.message || 'Could not track manual apply.');
    setPending(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Manual Apply Mode</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="dateApplied" type="date" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
        <select name="portalSource" className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          {['LinkedIn', 'Naukri', 'Indeed', 'Company Website', 'Email', 'Referral', 'Other'].map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        <input name="resumeVersionUsed" placeholder="Resume version used" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
        <input name="coverLetterUsed" placeholder="Cover letter used" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
        <input name="contactName" placeholder="Recruiter name" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
        <input name="recruiterContact" placeholder="Recruiter email or LinkedIn" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
        <input name="followUpDate" type="date" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <textarea name="notes" rows={3} placeholder="Notes" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ['resumeTailored', 'Resume tailored'],
          ['coverLetterReady', 'Cover letter ready'],
          ['portfolioReady', 'Portfolio link ready'],
          ['formSubmitted', 'Form submitted manually'],
          ['confirmationSaved', 'Screenshot/confirmation saved'],
          ['followUpReminderSet', 'Follow-up reminder set']
        ].map(([name, label]) => (
          <label key={name} className="flex items-center gap-2 text-sm font-medium">
            <input name={name} type="checkbox" defaultChecked={name === 'formSubmitted'} />
            {label}
          </label>
        ))}
      </div>
      <button disabled={pending} className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? 'Saving...' : 'I Applied Manually'}
      </button>
      {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
    </form>
  );
}

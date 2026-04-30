'use client';

import { useEffect, useState, useTransition } from 'react';

type GmailState = {
  connected?: boolean;
  fallback?: boolean;
  setupRequired?: string[];
  lastSyncAt?: string;
};

export function GmailControls() {
  const [state, setState] = useState<GmailState>({});
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  const load = () => {
    fetch('/api/gmail/status', { credentials: 'include' })
      .then((response) => response.json())
      .then((payload) => setState(payload.data || {}))
      .catch(() => setState({ fallback: true }));
  };

  useEffect(load, []);

  const post = (path: string) => {
    startTransition(async () => {
      const response = await fetch(path, { method: 'POST', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      setMessage(payload.data?.message || JSON.stringify(payload.data || payload));
      load();
    });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold">Gmail OAuth status detection</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Connect Gmail to detect interview invites, assessments, rejections, offers, and recruiter replies. Sending always requires user approval.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button disabled={pending} onClick={() => post('/api/gmail/connect')} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Connect Gmail</button>
        <button disabled={pending} onClick={() => post('/api/gmail/sync')} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60">Sync status</button>
        <button disabled={pending} onClick={() => post('/api/gmail/disconnect')} className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60">Disconnect and delete synced data</button>
      </div>
      <p className="mt-3 text-sm text-slate-600">Connected: {state.connected ? 'Yes' : 'No'} · Mode: {state.fallback ? 'Fallback until OAuth credentials are set' : 'OAuth ready'}</p>
      {state.setupRequired?.length ? <p className="mt-2 text-sm text-amber-700">Needs: {state.setupRequired.join(', ')}</p> : null}
      {message ? <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm">{message}</p> : null}
    </section>
  );
}

'use client';

import { FormEvent, useState } from 'react';

export function SecurityPanel() {
  const [message, setMessage] = useState('');

  const callJson = async (path: string, body: unknown) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    setMessage(payload.message || JSON.stringify(payload));
  };

  const onReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '');
    await callJson('/api/auth/request-password-reset', { email });
  };

  const onVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '');
    await callJson('/api/auth/request-email-verification', { email });
  };

  const enableMfa = () => callJson('/api/auth/mfa', { enabled: true });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold">Account Recovery and MFA</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <form onSubmit={onReset} className="space-y-2">
          <input name="email" type="email" placeholder="Email for reset" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
          <button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">Reset token</button>
        </form>
        <form onSubmit={onVerify} className="space-y-2">
          <input name="email" type="email" placeholder="Email to verify" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
          <button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">Verify token</button>
        </form>
        <div>
          <button onClick={enableMfa} className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">Enable account verification</button>
          <p className="mt-2 text-xs text-slate-500">A temporary verification code is available until an authenticator provider is connected.</p>
        </div>
      </div>
      {message ? <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}

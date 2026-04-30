'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email') })
    });
    const payload = await response.json().catch(() => ({}));
    setMessage(`${payload.message || (response.ok ? 'Password reset instructions are ready.' : 'Could not start password reset.')}${payload.setupToken ? ` Token: ${payload.setupToken}` : ''}`);
    setLoading(false);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-950">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">Reset Password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Enter your account email. If email delivery is not configured, the app returns a secure recovery token for setup testing.</p>
        <input name="email" type="email" required placeholder="you@example.com" className="mt-5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button disabled={loading} className="mt-4 w-full rounded-md bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-60">
          {loading ? 'Sending...' : 'Send reset instructions'}
        </button>
        {message ? <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}
        <Link href="/login" className="mt-4 inline-flex text-sm font-semibold text-slate-700 underline">Back to login</Link>
      </form>
    </main>
  );
}

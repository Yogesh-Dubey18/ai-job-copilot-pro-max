'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ResetPasswordPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        token: form.get('token'),
        password: form.get('password')
      })
    });
    const payload = await response.json().catch(() => ({}));
    setMessage(payload.message || (response.ok ? 'Password updated. You can log in now.' : 'Could not reset password.'));
    setLoading(false);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-950">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">Create New Password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use the token from your reset request to set a new password.</p>
        <div className="mt-5 grid gap-3">
          <input name="email" type="email" required placeholder="Email" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="token" required placeholder="Reset token" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="password" type="password" minLength={8} required placeholder="New password" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button disabled={loading} className="mt-4 w-full rounded-md bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-60">
          {loading ? 'Updating...' : 'Update password'}
        </button>
        {message ? <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}
        <Link href="/login" className="mt-4 inline-flex text-sm font-semibold text-slate-700 underline">Back to login</Link>
      </form>
    </main>
  );
}

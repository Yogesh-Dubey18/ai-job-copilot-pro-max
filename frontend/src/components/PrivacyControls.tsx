'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function PrivacyControls() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold">Privacy controls</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Resumes are private by default. You can delete individual resumes from the backend API, or delete your account data here.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm('Delete your account, resumes, and applications? This cannot be undone.')) return;
          startTransition(async () => {
            const response = await fetch('/api/profile', { method: 'DELETE', credentials: 'include' });
            if (response.ok) {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              router.push('/register');
              return;
            }
            const payload = await response.json().catch(() => ({}));
            setMessage(payload.message || 'Could not delete account.');
          });
        }}
        className="mt-4 rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
      >
        Delete account data
      </button>
      {message ? <p className="mt-3 text-sm font-medium text-rose-700">{message}</p> : null}
    </section>
  );
}

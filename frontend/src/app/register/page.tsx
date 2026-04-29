'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.register(name, email, password);
      void response;
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
        <p className="mt-2 text-sm text-slate-600">Start tracking and generating apply packs.</p>

        {error ? <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md bg-slate-950 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-slate-950">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}

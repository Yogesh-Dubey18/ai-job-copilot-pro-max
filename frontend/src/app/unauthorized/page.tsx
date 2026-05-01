import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Access denied</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">You do not have access to this workspace.</h1>
      <p className="mt-3 text-sm text-slate-600">Sign in with the correct account or return to your dashboard.</p>
      <Link href="/dashboard" className="mt-6 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
        Go to dashboard
      </Link>
    </main>
  );
}

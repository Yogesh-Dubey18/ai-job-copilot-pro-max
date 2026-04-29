'use client';

import { AppShell } from '@/components/AppShell';

export default function AnalyticsError({ reset }: { reset: () => void }) {
  return (
    <AppShell>
      <div className="mx-auto grid min-h-screen max-w-3xl place-items-center px-4">
        <div className="rounded-lg border border-rose-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black">Analytics could not load</h1>
          <p className="mt-2 text-slate-600">Retry after checking your session and backend connection.</p>
          <button onClick={reset} className="mt-5 rounded-md bg-slate-950 px-4 py-2 font-semibold text-white">
            Try again
          </button>
        </div>
      </div>
    </AppShell>
  );
}

import { AppShell } from '@/components/AppShell';

export default function ApplicationsLoading() {
  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-64 animate-pulse rounded-md bg-slate-200" />
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="mb-3 h-12 animate-pulse rounded-md bg-slate-100 last:mb-0" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

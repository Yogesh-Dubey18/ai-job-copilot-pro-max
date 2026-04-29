import { AppShell } from '@/components/AppShell';

export default function AnalyticsLoading() {
  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-56 animate-pulse rounded-md bg-slate-200" />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

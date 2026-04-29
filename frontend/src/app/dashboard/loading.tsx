import { AppShell } from '@/components/AppShell';

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-72 animate-pulse rounded-md bg-slate-200" />
        <div className="mt-8 grid auto-rows-[150px] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

import { AppShell } from '@/components/AppShell';

export default function ToolsLoading() {
  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded-md bg-slate-200" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </AppShell>
  );
}

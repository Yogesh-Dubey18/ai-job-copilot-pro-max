export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

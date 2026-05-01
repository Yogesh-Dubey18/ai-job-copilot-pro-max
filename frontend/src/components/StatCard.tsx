import { ReactNode } from 'react';

export function StatCard({ label, value, icon, helper }: { label: string; value: ReactNode; icon?: ReactNode; helper?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {icon ? <div className="text-slate-500">{icon}</div> : null}
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-950">{value}</div>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

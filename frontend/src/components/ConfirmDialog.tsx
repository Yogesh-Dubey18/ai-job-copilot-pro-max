import { ReactNode } from 'react';

export function ConfirmDialog({ title, description, actions }: { title: string; description?: string; actions: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" role="dialog" aria-labelledby="confirm-title">
      <h2 id="confirm-title" className="text-base font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
      <div className="mt-5 flex justify-end gap-2">{actions}</div>
    </div>
  );
}

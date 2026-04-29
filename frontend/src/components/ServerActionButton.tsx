'use client';

import { useTransition, useState } from 'react';

type ActionState = {
  ok: boolean;
  message: string;
};

export function ServerActionButton({
  action,
  children,
  variant = 'dark'
}: {
  action: () => Promise<ActionState>;
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await action();
            setMessage(result.message);
          });
        }}
        className={
          variant === 'dark'
            ? 'rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60'
            : 'rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60'
        }
      >
        {isPending ? 'Working...' : children}
      </button>
      {message ? <p className="mt-2 text-sm font-medium text-emerald-700">{message}</p> : null}
    </div>
  );
}

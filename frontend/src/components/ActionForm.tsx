'use client';

import { useActionState } from 'react';

type ActionState = {
  ok: boolean;
  message: string;
};

const initialState: ActionState = { ok: false, message: '' };

export function ActionForm({
  action,
  children,
  buttonLabel,
  className = ''
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  buttonLabel: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={className}>
      {children}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Working...' : buttonLabel}
      </button>
      {state.message ? (
        <p className={state.ok ? 'mt-3 text-sm font-medium text-emerald-700' : 'mt-3 text-sm font-medium text-red-700'}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

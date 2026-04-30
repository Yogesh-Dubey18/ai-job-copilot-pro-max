'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { analyzeJobAction, saveJobAction } from '@/app/actions/product-actions';

export function JobActions({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const run = (kind: 'save' | 'analyze') => {
    startTransition(async () => {
      const result = kind === 'save' ? await saveJobAction(jobId) : await analyzeJobAction(jobId);
      setMessage(result.message);
    });
  };

  return (
    <div className="flex flex-wrap items-start gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => run('save')}
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        Save to tracker
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => run('analyze')}
        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        Analyze fit
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => run('analyze')}
        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        Generate Application Kit
      </button>
      <Link href="/resume/versions" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Tailor Resume
      </Link>
      <Link href="/interview" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Prepare Interview
      </Link>
      {message ? <p className="basis-full text-sm font-medium text-emerald-700">{message}</p> : null}
    </div>
  );
}

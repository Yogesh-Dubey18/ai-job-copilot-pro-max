'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkflowResult } from '@/types';

const workflows = [
  ['next-step', 'Career: Suggest today\'s plan'],
  ['mock-interview', 'Interview: Prepare interview'],
  ['salary', 'Company Replies: Salary response'],
  ['portfolio', 'Career: Create portfolio'],
  ['networking', 'Jobs: Recruiter cold message'],
  ['gmail', 'Company Replies: Reply to HR']
];

export function WorkflowLab() {
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const searchParams = useSearchParams();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const body = {
      ...Object.fromEntries(form.entries()),
      jobId: searchParams.get('jobId') || undefined,
      applicationId: searchParams.get('applicationId') || undefined,
      resumeId: searchParams.get('resumeId') || undefined
    };

    try {
      const response = await fetch('/api/ai/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Workflow failed');
      }

      setResult(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Workflow failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700">
          Workflow
          <select name="kind" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2">
            {workflows.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Language
          <select name="language" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2">
            {['English', 'Hindi', 'Hinglish'].map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Role
          <input name="role" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Target role from your profile or job page" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Company
          <input name="company" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Company name if available" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Job Description
          <textarea name="jobDescription" className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <button disabled={loading} className="mt-5 w-full rounded-md bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-60">
          {loading ? 'Generating...' : 'Generate'}
        </button>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {result ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black">{result.title}</h2>
              {result.fallback ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Ready-to-review draft</span> : null}
            </div>
            <p className="mt-3 text-slate-600">{result.summary}</p>
            <ul className="mt-5 space-y-3">
              {result.items.map((item) => (
                <li key={item} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
            {result.draft ? <pre className="mt-5 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm text-white">{result.draft}</pre> : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => navigator.clipboard.writeText([result.summary, ...(result.items || []), result.draft || ''].join('\n'))} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">
                Copy
              </button>
              {['Save to Application', 'Save to Timeline', 'Save as Note'].map((label) => (
                <button key={label} type="button" onClick={() => setSaved(`${label} recorded for this workspace.`)} className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                  {label}
                </button>
              ))}
            </div>
            {saved ? <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{saved}</p> : null}
          </div>
        ) : (
          <p className="text-slate-500">Choose a workflow and generate your first AI job-search asset.</p>
        )}
      </section>
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { Bot, Sparkles, X } from 'lucide-react';
import { useState, useTransition } from 'react';

const actions = [
  ['analyze-job', 'Analyze my resume'],
  ['today', 'Find best jobs for me'],
  ['tailor-resume', 'Tailor resume for this job'],
  ['cover-letter', 'Generate Application Kit'],
  ['today', 'I applied manually'],
  ['follow-up', 'Reply to company'],
  ['interview', 'Prepare interview round'],
  ['rejection', 'Explain rejection'],
  ['today', 'What should I do today?']
];

export function AIAssistantPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mentorMode, setMentorMode] = useState<'english' | 'hinglish'>('english');
  const [response, setResponse] = useState('Choose a quick action to get contextual help.');
  const [pending, startTransition] = useTransition();

  const runAction = (action: string) => {
    startTransition(async () => {
      const result = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, route: pathname, mentorMode })
      });
      const payload = await result.json().catch(() => ({}));
      setResponse(
        payload.data?.summary ||
          payload.message ||
          'Assistant fallback: upload resume at /resume/upload, track manual applications in job details, and configure Gemini/Gmail/job APIs in Settings when ready.'
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <section className="w-[min(380px,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="h-4 w-4 text-teal-700" />
              AI Copilot
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-slate-100" title="Close assistant">
              <X className="h-4 w-4" />
            </button>
          </div>
          <label className="mt-4 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm font-medium">
            Hinglish mentor mode
            <input
              type="checkbox"
              checked={mentorMode === 'hinglish'}
              onChange={(event) => setMentorMode(event.target.checked ? 'hinglish' : 'english')}
            />
          </label>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {actions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={pending}
                onClick={() => runAction(value)}
                className="rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-md bg-slate-950 p-3 text-sm leading-6 text-white">{pending ? 'Thinking...' : response}</p>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl hover:bg-slate-800"
          title="Open AI Copilot"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getApplications, getSessionToken } from '@/lib/server/backend';

export default async function InterviewApplicationPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const { applicationId } = await params;
  const application = (await getApplications()).find((item) => item._id === applicationId);
  if (!application) notFound();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Round-Clearing Prep</h1>
        <p className="mt-2 text-slate-600">{application.title} · {application.company}</p>
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ['Possible rounds', 'Resume screen, technical discussion, project deep dive, HR/salary round.'],
            ['Round-wise topics', 'Role fundamentals, past projects, API/UI choices, debugging, collaboration.'],
            ['Likely technical questions', 'Explain hooks, API states, schema design, testing, performance.'],
            ['Project explanation questions', 'Problem, users, architecture, tradeoffs, metrics, what you improved.'],
            ['HR and salary questions', 'Tell me about yourself, why this role, availability, expected salary.'],
            ['Mock answer framework', 'Use STAR: Situation, Task, Action, Result, Learning.'],
            ['Practice checklist', 'Revise resume, prepare 3 project stories, ask 2 smart questions.'],
            ['Confidence score', '72%: improve by practicing concise answers aloud.']
          ].map(([title, body]) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </section>
        <section className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-bold text-emerald-950">Clear This Round Plan</h2>
          <ol className="mt-4 grid gap-2 text-sm font-medium text-emerald-900">
            <li>1. Prepare a 60-second intro mapped to this role.</li>
            <li>2. Practice two strongest projects with measurable outcomes.</li>
            <li>3. Review missing skills and prepare honest learning answers.</li>
            <li>4. Prepare salary, joining, and location preferences.</li>
            <li>5. Send a thank-you follow-up after the interview.</li>
          </ol>
        </section>
      </main>
    </AppShell>
  );
}

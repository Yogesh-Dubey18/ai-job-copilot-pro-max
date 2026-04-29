import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getSessionToken } from '@/lib/server/backend';

export default async function MockInterviewPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Mock Interview</h1>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Practice set</h2>
          <ol className="mt-4 grid gap-3 text-sm text-slate-700">
            <li>1. Tell me about yourself for this role.</li>
            <li>2. Explain your strongest project with architecture and tradeoffs.</li>
            <li>3. How do you debug a broken API integration?</li>
            <li>4. What salary range are you targeting and why?</li>
          </ol>
        </section>
      </main>
    </AppShell>
  );
}

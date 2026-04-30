import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentUser, getSessionToken } from '@/lib/server/backend';

export default async function AdminSystemPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const user = await getCurrentUser();

  if (user.role !== 'admin') {
    return (
      <AppShell>
        <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
            <h1 className="text-2xl font-black text-amber-950">Admin Access Required</h1>
            <p className="mt-2 text-sm text-amber-900">System integration settings are available only to workspace admins.</p>
          </section>
        </main>
      </AppShell>
    );
  }

  const rows = [
    ['Gemini status', 'Configured on backend only when the key is present.'],
    ['Gmail env status', 'Connect OAuth credentials in deployment settings.'],
    ['Redis status', 'Worker uses Redis when REDIS_URL is present, otherwise manual fallback.'],
    ['Email provider', 'Resend or SendGrid can send verification, reset, digest, and reminders.'],
    ['Billing provider', 'Stripe or Razorpay checkout activates online upgrades.'],
    ['Sentry', 'Error tracking activates when SENTRY_DSN is present.'],
    ['CI/CD', 'GitHub Actions run lint, tests, typecheck, and builds.'],
    ['Observability', 'Backend request logs include request IDs and sensitive data redaction.']
  ];

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Admin System Settings</h1>
        <p className="mt-2 text-slate-600">Production integration and infrastructure status for admins.</p>
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {rows.map(([title, body]) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

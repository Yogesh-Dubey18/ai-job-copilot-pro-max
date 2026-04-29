import Link from 'next/link';
import { redirect } from 'next/navigation';
import { generatePortfolioAction } from '@/app/actions/product-actions';
import { AppShell } from '@/components/AppShell';
import { ServerActionButton } from '@/components/ServerActionButton';
import { getPortfolio, getSessionToken } from '@/lib/server/backend';

export default async function PortfolioPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const portfolio = await getPortfolio();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Portfolio Builder</h1>
            <p className="mt-2 text-slate-600">Generate a public portfolio from profile, skills, and projects.</p>
          </div>
          <ServerActionButton action={generatePortfolioAction}>Generate portfolio</ServerActionButton>
        </div>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {portfolio ? (
            <>
              <h2 className="text-2xl font-bold">{portfolio.headline}</h2>
              <p className="mt-3 whitespace-pre-wrap text-slate-700">{portfolio.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {portfolio.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{skill}</span>
                ))}
              </div>
              <Link href={`/u/${portfolio.username}`} className="mt-6 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                View public portfolio
              </Link>
            </>
          ) : (
            <p className="text-slate-500">No portfolio generated yet.</p>
          )}
        </section>
      </main>
    </AppShell>
  );
}

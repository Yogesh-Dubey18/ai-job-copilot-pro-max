import { notFound } from 'next/navigation';
import { getPublicPortfolio } from '@/lib/server/backend';

export default async function PublicPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const portfolio = await getPublicPortfolio(username).catch(() => null);
  if (!portfolio) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">@{portfolio.username}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{portfolio.headline}</h1>
        <p className="mt-6 whitespace-pre-wrap leading-7 text-slate-700">{portfolio.summary}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {portfolio.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{skill}</span>
          ))}
        </div>
        <div className="mt-8 grid gap-4">
          {portfolio.projects.map((project) => (
            <article key={project.name} className="rounded-lg border border-slate-200 p-4">
              <h2 className="font-bold">{project.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{project.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

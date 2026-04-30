import Link from 'next/link';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black tracking-tight">Pricing</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Starter</h2>
            <p className="mt-2 text-4xl font-black">Free</p>
            <p className="mt-3 text-slate-600">Resume upload, curated job matches, tracker, and safe AI workflows.</p>
          </article>
          <article className="rounded-lg border border-slate-950 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Pro MAX</h2>
            <p className="mt-2 text-4xl font-black">Configurable</p>
            <p className="mt-3 text-slate-600">Bring Gemini, Gmail, and job API keys for full production integrations.</p>
          </article>
        </div>
        <Link href="/register" className="mt-8 inline-flex rounded-md bg-slate-950 px-5 py-3 font-semibold text-white">Create account</Link>
      </section>
    </main>
  );
}

import Link from 'next/link';

const features = [
  'Resume upload and ATS score',
  'Daily matching jobs',
  'Manual Apply Mode',
  'Application Kit generation',
  'Company Reply Assistant',
  'Interview round prep',
  'Portfolio builder',
  'Chrome job clipper'
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-black tracking-tight">Features</h1>
        <p className="mt-4 max-w-2xl text-slate-600">A career operating system from resume upload to final offer.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <article key={feature} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold">{feature}</h2>
              <p className="mt-2 text-sm text-slate-600">Production-ready workflow with safe fallback mode when external credentials are not configured.</p>
            </article>
          ))}
        </div>
        <Link href="/register" className="mt-8 inline-flex rounded-md bg-slate-950 px-5 py-3 font-semibold text-white">Start free</Link>
      </section>
    </main>
  );
}

import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto grid min-h-screen max-w-7xl content-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
            <Sparkles className="h-4 w-4 text-teal-700" />
            AI-assisted applications, tracking, and outreach
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
            AI Job Copilot Pro MAX
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A practical mission control dashboard for saving jobs, tracking applications, and creating ATS-friendly
            apply packs with Gemini-powered resume, cover letter, and recruiter email generation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Start Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid content-center gap-4">
          {[
            ['Saved Roles', '12'],
            ['Apply Packs', '45'],
            ['Interviews', '4'],
            ['Offers', '1']
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal-100 text-teal-700">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <span className="font-semibold text-slate-700">{label}</span>
              </div>
              <span className="text-3xl font-black">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

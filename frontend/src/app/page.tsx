import Link from 'next/link';
import { ArrowRight, Bot, BriefcaseBusiness, FileText, Lock, ShieldCheck, Sparkles, Upload } from 'lucide-react';

const workflow = ['Upload Resume', 'Get Jobs', 'Tailor Resume', 'Apply', 'Track', 'Interview Prep'];
const features = [
  { title: 'Resume Upload', description: 'PDF, DOCX, DOC, or TXT intake with validation and private storage.', Icon: Upload },
  { title: 'ATS Score', description: 'Keyword gaps, formatting checks, and truthful improvement suggestions.', Icon: ShieldCheck },
  { title: 'Daily Jobs', description: 'Fresh demo or API-backed jobs scored against your profile.', Icon: BriefcaseBusiness },
  { title: 'AI Assistant', description: 'Route-aware job search mentor with English and Hinglish mode.', Icon: Bot },
  { title: 'Application Tracker', description: 'Pipeline statuses, timeline notes, next actions, and analytics.', Icon: FileText },
  { title: 'Interview Prep', description: 'Round prediction, technical questions, HR prompts, and daily plan.', Icon: Sparkles },
  { title: 'Portfolio', description: 'Generate a clean public portfolio from your verified profile.', Icon: Lock }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto grid min-h-[92vh] max-w-7xl content-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
            <Sparkles className="h-4 w-4 text-teal-700" />
            Privacy-first AI job search mission control
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
            AI Job Copilot Pro MAX
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Upload your resume, discover high-fit roles, tailor ATS-safe applications, track every step, and prepare for
            interviews with a practical AI mentor. You stay in control: no fake auto-submit, no invented experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/resume/upload" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800">
              Upload Resume
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/jobs" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100">
              Find Jobs
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100">
              Try AI Assistant
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-600">
            <Lock className="h-4 w-4 text-teal-700" />
            User-controlled apply flow. Resume data is private by default.
          </div>
        </div>

        <div className="grid content-center gap-4">
          {workflow.map((step, index) => (
            <div key={step} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-100 font-black text-teal-800">
                {index + 1}
              </span>
              <span className="font-bold">{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight">Built for the full job-search loop</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, description, Icon }) => (
              <article key={title} className="rounded-lg border border-slate-200 p-5">
                <Icon className="h-5 w-5 text-teal-700" />
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

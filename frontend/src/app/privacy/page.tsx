export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-5xl font-black tracking-tight">Privacy</h1>
        <p className="mt-6 leading-8 text-slate-600">
          AI Job Copilot keeps API keys server-side, uses httpOnly cookie auth, validates uploads, and gives users controls to export or delete their data. AI output is a draft only; users approve before sending or applying.
        </p>
      </section>
    </main>
  );
}

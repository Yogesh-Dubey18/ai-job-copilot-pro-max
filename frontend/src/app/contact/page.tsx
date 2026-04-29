export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-5xl font-black tracking-tight">Contact</h1>
        <p className="mt-6 text-slate-600">For production setup, configure your email provider, Gemini key, Gmail OAuth, and job source API keys in Vercel environment variables.</p>
        <a className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 font-semibold text-white" href="mailto:yogeshdubey8924@gmail.com">Email support</a>
      </section>
    </main>
  );
}

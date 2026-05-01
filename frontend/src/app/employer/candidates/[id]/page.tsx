import { redirect } from 'next/navigation';
import { employerApplicationNoteAction, employerApplicationStatusAction, scheduleInterviewAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { getEmployerCandidate, getSessionToken } from '@/lib/server/backend';

export default async function EmployerCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const { id } = await params;
  const candidate = await getEmployerCandidate(id);
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title={candidate.title} description={`${candidate.company} candidate detail`} actions={<StatusBadge status={candidate.status} />} />
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold">Timeline</h2>
            <div className="mt-4 grid gap-3">
              {(candidate.timeline || []).map((item, index) => <div key={`${item.date}-${index}`} className="rounded-md border p-3 text-sm">{item.note}</div>)}
            </div>
          </div>
          <aside className="grid gap-4">
            <ActionForm action={employerApplicationStatusAction} buttonLabel="Update status" className="grid gap-3 rounded-lg border bg-white p-4">
              <input type="hidden" name="applicationId" value={candidate._id} />
              <select name="status" className="rounded-md border px-3 py-2 text-sm"><option value="shortlisted">Shortlist</option><option value="rejected">Reject</option><option value="interview">Interview</option><option value="offered">Offer</option></select>
              <textarea name="note" rows={3} placeholder="Status note" className="rounded-md border px-3 py-2 text-sm" />
            </ActionForm>
            <ActionForm action={employerApplicationNoteAction} buttonLabel="Add note" className="grid gap-3 rounded-lg border bg-white p-4">
              <input type="hidden" name="applicationId" value={candidate._id} />
              <textarea name="note" rows={4} placeholder="Private note" className="rounded-md border px-3 py-2 text-sm" />
            </ActionForm>
            <ActionForm action={scheduleInterviewAction} buttonLabel="Schedule interview" className="grid gap-3 rounded-lg border bg-white p-4">
              <input type="hidden" name="applicationId" value={candidate._id} />
              <input name="scheduledAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" />
              <select name="mode" className="rounded-md border px-3 py-2 text-sm"><option value="video">Video</option><option value="phone">Phone</option><option value="onsite">Onsite</option></select>
              <input name="meetingLink" placeholder="Meeting link" className="rounded-md border px-3 py-2 text-sm" />
              <textarea name="notes" rows={3} placeholder="Interview notes" className="rounded-md border px-3 py-2 text-sm" />
            </ActionForm>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}

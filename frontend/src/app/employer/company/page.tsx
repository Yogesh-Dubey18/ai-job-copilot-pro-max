import { redirect } from 'next/navigation';
import { saveCompanyAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getMyCompany, getSessionToken } from '@/lib/server/backend';

export default async function EmployerCompanyPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const company = await getMyCompany().catch(() => null);

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Company Profile" description="Create and maintain the public employer profile used on job posts." />
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={saveCompanyAction} buttonLabel="Save company" className="grid gap-4">
            <input type="hidden" name="mode" value={company ? 'update' : 'create'} />
            <input name="name" defaultValue={company?.name || ''} placeholder="Company name" className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="website" defaultValue={company?.website || ''} placeholder="Website" className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="industry" defaultValue={company?.industry || ''} placeholder="Industry" className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="size" defaultValue={company?.size || ''} placeholder="Company size" className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="location" defaultValue={company?.location || ''} placeholder="Location" className="rounded-md border border-slate-200 px-3 py-2" />
            <textarea name="description" rows={8} defaultValue={company?.description || ''} placeholder="Description" className="rounded-md border border-slate-200 px-3 py-2" />
          </ActionForm>
          {company ? <p className="mt-4 text-sm font-semibold text-slate-600">Verification: {company.verificationStatus}</p> : null}
        </section>
      </main>
    </AppShell>
  );
}

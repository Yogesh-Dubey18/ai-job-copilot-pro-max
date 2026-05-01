import { redirect } from 'next/navigation';
import { adminCompanyVerifyAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getAdminCompanies, getSessionToken } from '@/lib/server/backend';

export default async function AdminCompaniesPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const companies = await getAdminCompanies('?limit=25');
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Admin Companies" description="Verify or reject employer company profiles." />
        <section className="mt-8 grid gap-3">
          {companies.items.map((company) => (
            <article key={company._id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-semibold">{company.name}</p><p className="text-sm text-slate-600">{company.industry || 'Industry not set'} · {company.verificationStatus}</p></div>
                <ActionForm action={adminCompanyVerifyAction} buttonLabel="Verify">
                  <input type="hidden" name="companyId" value={company._id} />
                  <input type="hidden" name="verificationStatus" value="verified" />
                </ActionForm>
              </div>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

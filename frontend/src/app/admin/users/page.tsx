import { redirect } from 'next/navigation';
import { adminUserStatusAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getAdminUsers, getSessionToken } from '@/lib/server/backend';

export default async function AdminUsersPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const users = await getAdminUsers('?limit=25');
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Admin Users" description="Search, review, and suspend platform users." />
        <section className="mt-8 grid gap-3">
          {users.items.map((user) => (
            <article key={user._id || user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
              <div><p className="font-semibold">{user.name}</p><p className="text-sm text-slate-600">{user.email} · {user.role} · {user.status}</p></div>
              <ActionForm action={adminUserStatusAction} buttonLabel={user.status === 'suspended' ? 'Activate' : 'Suspend'}>
                <input type="hidden" name="userId" value={user._id || user.id} />
                <input type="hidden" name="status" value={user.status === 'suspended' ? 'active' : 'suspended'} />
              </ActionForm>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

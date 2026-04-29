import { redirect } from 'next/navigation';
import { updateProfileAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { getProfile, getSessionToken } from '@/lib/server/backend';

export default async function ProfilePage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const user = await getProfile();
  const profile = user.profile || {};

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Profile Intelligence</h1>
        <p className="mt-2 text-slate-600">Skills, preferred roles, salary, and resume base text power matching and ATS scoring.</p>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={updateProfileAction} buttonLabel="Save profile" className="grid gap-4">
            <label className="grid gap-1 text-sm font-medium">
              Name
              <input name="name" defaultValue={user.name} className="rounded-md border border-slate-200 px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Recovery email
              <input name="recoveryEmail" type="email" defaultValue={user.recoveryEmail || ''} className="rounded-md border border-slate-200 px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Skills
              <input name="skills" defaultValue={(profile.skills || []).join(', ')} className="rounded-md border border-slate-200 px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Preferred roles
              <input name="preferredRoles" defaultValue={(profile.preferredRoles || []).join(', ')} className="rounded-md border border-slate-200 px-3 py-2" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium">
                Experience level
                <input name="experienceLevel" defaultValue={profile.experienceLevel || ''} className="rounded-md border border-slate-200 px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Expected salary
                <input name="expectedSalary" type="number" defaultValue={profile.expectedSalary || 0} className="rounded-md border border-slate-200 px-3 py-2" />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-medium">
              Resume base text
              <textarea name="resumeBaseText" rows={10} defaultValue={profile.resumeBaseText || ''} className="rounded-md border border-slate-200 px-3 py-2" />
            </label>
          </ActionForm>
        </section>
      </main>
    </AppShell>
  );
}

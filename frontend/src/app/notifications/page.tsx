import Link from 'next/link';
import { redirect } from 'next/navigation';
import { markAllNotificationsReadAction, markNotificationReadAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { ServerActionButton } from '@/components/ServerActionButton';
import { getNotifications, getSessionToken } from '@/lib/server/backend';

export default async function NotificationsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const notifications = await getNotifications('?limit=50');

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Notifications"
          description={`${notifications.unreadCount} unread updates across applications, interviews, and job search actions.`}
          actions={<ServerActionButton action={markAllNotificationsReadAction}>Mark all read</ServerActionButton>}
        />
        <section className="mt-8 grid gap-3">
          {notifications.items.length === 0 ? (
            <EmptyState title="No notifications" description="Application updates and interview reminders will appear here." />
          ) : (
            notifications.items.map((notification) => (
              <article key={notification._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{notification.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{notification.message || notification.body}</p>
                    {notification.link ? <Link href={notification.link} className="mt-2 inline-flex text-sm font-semibold underline">Open</Link> : null}
                  </div>
                  {notification.read ? <span className="text-xs font-semibold text-slate-500">Read</span> : (
                    <ActionForm action={markNotificationReadAction} buttonLabel="Mark read">
                      <input type="hidden" name="notificationId" value={notification._id} />
                    </ActionForm>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </AppShell>
  );
}

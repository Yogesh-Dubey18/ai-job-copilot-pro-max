'use client';

import { useTransition } from 'react';
import {
  createApplication,
  createDemoApplications,
  updateApplicationStatus
} from '@/app/actions/update-application-status';
import { Application, ApplicationStatus } from '@/types';
import { StatusBadge } from './StatusBadge';

const statuses: ApplicationStatus[] = ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'joined'];

export function ApplicationBoard({ applications }: { applications: Application[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Add Application</h2>
            <p className="text-sm text-slate-500">Create real pipeline data for your dashboard counters.</p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => createDemoApplications())}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
          >
            Add demo data
          </button>
        </div>

        <form action={createApplication} className="grid gap-3 md:grid-cols-[1fr_1fr_160px_130px_auto]">
          <input
            name="title"
            placeholder="Role title"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950"
            required
          />
          <input
            name="company"
            placeholder="Company"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950"
            required
          />
          <select name="status" defaultValue="saved" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            name="matchScore"
            type="number"
            min="0"
            max="100"
            placeholder="Match %"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950"
          />
          <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Add
          </button>
        </form>
      </section>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
          <span className="col-span-4">Role</span>
          <span className="col-span-3">Company</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-1">Match</span>
          <span className="col-span-2">Update</span>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No applications yet. Add one above or use demo data to see the dashboard working.
          </div>
        ) : (
          applications.map((application) => (
            <div key={application._id} className="grid grid-cols-12 items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-0">
              <span className="col-span-4 font-semibold">{application.title}</span>
              <span className="col-span-3 text-slate-600">{application.company}</span>
              <span className="col-span-2">
                <StatusBadge status={application.status} />
              </span>
              <span className="col-span-1 text-sm font-semibold">{application.matchScore ?? 0}%</span>
              <span className="col-span-2">
                <select
                  value={application.status}
                  disabled={pending}
                  onChange={(event) => {
                    const status = event.target.value as ApplicationStatus;
                    startTransition(() => updateApplicationStatus(application._id, status));
                  }}
                  className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm disabled:opacity-50"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

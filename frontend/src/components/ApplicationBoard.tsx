'use client';

import { useTransition } from 'react';
import { updateApplicationStatus } from '@/app/actions/update-application-status';
import { Application, ApplicationStatus } from '@/types';
import { StatusBadge } from './StatusBadge';

const statuses: ApplicationStatus[] = ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'joined'];

export function ApplicationBoard({ applications }: { applications: Application[] }) {
  const [pending, startTransition] = useTransition();

  return (
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
          No applications yet. Save a job from the extension or create one from the API.
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
  );
}

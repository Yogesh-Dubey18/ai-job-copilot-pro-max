'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { Application, ApplicationStatus } from '@/types';

const statuses: ApplicationStatus[] = ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'joined'];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState('');

  const loadApplications = () => {
    api<{ success: boolean; data: Application[] }>('/api/applications')
      .then((response) => setApplications(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load applications'));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    await api(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
    loadApplications();
  };

  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight">Applications</h1>
          <p className="mt-2 text-slate-600">Review your pipeline and keep each role moving.</p>
        </div>

        {error ? <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

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
                    onChange={(event) => updateStatus(application._id, event.target.value as ApplicationStatus)}
                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
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
    </AppShell>
  );
}

'use client';

import { useTransition } from 'react';
import {
  createApplication,
  updateApplicationStatus
} from '@/app/actions/update-application-status';
import { Application, ApplicationStatus } from '@/types';
import { StatusBadge } from './StatusBadge';

const statuses: ApplicationStatus[] = [
  'saved',
  'preparing',
  'manually_applied',
  'resume_tailored',
  'applied',
  'viewed',
  'recruiter_viewed',
  'shortlisted',
  'assessment',
  'interview_round_1',
  'interview_round_2',
  'hr_round',
  'offered',
  'rejected',
  'joined'
];

export function ApplicationBoard({ applications }: { applications: Application[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Add Application</h2>
            <p className="text-sm text-slate-500">Track a job you applied to manually and keep follow-ups organized.</p>
          </div>
        </div>

        <form action={createApplication} className="grid gap-3 md:grid-cols-2">
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
          <input name="sourcePlatform" placeholder="Source platform" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" />
          <input name="jobUrl" placeholder="Job URL" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" />
          <select name="status" defaultValue="manually_applied" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
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
          <input name="resumeVersionUsed" placeholder="Resume version used" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" />
          <input name="appliedDate" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" />
          <input name="followUpDate" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" />
          <input name="recruiterName" placeholder="Recruiter name" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" />
          <input name="recruiterContact" placeholder="Recruiter email or LinkedIn" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" />
          <textarea name="notes" placeholder="Notes" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 md:col-span-2" />
          <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Add Manual Application
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
            No applications yet. Add a manual application above or save a job from Job Discovery.
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
              <div className="col-span-12 grid gap-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-4">
                <span>Source: {application.portalSource || 'Manual Import'}</span>
                <span>Applied: {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'Not set'}</span>
                <span>Follow-up: {application.followUpDate ? new Date(application.followUpDate).toLocaleDateString() : 'Not set'}</span>
                <span>Resume: {application.resumeVersionUsed || 'Not linked'}</span>
                <span>Recruiter: {application.recruiterContact || 'Not added'}</span>
                <a href={`/applications/${application._id}`} className="font-semibold text-slate-950">View Timeline</a>
                <a href={`/company-reply?applicationId=${application._id}`} className="font-semibold text-slate-950">Generate Reply</a>
                <a href={`/interview/${application._id}`} className="font-semibold text-slate-950">Prepare Interview</a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

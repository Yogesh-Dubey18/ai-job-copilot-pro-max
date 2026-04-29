import { ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

const styles: Record<ApplicationStatus, string> = {
  saved: 'bg-slate-100 text-slate-700',
  preparing: 'bg-orange-100 text-orange-700',
  manually_applied: 'bg-blue-100 text-blue-700',
  resume_tailored: 'bg-indigo-100 text-indigo-700',
  applied: 'bg-blue-100 text-blue-700',
  viewed: 'bg-cyan-100 text-cyan-700',
  recruiter_viewed: 'bg-cyan-100 text-cyan-700',
  shortlisted: 'bg-sky-100 text-sky-700',
  assessment: 'bg-amber-100 text-amber-700',
  interview_round_1: 'bg-violet-100 text-violet-700',
  interview_round_2: 'bg-purple-100 text-purple-700',
  hr_round: 'bg-fuchsia-100 text-fuchsia-700',
  offered: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  joined: 'bg-lime-100 text-lime-700'
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize', styles[status])}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}

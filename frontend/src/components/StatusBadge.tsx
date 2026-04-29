import { ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

const styles: Record<ApplicationStatus, string> = {
  saved: 'bg-slate-100 text-slate-700',
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-cyan-100 text-cyan-700',
  interview: 'bg-violet-100 text-violet-700',
  offer: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  joined: 'bg-lime-100 text-lime-700'
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize', styles[status])}>
      {status}
    </span>
  );
}

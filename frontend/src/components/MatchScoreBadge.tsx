import { cn } from '@/lib/utils';

export function MatchScoreBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Profile needed</span>;
  }

  const label = score >= 85 ? 'Apply now' : score >= 70 ? 'Tailor first' : score >= 50 ? 'Improve first' : 'Skip';
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        score >= 85
          ? 'bg-emerald-100 text-emerald-700'
          : score >= 70
            ? 'bg-blue-100 text-blue-700'
            : score >= 50
              ? 'bg-amber-100 text-amber-700'
              : 'bg-rose-100 text-rose-700'
      )}
    >
      {score}% · {label}
    </span>
  );
}

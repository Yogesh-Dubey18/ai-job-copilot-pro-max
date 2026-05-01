import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import { DataTable } from './DataTable';
import { MatchScoreBadge } from './MatchScoreBadge';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';

describe('portal UI foundation components', () => {
  it('renders status badges', () => {
    const html = renderToStaticMarkup(<StatusBadge status="applied" />);
    expect(html).toContain('applied');
  });

  it('renders match score badges with priority labels', () => {
    const html = renderToStaticMarkup(<MatchScoreBadge score={86} />);
    expect(html).toContain('86%');
    expect(html).toContain('Apply now');
  });

  it('renders empty state copy', () => {
    const html = renderToStaticMarkup(<EmptyState title="No jobs yet" description="Start by searching public jobs." />);
    expect(html).toContain('No jobs yet');
    expect(html).toContain('Start by searching public jobs.');
  });

  it('renders dashboard stat cards', () => {
    const html = renderToStaticMarkup(<StatCard label="Applications" value={12} helper="Tracked this month" />);
    expect(html).toContain('Applications');
    expect(html).toContain('12');
  });

  it('renders simple data tables', () => {
    const html = renderToStaticMarkup(
      <DataTable
        columns={[
          { key: 'company', header: 'Company', render: (row: { company: string; role: string }) => row.company },
          { key: 'role', header: 'Role', render: (row: { company: string; role: string }) => row.role }
        ]}
        rows={[{ company: 'TechNova', role: 'Engineer' }]}
        getKey={(row) => row.company}
      />
    );
    expect(html).toContain('TechNova');
    expect(html).toContain('Engineer');
  });

  it('renders confirmation dialogs when open', () => {
    const html = renderToStaticMarkup(
      <ConfirmDialog
        title="Archive job"
        description="This will hide the job from public search."
        actions={<button type="button">Confirm</button>}
      />
    );
    expect(html).toContain('Archive job');
    expect(html).toContain('This will hide the job from public search.');
    expect(html).toContain('Confirm');
  });
});

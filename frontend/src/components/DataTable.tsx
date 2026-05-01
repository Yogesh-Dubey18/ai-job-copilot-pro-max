import { ReactNode } from 'react';

export function DataTable<T>({
  columns,
  rows,
  getKey
}: {
  columns: Array<{ key: string; header: string; render: (row: T) => ReactNode }>;
  rows: T[];
  getKey: (row: T) => string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 text-left font-semibold text-slate-600">{column.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={getKey(row)}>{columns.map((column) => <td key={column.key} className="px-4 py-3 text-slate-700">{column.render(row)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

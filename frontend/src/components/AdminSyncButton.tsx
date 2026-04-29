'use client';

import { useState } from 'react';

export function AdminSyncButton() {
  const [message, setMessage] = useState('');

  const sync = async () => {
    const response = await fetch('/api/admin/jobs/sync', { method: 'POST' });
    const payload = await response.json();
    setMessage(payload.success ? `Synced ${payload.data.length} jobs.` : payload.message || 'Sync failed');
  };

  return (
    <div className="text-right">
      <button onClick={sync} className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white">Run job sync</button>
      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}

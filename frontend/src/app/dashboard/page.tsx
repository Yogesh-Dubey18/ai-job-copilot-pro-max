'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { BentoGrid } from '@/components/BentoGrid';
import { api } from '@/lib/api';
import { ApplicationStats } from '@/types';

const demoStats: ApplicationStats = { saved: 12, applied: 45, interviews: 4, offers: 1 };

export default function DashboardPage() {
  const [stats, setStats] = useState<ApplicationStats>(demoStats);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    api<{ success: boolean; data: ApplicationStats }>('/api/applications/stats')
      .then((response) => {
        setStats(response.data);
        setUsingDemo(false);
      })
      .catch(() => {
        setStats(demoStats);
        setUsingDemo(true);
      });
  }, []);

  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Mission Control</h1>
            <p className="mt-2 text-slate-600">Track applications, interviews, offers, and AI-powered next actions.</p>
          </div>
          {usingDemo ? (
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              Demo stats shown
            </span>
          ) : null}
        </div>

        <BentoGrid stats={stats} />
      </div>
    </AppShell>
  );
}

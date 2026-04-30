'use client';

import { motion } from 'framer-motion';
import { ApplicationStats } from '@/types';

export function BentoGrid({ stats }: { stats: ApplicationStats }) {
  const nextStep =
    stats.total === 0 && stats.saved === 0
      ? 'Upload your resume, set a target role, then find the first high-fit jobs to track.'
      : stats.saved > 0
        ? 'Generate Application Kits for saved jobs with high keyword fit, then move strong targets into applied status.'
        : stats.interviews > 0
          ? 'Prepare interview stories, role-specific examples, and follow-up reminders for active interviews.'
          : stats.applied > 0
            ? 'Review follow-up dates and prepare company replies for any recruiter messages.'
            : 'Find jobs that match your resume and track the applications you submit.';
  return (
    <div className="grid auto-rows-[150px] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 row-span-2 flex flex-col justify-between rounded-lg bg-slate-950 p-6 text-white shadow-soft md:col-span-2 lg:col-span-2"
      >
        <div>
          <h2 className="text-lg font-medium text-slate-300">Active Interviews</h2>
          <p className="mt-2 text-6xl font-black">{stats.interviews}</p>
        </div>
        <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
          <p className="text-sm text-slate-200">
            {stats.interviews > 0
              ? 'Prepare focused stories and role-specific examples for your active interviews.'
              : 'No active interviews yet. Track applications and follow-ups to build momentum.'}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-sm font-medium text-slate-500">Total Applied</h3>
        <p className="mt-2 text-4xl font-bold">{stats.applied}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-sm font-medium text-slate-500">Offers Negotiating</h3>
        <p className="mt-2 text-4xl font-bold text-emerald-600">{stats.offers}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-sm font-medium text-slate-500">Saved Jobs</h3>
        <p className="mt-2 text-4xl font-bold">{stats.saved}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="col-span-1 rounded-lg bg-teal-700 p-6 text-white shadow-soft md:col-span-2 lg:col-span-2"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-teal-700">AI</span>
          <h3 className="font-semibold">Next-Step Suggestion</h3>
        </div>
        <p className="text-teal-50">
          {nextStep}
        </p>
        <a href={stats.saved > 0 ? '/assistant' : stats.total ? '/applications' : '/resume/upload'} className="mt-4 inline-flex rounded-md bg-white px-4 py-2 font-medium text-teal-900 transition hover:bg-teal-50">
          Generate Application Kit
        </a>
      </motion.div>
    </div>
  );
}

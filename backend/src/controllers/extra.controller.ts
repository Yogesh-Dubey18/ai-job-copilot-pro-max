import { z } from 'zod';
import Application from '../models/Application';
import Job from '../models/Job';
import Portfolio from '../models/Portfolio';
import User from '../models/User';
import { scoreJob } from '../services/scoring.service';
import { normalizeScrapedJob } from '../services/scraper.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

const sampleJobs = [
  {
    title: 'React Frontend Developer',
    company: 'ABC Tech',
    location: 'Remote',
    description: 'React JavaScript REST API Tailwind Testing role for frontend fresher.',
    url: 'https://example.com/react-frontend',
    source: 'sample'
  },
  {
    title: 'MERN Stack Intern',
    company: 'Startup Labs',
    location: 'Bengaluru Hybrid',
    description: 'MongoDB Express React Node.js API Git internship with portfolio projects.',
    url: 'https://example.com/mern-intern',
    source: 'sample'
  },
  {
    title: 'Next.js Developer',
    company: 'Cloud UI',
    location: 'Remote',
    description: 'Next.js TypeScript React server rendering and testing role.',
    url: 'https://example.com/nextjs-dev',
    source: 'sample'
  }
];

export const fetchDailyJobs = asyncHandler(async (_req, res) => {
  const jobs = [];
  for (const sample of sampleJobs) {
    const normalized = normalizeScrapedJob(sample);
    const job = await Job.findOneAndUpdate(
      { source: normalized.source, sourceJobId: normalized.sourceJobId || normalized.url },
      normalized,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    jobs.push(job);
  }
  res.json({ success: true, data: jobs });
});

export const todayJobs = asyncHandler(async (_req, res) => {
  let jobs = await Job.find().sort({ createdAt: -1 }).limit(20);
  if (jobs.length === 0) {
    for (const sample of sampleJobs) {
      await Job.create(normalizeScrapedJob(sample));
    }
    jobs = await Job.find().sort({ createdAt: -1 }).limit(20);
  }
  res.json({ success: true, data: jobs });
});

export const recommendedJobs = asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id);
  const jobs = await Job.find().sort({ createdAt: -1 }).limit(20);
  const profileText = `${user?.profile?.skills?.join(' ') || ''} ${user?.profile?.resumeBaseText || ''}`;
  const scored = jobs
    .map((job) => ({ job, score: scoreJob(profileText, user?.profile?.resumeBaseText || '', job.description) }))
    .sort((a, b) => b.score.finalScore - a.score.finalScore);
  res.json({ success: true, data: scored });
});

export const analyzeJob = asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id);
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found.', 404);
  const data = scoreJob(`${user?.profile?.skills?.join(' ') || ''}`, user?.profile?.resumeBaseText || '', job.description);
  res.json({ success: true, data });
});

export const saveJob = asyncHandler(async (req: any, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found.', 404);
  const app = await Application.create({
    userId: req.user.id,
    jobId: job._id,
    company: job.company,
    title: job.title,
    status: 'saved',
    timeline: [{ status: 'saved', note: 'Saved from jobs page.' }]
  });
  res.status(201).json({ success: true, data: app });
});

export const importUrl = asyncHandler(async (req, res) => {
  const schema = z.object({ url: z.string().url(), title: z.string().optional(), company: z.string().optional(), description: z.string().optional() });
  const data = schema.parse(req.body);
  const job = await Job.create(
    normalizeScrapedJob({
      url: data.url,
      title: data.title || 'Imported Job',
      company: data.company || 'Imported Company',
      description: data.description || `User imported job from ${data.url}`,
      source: 'manual-url'
    })
  );
  res.status(201).json({ success: true, data: job });
});

export const dailyDigest = asyncHandler(async (req: any, res) => {
  const [jobs, highMatch, followUps, interviews] = await Promise.all([
    Job.countDocuments(),
    Job.find().limit(5),
    Application.countDocuments({ userId: req.user.id, followUpDate: { $lte: new Date() } }),
    Application.countDocuments({ userId: req.user.id, status: 'interview' })
  ]);
  res.json({
    success: true,
    data: {
      jobsFound: jobs,
      highMatchJobs: highMatch.length,
      followUps,
      interviews,
      mission: ['Apply to 5 jobs', 'Improve ATS keywords', 'Practice 10 interview questions']
    }
  });
});

export const interviewPrep = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      companyBackground: 'Review the company website, product, customers, and recent hiring signals.',
      possibleRounds: ['Resume screening', 'Technical interview', 'Project discussion', 'HR round'],
      technicalQuestions: ['Explain React hooks.', 'How do you handle API loading states?', 'Walk through your best project.'],
      hrQuestions: ['Tell me about yourself.', 'Why this role?', 'What are your salary expectations?'],
      preparationPlan: ['Revise role basics', 'Prepare project stories', 'Practice concise answers']
    }
  });
});

export const generatePortfolio = asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id);
  const username = user?.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() || `user${Date.now()}`;
  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user.id },
    {
      userId: req.user.id,
      username,
      headline: `${user?.profile?.preferredRoles?.[0] || 'Full Stack Developer'} Portfolio`,
      summary: user?.profile?.resumeBaseText || 'AI-generated portfolio summary ready for editing.',
      skills: user?.profile?.skills || [],
      projects: [{ name: 'Featured Project', description: 'Add your strongest project outcome here.', url: '' }],
      published: true
    },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: portfolio });
});

export const getPortfolio = asyncHandler(async (req: any, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  res.json({ success: true, data: portfolio });
});

export const publicPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ username: req.params.username, published: true });
  if (!portfolio) throw new AppError('Portfolio not found.', 404);
  res.json({ success: true, data: portfolio });
});

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
    title: 'Full Stack Developer',
    company: 'Delhi Product Studio',
    location: 'Delhi Hybrid',
    description: 'Full stack developer role for React Next.js Node.js Express MongoDB TypeScript REST API projects. Open to fresher and junior candidates with strong portfolio work.',
    url: 'https://careers.delhiproductstudio.example/jobs/full-stack-developer',
    source: 'sample'
  },
  {
    title: 'Full Stack Developer Intern',
    company: 'NCR SaaS Labs',
    location: 'Delhi Remote',
    description: 'Internship for full stack developer using JavaScript React Node.js MongoDB Git APIs and Tailwind. Fresher friendly role with mentor support.',
    url: 'https://careers.ncrsaaslabs.example/jobs/full-stack-intern',
    source: 'sample'
  },
  {
    title: 'React Frontend Developer',
    company: 'ABC Tech',
    location: 'Remote',
    description: 'React JavaScript REST API Tailwind Testing role for frontend fresher.',
    url: '',
    source: 'sample'
  },
  {
    title: 'MERN Stack Intern',
    company: 'Startup Labs',
    location: 'Bengaluru Hybrid',
    description: 'MongoDB Express React Node.js API Git internship with portfolio projects.',
    url: '',
    source: 'sample'
  },
  {
    title: 'Next.js Developer',
    company: 'Cloud UI',
    location: 'Remote',
    description: 'Next.js TypeScript React server rendering and testing role.',
    url: '',
    source: 'sample'
  }
];

const ensureSampleJobs = async () => {
  const jobs = [];
  for (const sample of sampleJobs) {
    const normalized = normalizeScrapedJob(sample);
    const sourceJobId =
      normalized.sourceJobId ||
      `${normalized.title}-${normalized.company}-${normalized.location}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const job = await Job.findOneAndUpdate(
      { source: normalized.source, sourceJobId },
      { ...normalized, sourceJobId, postedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    jobs.push(job);
  }
  return jobs;
};

export const fetchDailyJobs = asyncHandler(async (_req, res) => {
  const jobs = await ensureSampleJobs();
  res.json({ success: true, data: jobs });
});

export const todayJobs = asyncHandler(async (_req, res) => {
  let jobs = await Job.find().sort({ createdAt: -1 }).limit(20);
  if (jobs.length === 0) {
    await ensureSampleJobs();
    jobs = await Job.find().sort({ createdAt: -1 }).limit(20);
  }
  res.json({ success: true, data: jobs });
});

export const recommendedJobs = asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id);
  let jobs = await Job.find().sort({ createdAt: -1 }).limit(20);
  if (jobs.length === 0) {
    await ensureSampleJobs();
    jobs = await Job.find().sort({ createdAt: -1 }).limit(20);
  }
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

export const scoreJobEndpoint = asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id);
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found.', 404);
  const score = scoreJob(`${user?.profile?.skills?.join(' ') || ''}`, user?.profile?.resumeBaseText || '', job.description);
  res.json({
    success: true,
    data: {
      ...score,
      applyDecision:
        score.scamRiskScore >= 70 ? 'skip' : score.finalScore >= 85 ? 'apply_now' : score.finalScore >= 70 ? 'tailor_first' : score.finalScore >= 50 ? 'improve_first' : 'skip',
      nextActions: [score.aiRecommendation, 'Use Manual Apply Mode after submitting on the original portal.']
    }
  });
});

export const scamCheck = asyncHandler(async (req, res) => {
  const text = `${req.body.title || ''} ${req.body.company || ''} ${req.body.description || ''} ${req.body.url || ''}`;
  const reasons = [
    /gmail|yahoo|hotmail/i.test(text) ? 'Personal email domain detected.' : '',
    !/https?:\/\/(?!.*example\.com)/i.test(text) ? 'No official company website detected.' : '',
    /fee|deposit|payment|registration charge/i.test(text) ? 'Upfront payment language detected.' : '',
    /earn.*(lakh|crore)|guaranteed/i.test(text) ? 'Unrealistic compensation language detected.' : '',
    /bit\.ly|tinyurl|telegram|whatsapp only|example\.com/i.test(text) ? 'Suspicious or non-operational URL detected.' : '',
    text.length < 240 ? 'Job description is too vague.' : '',
    /(urgent hiring!!!|work from home earn|no interview)/i.test(text) ? 'Low-quality or suspicious wording detected.' : ''
  ].filter(Boolean);
  const risk = reasons.length >= 2 ? 'high' : reasons.length === 1 ? 'medium' : 'low';
  res.json({
    success: true,
    data: {
      risk,
      signals: reasons,
      recommendation: risk === 'high' ? 'Do not apply until verified through official company channels.' : 'Verify company details before sharing sensitive information.',
      scamRisk: risk,
      reasons,
      safetyRecommendation: risk === 'high' ? 'Do not apply until verified through official company channels.' : 'Verify company details before sharing sensitive information.'
    }
  });
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
  const schema = z.object({
    url: z.string().url().or(z.literal('')).optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    description: z.string().optional()
  });
  const data = schema.parse(req.body);
  const job = await Job.create(
    normalizeScrapedJob({
      url: data.url || '',
      title: data.title || 'Imported Job',
      company: data.company || 'Imported Company',
      description: data.description || `User imported job from ${data.url}`,
      source: 'manual-url'
    })
  );
  res.status(201).json({ success: true, data: job });
});

export const dailyDigest = asyncHandler(async (req: any, res) => {
  if ((await Job.countDocuments()) === 0) {
    await ensureSampleJobs();
  }
  const [jobs, highMatch, followUps, interviews] = await Promise.all([
    Job.countDocuments(),
    Job.find().limit(5),
    Application.countDocuments({ userId: req.user.id, followUpDate: { $lte: new Date() } }),
    Application.countDocuments({ userId: req.user.id, status: { $in: ['interview_round_1', 'interview_round_2', 'hr_round'] } })
  ]);
  res.json({
    success: true,
    data: {
      jobsFound: jobs,
      highMatchJobs: highMatch.length,
      topJobs: highMatch.map((job) => ({
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location
      })),
      urgentApplyJobs: highMatch.slice(0, 3).map((job) => `${job.title} at ${job.company}`),
      remoteJobs: highMatch.filter((job) => job.remote).length,
      missingSkills: ['TypeScript', 'Testing', 'System design'].slice(0, 3),
      followUps,
      interviews,
      resumeImprovements: ['Add measurable project impact', 'Keep reverse-chronological experience', 'Add truthful keywords from target roles'],
      notifications: [
        { type: 'daily_digest_ready', title: 'Daily digest ready', body: 'Review high-fit jobs and follow-ups due today.' },
        { type: 'integration_issue', title: 'Integrations need setup', body: 'Add provider keys to unlock live job and email sync.' }
      ],
      mission: ['Apply to 5 jobs', 'Improve ATS keywords', 'Practice 10 interview questions']
    }
  });
});

export const generateDailyDigest = asyncHandler(async (req: any, res) => {
  const jobs = await Job.countDocuments();
  res.json({
    success: true,
    data: {
      jobsFound: jobs,
      highMatchJobs: Math.min(jobs, 10),
      urgentApplyJobs: [],
      followUps: 0,
      interviews: 0,
      missingSkills: ['Testing', 'TypeScript'],
      mission: ['Review top jobs', 'Send one follow-up', 'Improve one resume bullet'],
      generated: true
    }
  });
});

export const notifications = asyncHandler(async (_req: any, res) => {
  res.json({
    success: true,
    data: [
      { _id: 'follow-up', title: 'Follow-up due', body: 'Review manually applied jobs and send one follow-up.', read: false },
      { _id: 'daily-digest', title: 'Daily digest ready', body: 'Check top matching jobs for today.', read: false },
      { _id: 'integration-issue', title: 'Integration issue', body: 'Connect provider credentials to unlock live sync.', read: false }
    ]
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { _id: req.params.id, read: true } });
});

export const syncIntegrations = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      imported: 3,
      duplicates: 0,
      failed: 0,
      sources: ['curated', 'manual-url', 'chrome-extension'],
      fallback: true
    }
  });
});

export const integrationsStatus = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      adzuna: 'needs_credentials',
      remotive: 'fallback_ready',
      greenhouse: 'fallback_ready',
      lever: 'fallback_ready',
      ashby: 'fallback_ready',
      lastSync: new Date().toISOString()
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

export const updatePortfolio = asyncHandler(async (req: any, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user.id },
    { ...req.body, userId: req.user.id },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: portfolio });
});

export const publishPortfolio = asyncHandler(async (req: any, res) => {
  const portfolio = await Portfolio.findOneAndUpdate({ userId: req.user.id }, { published: true }, { new: true });
  res.json({ success: true, data: portfolio });
});

export const publicPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ username: req.params.username, published: true });
  if (!portfolio) throw new AppError('Portfolio not found.', 404);
  res.json({ success: true, data: portfolio });
});

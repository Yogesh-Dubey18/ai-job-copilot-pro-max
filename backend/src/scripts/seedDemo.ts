import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import {
  Application,
  AuditLog,
  Company,
  Interview,
  Job,
  Notification,
  Resume,
  SavedJob,
  User
} from '../models';
import { slugify } from '../utils/slug';

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'employer' | 'job_seeker';
  profile?: Record<string, unknown>;
};

const users: SeedUser[] = [
  {
    name: 'Admin User',
    email: 'admin@aijobportal.com',
    password: 'Admin@12345',
    role: 'admin'
  },
  {
    name: 'Aarav Sharma',
    email: 'seeker@aijobportal.com',
    password: 'Seeker@12345',
    role: 'job_seeker',
    profile: {
      headline: 'Full-stack developer focused on AI SaaS products',
      location: 'Delhi NCR',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      preferredRoles: ['Full Stack Developer', 'Frontend Developer', 'AI Product Engineer'],
      preferredJobType: 'full_time',
      remotePreference: 'remote',
      expectedSalary: 900000,
      github: 'https://github.com/demo-seeker',
      linkedin: 'https://linkedin.com/in/demo-seeker',
      portfolio: 'https://demo-seeker.dev',
      resumeBaseText:
        'Full-stack developer building Next.js, React, TypeScript, Node.js and MongoDB products with secure auth, dashboards, REST APIs, and AI-assisted workflows.'
    }
  },
  {
    name: 'Nisha Patel',
    email: 'nisha.seeker@aijobportal.com',
    password: 'Seeker@12345',
    role: 'job_seeker',
    profile: {
      headline: 'Data analyst and Python developer',
      location: 'Bengaluru',
      skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Statistics', 'Tableau'],
      preferredRoles: ['Data Analyst', 'Business Analyst', 'Analytics Engineer'],
      preferredJobType: 'full_time',
      remotePreference: 'hybrid',
      expectedSalary: 700000,
      resumeBaseText:
        'Data analyst with Python, SQL, Power BI and statistics experience building dashboards, automated reports, and business insights for product and operations teams.'
    }
  },
  {
    name: 'Riya Mehta',
    email: 'employer@aijobportal.com',
    password: 'Employer@12345',
    role: 'employer'
  },
  {
    name: 'Kabir Singh',
    email: 'kabir.employer@aijobportal.com',
    password: 'Employer@12345',
    role: 'employer'
  }
];

const hashCache = new Map<string, string>();

async function hashPassword(password: string) {
  if (!hashCache.has(password)) {
    hashCache.set(password, await bcrypt.hash(password, 12));
  }
  return hashCache.get(password)!;
}

async function upsertUser(seed: SeedUser) {
  return User.findOneAndUpdate(
    { email: seed.email.toLowerCase() },
    {
      name: seed.name,
      email: seed.email.toLowerCase(),
      passwordHash: await hashPassword(seed.password),
      role: seed.role,
      status: 'active',
      emailVerified: true,
      ...(seed.profile ? { profile: seed.profile } : {})
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertCompany(ownerId: mongoose.Types.ObjectId, name: string, overrides: Record<string, unknown>) {
  const slug = slugify(name);
  return Company.findOneAndUpdate(
    { slug },
    {
      ownerId,
      name,
      slug,
      verificationStatus: 'verified',
      trustScore: 92,
      ...overrides
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

const futureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function upsertJob(company: any, employerId: mongoose.Types.ObjectId, seed: Record<string, any>) {
  const slug = slugify(`${seed.title}-${company.name}`);
  const sourceJobId = `seed-${slug}`;
  return Job.findOneAndUpdate(
    { source: 'seed', sourceJobId },
    {
      companyId: company._id,
      employerId,
      company: company.name,
      source: 'seed',
      sourceJobId,
      slug,
      status: 'published',
      moderationStatus: 'approved',
      postedAt: new Date(),
      deadline: futureDate(seed.deadlineDays || 21),
      ...seed
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seedDemo() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error('Refusing to seed in production without ALLOW_PRODUCTION_SEED=true.');
  }

  await connectDB();

  const [admin, seeker, secondSeeker, employer, secondEmployer] = await Promise.all(users.map(upsertUser));

  const [techNova, cloudBridge] = await Promise.all([
    upsertCompany(employer._id, 'TechNova Labs', {
      website: 'https://technova.example',
      industry: 'AI SaaS',
      size: '51-200',
      location: 'Bengaluru, India',
      description: 'AI workflow platform building hiring, productivity, and automation tools.'
    }),
    upsertCompany(secondEmployer._id, 'CloudBridge Systems', {
      website: 'https://cloudbridge.example',
      industry: 'Cloud Services',
      size: '201-500',
      location: 'Hyderabad, India',
      description: 'Cloud infrastructure company hiring engineers for secure distributed systems.'
    })
  ]);

  const jobSeeds = [
    {
      company: techNova,
      employerId: employer._id,
      title: 'Full Stack Developer',
      location: 'Bengaluru, India',
      workplaceType: 'hybrid',
      employmentType: 'full_time',
      salaryMin: 900000,
      salaryMax: 1500000,
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      experienceLevel: '1-3 years',
      description: 'Build secure AI SaaS workflows using React, Node.js, TypeScript, REST APIs, MongoDB, and dashboards.',
      responsibilities: ['Build product features', 'Own API integrations', 'Improve dashboard UX'],
      requirements: ['React production experience', 'Node.js APIs', 'MongoDB data modeling'],
      benefits: ['Flexible work', 'Learning budget', 'Health insurance']
    },
    {
      company: techNova,
      employerId: employer._id,
      title: 'Frontend Engineer - Next.js',
      location: 'Remote India',
      workplaceType: 'remote',
      employmentType: 'full_time',
      salaryMin: 800000,
      salaryMax: 1300000,
      skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
      experienceLevel: '0-2 years',
      description: 'Create polished Next.js app router interfaces with TypeScript, Tailwind, accessibility, and reusable UI systems.'
    },
    {
      company: techNova,
      employerId: employer._id,
      title: 'AI Product Engineer Intern',
      location: 'Delhi Remote',
      workplaceType: 'remote',
      employmentType: 'internship',
      salaryMin: 25000,
      salaryMax: 45000,
      skills: ['JavaScript', 'APIs', 'Prompt Engineering', 'React'],
      experienceLevel: 'Fresher',
      description: 'Internship for freshers to build AI product prototypes, prompt workflows, React UI, and API integrations.'
    },
    {
      company: techNova,
      employerId: employer._id,
      title: 'Backend API Developer',
      location: 'Pune, India',
      workplaceType: 'hybrid',
      employmentType: 'contract',
      salaryMin: 700000,
      salaryMax: 1200000,
      skills: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Redis'],
      experienceLevel: '2-4 years',
      description: 'Own secure REST APIs, background jobs, MongoDB models, authentication, rate limits, and observability.'
    },
    {
      company: techNova,
      employerId: employer._id,
      title: 'QA Automation Engineer',
      location: 'Noida, India',
      workplaceType: 'onsite',
      employmentType: 'full_time',
      salaryMin: 600000,
      salaryMax: 1000000,
      skills: ['Playwright', 'Jest', 'API Testing', 'TypeScript'],
      experienceLevel: '1-3 years',
      description: 'Build automated coverage for SaaS user journeys, API contracts, browser smoke tests, and release quality gates.'
    },
    {
      company: cloudBridge,
      employerId: secondEmployer._id,
      title: 'Cloud DevOps Engineer',
      location: 'Hyderabad, India',
      workplaceType: 'hybrid',
      employmentType: 'full_time',
      salaryMin: 1200000,
      salaryMax: 2000000,
      skills: ['AWS', 'Docker', 'CI/CD', 'Kubernetes'],
      experienceLevel: '3-5 years',
      description: 'Manage CI/CD, cloud deployment, container orchestration, monitoring, and secure production infrastructure.'
    },
    {
      company: cloudBridge,
      employerId: secondEmployer._id,
      title: 'Data Analyst',
      location: 'Bengaluru, India',
      workplaceType: 'hybrid',
      employmentType: 'full_time',
      salaryMin: 650000,
      salaryMax: 1100000,
      skills: ['SQL', 'Python', 'Power BI', 'Statistics'],
      experienceLevel: '0-2 years',
      description: 'Analyze product metrics with SQL and Python, create Power BI dashboards, and communicate business insights.'
    },
    {
      company: cloudBridge,
      employerId: secondEmployer._id,
      title: 'Security Engineer',
      location: 'Remote India',
      workplaceType: 'remote',
      employmentType: 'full_time',
      salaryMin: 1400000,
      salaryMax: 2400000,
      skills: ['AppSec', 'OWASP', 'Node.js', 'Cloud Security'],
      experienceLevel: '3-6 years',
      description: 'Improve application security, threat modeling, vulnerability management, secure reviews, and cloud guardrails.'
    },
    {
      company: cloudBridge,
      employerId: secondEmployer._id,
      title: 'Customer Success Engineer',
      location: 'Mumbai, India',
      workplaceType: 'onsite',
      employmentType: 'full_time',
      salaryMin: 500000,
      salaryMax: 900000,
      skills: ['APIs', 'SQL', 'Communication', 'Troubleshooting'],
      experienceLevel: '1-3 years',
      description: 'Help customers integrate APIs, debug technical issues, write solution notes, and partner with engineering.'
    },
    {
      company: cloudBridge,
      employerId: secondEmployer._id,
      title: 'Software Engineer Fresher',
      location: 'Chennai, India',
      workplaceType: 'onsite',
      employmentType: 'full_time',
      salaryMin: 450000,
      salaryMax: 700000,
      skills: ['Java', 'SQL', 'DSA', 'Git'],
      experienceLevel: 'Fresher',
      description: 'Fresher-friendly software engineering role for candidates strong in Java, SQL, data structures, Git, and problem solving.'
    }
  ];

  const jobs = await Promise.all(jobSeeds.map((job) => upsertJob(job.company, job.employerId, job)));

  const resume = await Resume.findOneAndUpdate(
    { userId: seeker._id, title: 'AI SaaS Full Stack Resume' },
    {
      userId: seeker._id,
      title: 'AI SaaS Full Stack Resume',
      filename: 'seed-ai-saas-full-stack.txt',
      originalName: 'ai-saas-full-stack-resume.txt',
      mimeType: 'text/plain',
      size: 980,
      parsedText: seeker.profile?.resumeBaseText,
      extractedText: seeker.profile?.resumeBaseText,
      extractionStatus: 'parsed',
      detectedSkills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      atsScore: 82,
      aiScore: 82,
      aiSuggestions: {
        missingSkills: ['Docker', 'AWS'],
        weakSections: ['Quantified impact'],
        atsTips: ['Use reverse chronological experience and plain headings.'],
        keywordImprovements: ['Add secure API, deployment, CI/CD, and testing keywords.'],
        summaryImprovement: 'Lead with AI SaaS product work and measurable feature outcomes.',
        projectBulletImprovements: ['Add one bullet with latency, usage, or conversion impact.']
      },
      scoreHistory: [{ score: 82, suggestions: { atsTips: ['Use plain headings and skill keywords.'] } }]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Resume.findOneAndUpdate(
    { userId: secondSeeker._id, title: 'Data Analyst Resume' },
    {
      userId: secondSeeker._id,
      title: 'Data Analyst Resume',
      filename: 'seed-data-analyst.txt',
      originalName: 'data-analyst-resume.txt',
      mimeType: 'text/plain',
      size: 740,
      parsedText: secondSeeker.profile?.resumeBaseText,
      extractedText: secondSeeker.profile?.resumeBaseText,
      extractionStatus: 'parsed',
      detectedSkills: ['Python', 'SQL', 'Power BI', 'Statistics'],
      atsScore: 79,
      aiScore: 79,
      scoreHistory: [{ score: 79, suggestions: { atsTips: ['Mention dashboard business impact.'] } }]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const application = await Application.findOneAndUpdate(
    { userId: seeker._id, jobId: jobs[0]._id },
    {
      userId: seeker._id,
      jobId: jobs[0]._id,
      companyId: jobs[0].companyId,
      resumeId: resume._id,
      company: jobs[0].company,
      title: jobs[0].title,
      status: 'shortlisted',
      appliedDate: futureDate(-3),
      followUpDate: futureDate(2),
      matchScore: 86,
      matchDetails: {
        matchedSkills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        missingSkills: ['Docker'],
        summary: 'Strong full-stack fit with room to add deployment evidence.'
      },
      coverLetter: 'Dear TechNova Labs team, I am excited to apply my AI SaaS and full-stack experience to your product team.',
      missingSkills: ['Docker'],
      timeline: [
        { status: 'applied', note: 'Seeded application submitted.', source: 'seed', date: futureDate(-3) },
        { status: 'shortlisted', note: 'Employer shortlisted this candidate.', source: 'employer', date: futureDate(-1) }
      ]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Application.findOneAndUpdate(
    { userId: secondSeeker._id, jobId: jobs[6]._id },
    {
      userId: secondSeeker._id,
      jobId: jobs[6]._id,
      companyId: jobs[6].companyId,
      company: jobs[6].company,
      title: jobs[6].title,
      status: 'applied',
      appliedDate: futureDate(-2),
      matchScore: 91,
      timeline: [{ status: 'applied', note: 'Seeded analytics application.', source: 'seed', date: futureDate(-2) }]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Promise.all([
    SavedJob.findOneAndUpdate({ userId: seeker._id, jobId: jobs[1]._id }, { userId: seeker._id, jobId: jobs[1]._id }, { upsert: true }),
    SavedJob.findOneAndUpdate({ userId: seeker._id, jobId: jobs[2]._id }, { userId: seeker._id, jobId: jobs[2]._id }, { upsert: true }),
    SavedJob.findOneAndUpdate({ userId: secondSeeker._id, jobId: jobs[6]._id }, { userId: secondSeeker._id, jobId: jobs[6]._id }, { upsert: true })
  ]);

  await Notification.findOneAndUpdate(
    { userId: seeker._id, title: 'Application shortlisted' },
    {
      userId: seeker._id,
      title: 'Application shortlisted',
      message: 'TechNova Labs shortlisted your Full Stack Developer application.',
      body: 'Prepare project stories and review the job requirements before the interview.',
      type: 'application_status',
      link: `/jobseeker/applications/${application._id}`,
      read: false
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Interview.findOneAndUpdate(
    { applicationId: application._id },
    {
      applicationId: application._id,
      jobId: jobs[0]._id,
      companyId: jobs[0].companyId,
      candidateId: seeker._id,
      employerId: employer._id,
      scheduledAt: futureDate(4),
      mode: 'video',
      meetingLink: 'https://meet.example/technova-full-stack',
      status: 'scheduled',
      notes: 'Technical screen focused on React, Node.js APIs, and project discussion.'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await AuditLog.findOneAndUpdate(
    { action: 'seed.portal_demo', entityType: 'SeedData' },
    {
      actorId: admin._id,
      action: 'seed.portal_demo',
      entityType: 'SeedData',
      entityId: 'portal-demo',
      metadata: {
        users: users.length,
        companies: 2,
        jobs: jobs.length,
        applications: 2
      },
      ip: 'local-seed'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Portal demo data seeded.');
  console.log('Admin: admin@aijobportal.com / Admin@12345');
  console.log('Employer: employer@aijobportal.com / Employer@12345');
  console.log('Job seeker: seeker@aijobportal.com / Seeker@12345');

  await mongoose.disconnect();
}

seedDemo().catch(async (error) => {
  console.error('Demo seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});

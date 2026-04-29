import 'dotenv/config';
import mongoose from 'mongoose';
import Application from '../models/Application';
import Job from '../models/Job';
import Resume from '../models/Resume';
import User from '../models/User';
import { normalizeScrapedJob } from '../services/scraper.service';

async function seedDemo() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne({ email: process.env.ADMIN_EMAIL || 'yogeshdubey8924@gmail.com' });
  if (!user) {
    throw new Error('Run seed:admin first so demo data can attach to the admin user.');
  }

  user.profile = {
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    experienceLevel: 'Entry-level full-stack developer',
    resumeBaseText: 'Full-stack developer building React, Next.js, Node.js and MongoDB projects with clean APIs and accessible UI.',
    preferredRoles: ['Frontend Developer', 'MERN Stack Developer', 'Next.js Developer'],
    expectedSalary: 600000
  };
  await user.save();

  const jobs = await Job.insertMany(
    [
      normalizeScrapedJob({
        title: 'Next.js Frontend Developer',
        company: 'Cloud UI Labs',
        location: 'Remote',
        description: 'Next.js React TypeScript Tailwind API testing role for a product team.',
        url: '',
        source: 'demo'
      }),
      normalizeScrapedJob({
        title: 'MERN Stack Developer',
        company: 'Startup Works',
        location: 'Bengaluru Hybrid',
        description: 'MongoDB Express React Node.js REST API role with dashboard and authentication work.',
        url: '',
        source: 'demo'
      })
    ],
    { ordered: false }
  ).catch(async () => Job.find({ source: 'demo' }).limit(2));

  await Resume.findOneAndUpdate(
    { userId: user._id, title: 'Demo Full Stack Resume' },
    {
      userId: user._id,
      title: 'Demo Full Stack Resume',
      parsedText: user.profile.resumeBaseText,
      atsScore: 78,
      versions: []
    },
    { upsert: true, new: true }
  );

  if (jobs[0]) {
    await Application.findOneAndUpdate(
      { userId: user._id, jobId: jobs[0]._id },
      {
        userId: user._id,
        jobId: jobs[0]._id,
        company: jobs[0].company,
        title: jobs[0].title,
        status: 'saved',
        matchScore: 86,
        timeline: [{ status: 'saved', note: 'Seeded demo application.' }]
      },
      { upsert: true, new: true }
    );
  }

  await Job.updateMany({ url: /^https?:\/\/(www\.)?example\.com/i }, { $set: { url: '', sourceJobId: undefined } });

  console.log('Demo data seeded.');
  await mongoose.disconnect();
}

seedDemo().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

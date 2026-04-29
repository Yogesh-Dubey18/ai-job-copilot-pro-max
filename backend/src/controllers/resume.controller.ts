import { z } from 'zod';
import Job from '../models/Job';
import Resume from '../models/Resume';
import User from '../models/User';
import { scoreJob } from '../services/scoring.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

const uploadSchema = z.object({
  title: z.string().optional(),
  parsedText: z.string().min(20)
});

export const uploadResume = asyncHandler(async (req: any, res) => {
  const data = uploadSchema.parse(req.body);
  const atsScore = Math.min(100, Math.max(35, Math.round(data.parsedText.length / 35)));
  const resume = await Resume.create({
    userId: req.user.id,
    title: data.title || 'Base Resume',
    parsedText: data.parsedText,
    atsScore
  });

  await User.findByIdAndUpdate(req.user.id, { 'profile.resumeBaseText': data.parsedText });
  res.status(201).json({ success: true, data: resume });
});

export const listResumes = asyncHandler(async (req: any, res) => {
  const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: resumes });
});

export const atsCheck = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);

  const jobDescription = String(req.body.jobDescription || '');
  const result = scoreJob('', resume.parsedText, jobDescription || resume.parsedText);
  res.json({
    success: true,
    data: {
      atsScore: result.atsMatchScore,
      missingSkills: result.missingSkills,
      matchedSkills: result.matchedSkills,
      recommendations: ['Keep reverse chronological order', 'Add measurable impact bullets', 'Use job keywords truthfully']
    }
  });
});

export const tailorResume = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);

  const job = await Job.findById(req.params.jobId);
  if (!job) throw new AppError('Job not found.', 404);

  const result = scoreJob('', resume.parsedText, job.description);
  const content = `${resume.parsedText}\n\nTargeted Keywords: ${result.matchedSkills.join(', ')}\nMissing Skills To Learn: ${result.missingSkills.join(', ')}`;
  resume.versions.push({
    title: `${job.title} at ${job.company}`,
    content,
    atsScore: result.atsMatchScore,
    keywords: result.matchedSkills
  });
  await resume.save();
  res.json({ success: true, data: resume.versions[resume.versions.length - 1] });
});

export const resumeVersions = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);
  res.json({ success: true, data: resume.versions });
});

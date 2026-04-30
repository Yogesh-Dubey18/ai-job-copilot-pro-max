import { z } from 'zod';
import Job from '../models/Job';
import Resume from '../models/Resume';
import User from '../models/User';
import { buildResumeExport, parseResumeFile } from '../services/resumeFile.service';
import { scoreJob } from '../services/scoring.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

const uploadSchema = z.object({
  title: z.string().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  fileBase64: z.string().optional(),
  parsedText: z.string().optional()
});

const splitSections = (text: string) => {
  const skills = (text.match(/\b(React|Next\.js|TypeScript|JavaScript|Node\.js|Express|MongoDB|SQL|Python|Docker|AWS|Tailwind|Testing)\b/gi) || [])
    .map((skill) => skill.trim())
    .filter((skill, index, arr) => arr.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index);

  return {
    summary: text.split('\n').find((line) => line.trim().length > 40) || text.slice(0, 240),
    skills,
    experience: text.match(/experience[\s\S]{0,1200}/i)?.[0] || '',
    education: text.match(/education[\s\S]{0,800}/i)?.[0] || '',
    projects: text.match(/projects?[\s\S]{0,1000}/i)?.[0] || ''
  };
};

export const uploadResume = asyncHandler(async (req: any, res) => {
  const data = uploadSchema.parse(req.body);
  const mimeType = data.mimeType || 'text/plain';
  const parsedText = await parseResumeFile(mimeType, data.fileBase64, data.parsedText);
  if (parsedText.length < 20) throw new AppError('Resume content is too short to analyze.', 400);
  const atsScore = Math.min(100, Math.max(35, Math.round(parsedText.length / 35)));
  const resume = await Resume.create({
    userId: req.user.id,
    title: data.title || 'Base Resume',
    fileName: data.fileName || '',
    mimeType,
    parsedText,
    sections: splitSections(parsedText),
    atsScore
  });

  await User.findByIdAndUpdate(req.user.id, { 'profile.resumeBaseText': parsedText });
  res.status(201).json({ success: true, data: resume });
});

export const listResumes = asyncHandler(async (req: any, res) => {
  const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: resumes });
});

export const getResume = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);
  res.json({ success: true, data: resume });
});

export const parseResume = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);
  resume.sections = splitSections(resume.parsedText);
  await resume.save();
  res.json({ success: true, data: { sections: resume.sections, detectedSkills: resume.sections.skills } });
});

export const atsCheck = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);

  const jobDescription = String(req.body.jobDescription || '');
  const result = scoreJob('', resume.parsedText, jobDescription || resume.parsedText);
  const keywordMatch = result.atsMatchScore;
  const skillsCoverage = result.skillMatchScore;
  const formattingHealth = resume.parsedText.includes('|') ? 65 : 90;
  const projectRelevance = resume.sections?.projects ? 82 : 55;
  const impactStatements = /\d+%|\d+x|reduced|improved|built|created|launched/i.test(resume.parsedText) ? 85 : 58;
  const contactInfo = /@|linkedin|github|phone|\+91/i.test(resume.parsedText) ? 90 : 55;
  const overallScore = Math.round((keywordMatch + skillsCoverage + formattingHealth + projectRelevance + impactStatements + contactInfo) / 6);
  res.json({
    success: true,
    data: {
      atsScore: overallScore,
      breakdown: {
        keywordMatch,
        skillsCoverage,
        formattingHealth,
        projectRelevance,
        impactStatements,
        contactInfo,
        overallScore
      },
      missingSkills: result.missingSkills,
      matchedSkills: result.matchedSkills,
      recommendations: ['Keep reverse chronological order', 'Add measurable impact bullets', 'Use job keywords truthfully']
      ,
      formattingIssues: [
        resume.parsedText.includes('|') ? 'Avoid table-like pipe formatting for ATS safety.' : 'No table formatting detected.',
        resume.parsedText.length < 1200 ? 'Resume may be too short; add truthful project impact and responsibilities.' : 'Resume length is workable.'
      ]
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

export const deleteResume = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);
  res.json({ success: true, data: { deleted: true } });
});

export const exportResume = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);
  const exported = await buildResumeExport(req.params.format === 'docx' ? 'docx' : 'pdf', resume.title.replace(/[^a-z0-9-]+/gi, '-'), resume.parsedText);
  res.json({
    success: true,
    data: {
      format: req.params.format,
      fileName: exported.fileName,
      mimeType: exported.mimeType,
      base64: exported.base64,
      content: resume.parsedText,
      message: 'Resume export generated.'
    }
  });
});

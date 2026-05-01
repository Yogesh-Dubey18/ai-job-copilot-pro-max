import { z } from 'zod';
import fs from 'fs/promises';
import Job from '../models/Job';
import Resume from '../models/Resume';
import User from '../models/User';
import { buildResumeExport, parseResumeFile, resumeUploadSizeBytes, safeResumeFileName, validateResumeUpload } from '../services/resumeFile.service';
import { extractSkills, scoreJob } from '../services/scoring.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { isReadableResumeText, sanitizeResumeText } from '../utils/resumeText';

const uploadSchema = z.object({
  title: z.string().optional(),
  fileName: z.string().optional(),
  originalName: z.string().optional(),
  mimeType: z.string().optional(),
  fileBase64: z.string().optional(),
  parsedText: z.string().optional()
});

const manualTextSchema = z.object({
  text: z.string().min(200, 'Paste at least 200 characters of readable resume text.')
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

const buildResumeSuggestions = (text: string, detectedSkills: string[]) => {
  const weakSections = [
    !/summary|profile/i.test(text) ? 'Add a concise professional summary near the top.' : '',
    !/projects?/i.test(text) ? 'Add project bullets with technologies, scope, and measurable outcomes.' : '',
    !/experience|intern/i.test(text) ? 'Add experience, internship, freelance, or academic project evidence.' : '',
    !/\d+%|\d+x|reduced|improved|launched|built/i.test(text) ? 'Add quantified impact statements to your strongest bullets.' : ''
  ].filter(Boolean);

  return {
    missingSkills: detectedSkills.length >= 5 ? [] : ['Add 5-8 truthful role-specific technical skills.'],
    weakSections,
    atsTips: [
      'Use reverse chronological sections with clear headings.',
      'Avoid tables, graphics, columns, and icons that confuse ATS parsers.',
      'Mirror important job keywords naturally where they match your real experience.'
    ],
    keywordImprovements: detectedSkills.slice(0, 8),
    summaryImprovement:
      'Open with your target role, core stack, strongest project or experience proof, and the business outcome you can deliver.',
    projectBulletImprovements: [
      'Rewrite project bullets as Action + Technology + Result.',
      'Mention scale, users, latency, accuracy, automation, or time saved wherever truthful.'
    ]
  };
};

export const uploadResume = asyncHandler(async (req: any, res) => {
  const data = uploadSchema.parse(req.body);
  const mimeType = data.mimeType || 'text/plain';
  const defaultName = mimeType === 'application/pdf'
    ? 'resume.pdf'
    : mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ? 'resume.docx'
      : mimeType === 'application/msword'
        ? 'resume.doc'
        : 'resume.txt';
  const originalName = data.originalName || data.fileName || defaultName;
  const fileName = safeResumeFileName(data.fileName || originalName);
  validateResumeUpload(mimeType, data.fileBase64, fileName);
  const parsedText = sanitizeResumeText(await parseResumeFile(mimeType, data.fileBase64, data.parsedText, fileName));
  const readable = isReadableResumeText(parsedText);
  const detectedSkills = readable ? extractSkills(parsedText) : [];
  const atsScore = readable ? Math.min(100, Math.max(35, Math.round(parsedText.length / 35))) : null;
  const aiSuggestions = readable ? buildResumeSuggestions(parsedText, detectedSkills) : {
    missingSkills: [],
    weakSections: ['Readable resume text could not be extracted.'],
    atsTips: ['Paste clean resume text manually to enable ATS analysis.'],
    keywordImprovements: [],
    summaryImprovement: '',
    projectBulletImprovements: []
  };
  const resume = await Resume.create({
    userId: req.user.id,
    title: data.title || 'Base Resume',
    fileName,
    filename: fileName,
    originalName,
    size: resumeUploadSizeBytes(data.fileBase64, data.parsedText),
    mimeType,
    parsedText: readable ? parsedText : '',
    extractedText: readable ? parsedText : '',
    manualText: data.parsedText ? sanitizeResumeText(data.parsedText) : '',
    sections: readable ? splitSections(parsedText) : splitSections(''),
    atsScore,
    aiScore: atsScore,
    aiSuggestions,
    scoreHistory: atsScore === null ? [] : [{ score: atsScore, suggestions: aiSuggestions }],
    detectedSkills,
    extractionStatus: readable ? 'parsed' : 'needs_manual_text'
  });

  if (readable) {
    await User.findByIdAndUpdate(req.user.id, { 'profile.resumeBaseText': parsedText, 'profile.skills': detectedSkills });
  }
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
  const clean = sanitizeResumeText(resume.parsedText || resume.manualText || '');
  if (!isReadableResumeText(clean)) {
    resume.parsedText = '';
    resume.sections = splitSections('');
    resume.detectedSkills = [];
    resume.atsScore = null;
    resume.extractionStatus = 'needs_manual_text';
    await resume.save();
    return res.json({
      success: true,
      data: {
        sections: resume.sections,
        detectedSkills: [],
        extractionStatus: 'needs_manual_text',
        message: 'Readable resume text could not be extracted. Paste clean resume text manually.'
      }
    });
  }
  resume.parsedText = clean;
  resume.sections = splitSections(clean);
  resume.detectedSkills = extractSkills(clean);
  await resume.save();
  res.json({ success: true, data: { sections: resume.sections, detectedSkills: resume.sections.skills } });
});

export const atsCheck = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);
  const resumeText = sanitizeResumeText(resume.parsedText || resume.manualText || '');
  if (!isReadableResumeText(resumeText)) {
    return res.json({
      success: true,
      data: {
        atsScore: null,
        unavailable: true,
        message: 'Readable resume text could not be extracted. Paste clean resume text manually.',
        breakdown: {
          keywordMatch: null,
          skillsCoverage: null,
          formattingHealth: null,
          projectRelevance: null,
          impactStatements: null,
          contactInfo: null,
          overallScore: null
        },
        missingSkills: [],
        matchedSkills: [],
        recommendations: ['Paste clean resume text manually to run ATS analysis.'],
        formattingIssues: ['Automatic extraction did not produce readable resume text.']
      }
    });
  }

  const jobDescription = String(req.body.jobDescription || '');
  const result = scoreJob('', resumeText, jobDescription || resumeText);
  const keywordMatch = Number(result.atsMatchScore ?? 0);
  const skillsCoverage = Number(result.skillMatchScore ?? 0);
  const formattingHealth = resumeText.includes('|') ? 65 : 90;
  const projectRelevance = resume.sections?.projects ? 82 : 55;
  const impactStatements = /\d+%|\d+x|reduced|improved|built|created|launched/i.test(resumeText) ? 85 : 58;
  const contactInfo = /@|linkedin|github|phone|\+91/i.test(resumeText) ? 90 : 55;
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
        resumeText.includes('|') ? 'Avoid table-like pipe formatting for ATS safety.' : 'No table formatting detected.',
        resumeText.length < 1200 ? 'Resume may be too short; add truthful project impact and responsibilities.' : 'Resume length is workable.'
      ]
    }
  });
});

export const analyzeResume = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);

  const resumeText = sanitizeResumeText(resume.parsedText || resume.manualText || resume.extractedText || '');
  if (!isReadableResumeText(resumeText)) {
    resume.parsedText = '';
    resume.extractedText = '';
    resume.detectedSkills = [];
    resume.atsScore = null;
    resume.aiScore = null;
    resume.extractionStatus = 'needs_manual_text';
    resume.aiSuggestions = {
      missingSkills: [],
      weakSections: ['Automatic extraction did not produce readable resume text.'],
      atsTips: ['Paste clean resume text manually to run AI resume analysis.'],
      keywordImprovements: [],
      summaryImprovement: '',
      projectBulletImprovements: []
    };
    await resume.save();

    return res.json({
      success: true,
      message: 'Readable resume text could not be extracted. Paste clean resume text manually.',
      data: {
        aiScore: null,
        extractionStatus: 'needs_manual_text',
        aiSuggestions: resume.aiSuggestions
      }
    });
  }

  const detectedSkills = extractSkills(resumeText);
  const contactScore = /@|linkedin|github|phone|\+91/i.test(resumeText) ? 15 : 6;
  const sectionScore = ['summary', 'experience', 'education', 'projects'].reduce(
    (total, section) => total + (new RegExp(section, 'i').test(resumeText) ? 12 : 4),
    0
  );
  const skillsScore = Math.min(20, detectedSkills.length * 3);
  const impactScore = /\d+%|\d+x|reduced|improved|launched|built/i.test(resumeText) ? 17 : 8;
  const aiScore = Math.min(100, Math.max(35, contactScore + sectionScore + skillsScore + impactScore));
  const aiSuggestions = buildResumeSuggestions(resumeText, detectedSkills);

  resume.parsedText = resumeText;
  resume.extractedText = resumeText;
  resume.detectedSkills = detectedSkills;
  resume.sections = splitSections(resumeText);
  resume.atsScore = aiScore;
  resume.aiScore = aiScore;
  resume.aiSuggestions = aiSuggestions;
  resume.extractionStatus = resume.manualText ? 'manual_text' : 'parsed';
  resume.scoreHistory.push({ score: aiScore, suggestions: aiSuggestions });
  await resume.save();

  res.json({
    success: true,
    message: 'Resume analysis completed',
    data: {
      aiScore,
      detectedSkills,
      aiSuggestions,
      scoreHistory: resume.scoreHistory
    }
  });
});

export const tailorResume = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);

  const job = await Job.findById(req.params.jobId);
  if (!job) throw new AppError('Job not found.', 404);

  const resumeText = sanitizeResumeText(resume.parsedText || resume.manualText || '');
  if (!isReadableResumeText(resumeText)) {
    throw new AppError('Readable resume text could not be extracted. Paste clean resume text manually.', 400);
  }
  const result = scoreJob('', resumeText, job.description);
  const content = `${resumeText}\n\nTargeted Keywords: ${result.matchedSkills.join(', ')}\nMissing Skills To Learn: ${result.missingSkills.join(', ')}`;
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
  if (resume.localPath) {
    await fs.unlink(resume.localPath).catch(() => undefined);
  }
  res.json({ success: true, data: { deleted: true } });
});

export const exportResume = asyncHandler(async (req: any, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);
  const resumeText = sanitizeResumeText(resume.parsedText || resume.manualText || '');
  if (!isReadableResumeText(resumeText)) {
    throw new AppError('Readable resume text could not be extracted. Paste clean resume text manually.', 400);
  }
  const exported = await buildResumeExport(req.params.format === 'docx' ? 'docx' : 'pdf', resume.title.replace(/[^a-z0-9-]+/gi, '-'), resumeText);
  res.json({
    success: true,
    data: {
      format: req.params.format,
      fileName: exported.fileName,
      mimeType: exported.mimeType,
      base64: exported.base64,
      content: resumeText,
      message: 'Resume export generated.'
    }
  });
});

export const saveManualResumeText = asyncHandler(async (req: any, res) => {
  const data = manualTextSchema.parse(req.body);
  const clean = sanitizeResumeText(data.text);
  if (!isReadableResumeText(clean)) {
    throw new AppError('Paste at least 200 characters of clean, readable resume text.', 400);
  }

  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw new AppError('Resume not found.', 404);

  const detectedSkills = extractSkills(clean);
  resume.manualText = clean;
  resume.parsedText = clean;
  resume.sections = splitSections(clean);
  resume.detectedSkills = detectedSkills;
  resume.extractionStatus = 'manual_text';
  resume.atsScore = Math.min(100, Math.max(35, Math.round(clean.length / 35)));
  await resume.save();

  await User.findByIdAndUpdate(req.user.id, { 'profile.resumeBaseText': clean, 'profile.skills': detectedSkills });
  res.json({ success: true, data: resume });
});

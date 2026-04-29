import { Router } from 'express';
import { createApplyPack, createWorkflow } from '../controllers/ai.controller';
import { adminOverview, syncJobs } from '../controllers/admin.controller';
import {
  analyzeJob,
  dailyDigest,
  fetchDailyJobs,
  generatePortfolio,
  getPortfolio,
  importUrl,
  interviewPrep,
  publicPortfolio,
  recommendedJobs,
  saveJob,
  todayJobs
} from '../controllers/extra.controller';
import {
  configureMfa,
  login,
  logout,
  me,
  register,
  requestEmailVerification,
  requestPasswordReset,
  resetPassword,
  verifyEmail
} from '../controllers/auth.controller';
import {
  applicationStats,
  applicationAnalytics,
  createApplication,
  createJob,
  getJob,
  listApplications,
  listJobs,
  saveFromExtension,
  updateApplicationStatus
} from '../controllers/jobs.controller';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { atsCheck, listResumes, resumeVersions, tailorResume, uploadResume } from '../controllers/resume.controller';
import { protect, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/request-email-verification', requestEmailVerification);
router.post('/auth/verify-email', verifyEmail);
router.post('/auth/request-password-reset', requestPasswordReset);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/me', protect, me);
router.post('/auth/mfa', protect, configureMfa);

router.post('/ai/apply-pack', createApplyPack);
router.post('/ai/workflow', protect, createWorkflow);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.post('/resumes/upload', protect, uploadResume);
router.get('/resumes', protect, listResumes);
router.post('/resumes/:id/ats-check', protect, atsCheck);
router.post('/resumes/:id/tailor/:jobId', protect, tailorResume);
router.get('/resumes/:id/versions', protect, resumeVersions);

router.get('/jobs', listJobs);
router.post('/jobs', protect, createJob);
router.get('/jobs/today', protect, todayJobs);
router.get('/jobs/recommended', protect, recommendedJobs);
router.post('/jobs/fetch-daily', protect, fetchDailyJobs);
router.post('/jobs/import-url', protect, importUrl);
router.post('/jobs/save-from-extension', saveFromExtension);
router.get('/jobs/:id', getJob);
router.post('/jobs/:id/save', protect, saveJob);
router.post('/jobs/:id/analyze', protect, analyzeJob);

router.get('/applications', protect, listApplications);
router.post('/applications', protect, createApplication);
router.patch('/applications/:id/status', protect, updateApplicationStatus);
router.get('/applications/stats', protect, applicationStats);
router.get('/applications/analytics', protect, applicationAnalytics);

router.get('/admin/overview', protect, requireAdmin, adminOverview);
router.post('/admin/jobs/sync', protect, requireAdmin, syncJobs);

router.get('/daily-digest', protect, dailyDigest);
router.post('/interviews/prep/:applicationId', protect, interviewPrep);
router.post('/portfolio/generate', protect, generatePortfolio);
router.get('/portfolio', protect, getPortfolio);
router.get('/portfolio/public/:username', publicPortfolio);

export default router;

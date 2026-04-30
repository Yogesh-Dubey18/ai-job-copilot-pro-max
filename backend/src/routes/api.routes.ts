import { Router } from 'express';
import { companyReply, createApplyPack, createCopilot, createWorkflow } from '../controllers/ai.controller';
import { adminOverview, syncJobs } from '../controllers/admin.controller';
import { queueStatus } from '../controllers/background.controller';
import { billingPlans, billingStatus, incrementUsage } from '../controllers/billing.controller';
import { gmailConnect, gmailDisconnect, gmailStatus, gmailSync } from '../controllers/gmail.controller';
import {
  analyzeJob,
  dailyDigest,
  fetchDailyJobs,
  generatePortfolio,
  getPortfolio,
  generateDailyDigest,
  integrationsStatus,
  importUrl,
  interviewPrep,
  markNotificationRead,
  notifications,
  publicPortfolio,
  publishPortfolio,
  recommendedJobs,
  saveJob,
  scamCheck,
  scoreJobEndpoint,
  syncIntegrations,
  updatePortfolio,
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
  addApplicationTimeline,
  createApplication,
  createJob,
  getApplication,
  getJob,
  listApplications,
  listJobs,
  generateCompanyResponse,
  listCompanyResponses,
  manualApply,
  setFollowUp,
  saveFromExtension,
  updateApplicationStatus
} from '../controllers/jobs.controller';
import { deleteAccount, exportMyData, getProfile, updateProfile } from '../controllers/profile.controller';
import { atsCheck, deleteResume, exportResume, getResume, listResumes, parseResume, resumeVersions, tailorResume, uploadResume } from '../controllers/resume.controller';
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

router.get('/billing/plans', billingPlans);
router.get('/billing/status', protect, billingStatus);
router.get('/billing/subscription', protect, billingStatus);
router.post('/billing/usage', protect, incrementUsage);
router.get('/billing/usage', protect, billingStatus);

router.get('/gmail/status', protect, gmailStatus);
router.post('/gmail/connect', protect, gmailConnect);
router.post('/gmail/disconnect', protect, gmailDisconnect);
router.post('/gmail/sync', protect, gmailSync);

router.get('/queues/status', protect, requireAdmin, queueStatus);

router.post('/ai/apply-pack', createApplyPack);
router.post('/ai/workflow', protect, createWorkflow);
router.post('/ai/copilot', protect, createCopilot);
router.post('/ai/company-reply', protect, companyReply);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/profile/export', protect, exportMyData);
router.delete('/profile', protect, deleteAccount);

router.post('/resumes/upload', protect, uploadResume);
router.get('/resumes', protect, listResumes);
router.get('/resumes/:id', protect, getResume);
router.post('/resumes/:id/parse', protect, parseResume);
router.post('/resumes/:id/ats-check', protect, atsCheck);
router.post('/resumes/:id/tailor/:jobId', protect, tailorResume);
router.get('/resumes/:id/versions', protect, resumeVersions);
router.post('/resumes/:id/export/:format', protect, exportResume);
router.delete('/resumes/:id', protect, deleteResume);

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
router.post('/jobs/:id/score', protect, scoreJobEndpoint);

router.get('/applications', protect, listApplications);
router.post('/applications', protect, createApplication);
router.post('/applications/manual-apply', protect, manualApply);
router.get('/applications/stats', protect, applicationStats);
router.get('/applications/analytics', protect, applicationAnalytics);
router.get('/applications/:id', protect, getApplication);
router.patch('/applications/:id/status', protect, updateApplicationStatus);
router.post('/applications/:id/timeline', protect, addApplicationTimeline);
router.post('/applications/:id/follow-up', protect, setFollowUp);
router.post('/applications/:id/response', protect, generateCompanyResponse);
router.get('/applications/:id/replies', protect, listCompanyResponses);
router.post('/applications/:id/replies', protect, generateCompanyResponse);

router.get('/admin/overview', protect, requireAdmin, adminOverview);
router.post('/admin/jobs/sync', protect, requireAdmin, syncJobs);

router.get('/daily-digest', protect, dailyDigest);
router.post('/daily-digest/generate', protect, generateDailyDigest);
router.get('/notifications', protect, notifications);
router.patch('/notifications/:id/read', protect, markNotificationRead);
router.post('/integrations/jobs/sync', protect, requireAdmin, syncIntegrations);
router.get('/integrations/jobs/status', protect, requireAdmin, integrationsStatus);
router.post('/ai/scam-check', protect, scamCheck);
router.post('/interviews/prep/:applicationId', protect, interviewPrep);
router.post('/portfolio/generate', protect, generatePortfolio);
router.get('/portfolio', protect, getPortfolio);
router.put('/portfolio', protect, updatePortfolio);
router.post('/portfolio/publish', protect, publishPortfolio);
router.get('/portfolio/public/:username', publicPortfolio);

export default router;

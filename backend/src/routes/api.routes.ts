import { Router } from 'express';
import {
  companyReply,
  coverLetter,
  createApplyPack,
  createCopilot,
  createWorkflow,
  interviewEvaluate,
  interviewQuestions,
  jobMatch,
  rejectionAnalysis,
  resumeFeedback
} from '../controllers/ai.controller';
import {
  adminApplications,
  adminAuditLogs,
  adminCompanies,
  adminJobs,
  adminOverview,
  adminStats,
  adminUsers,
  jobSourceStatus,
  moderateJob,
  syncJobs,
  updateUserStatus,
  verifyCompany
} from '../controllers/admin.controller';
import { queueStatus } from '../controllers/background.controller';
import { billingPlans, billingStatus, billingWebhook, createCheckoutSession, incrementUsage } from '../controllers/billing.controller';
import { createCompany, getMyCompany, getPublicCompany, updateMyCompany } from '../controllers/company.controller';
import {
  addEmployerApplicationNote,
  getEmployerCandidate,
  listEmployerCandidates,
  listJobApplicants,
  scheduleEmployerInterview,
  updateEmployerApplicationStatus
} from '../controllers/employerApplicants.controller';
import {
  archiveEmployerJob,
  createEmployerJob,
  deleteEmployerJob,
  getEmployerJob,
  listEmployerJobs,
  publishEmployerJob,
  updateEmployerJob
} from '../controllers/employerJobs.controller';
import { gmailConnect, gmailDisconnect, gmailStatus, gmailSync } from '../controllers/gmail.controller';
import { listSavedJobsForUser, saveJobForUser, unsaveJobForUser } from '../controllers/savedJobs.controller';
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
import { listNotifications, markAllNotificationsRead, markNotificationAsRead } from '../controllers/notification.controller';
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
  updateApplicationStatus,
  withdrawApplication
} from '../controllers/jobs.controller';
import { deleteAccount, exportMyData, getProfile, updateProfile, updateProfileResumeText } from '../controllers/profile.controller';
import {
  analyzeResume,
  atsCheck,
  deleteResume,
  exportResume,
  getResume,
  listResumes,
  parseResume,
  resumeVersions,
  saveManualResumeText,
  tailorResume,
  uploadResume
} from '../controllers/resume.controller';
import { protect, requireAdmin, requireRole } from '../middleware/auth';

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
router.post('/billing/checkout', protect, createCheckoutSession);
router.post('/billing/webhook', billingWebhook);

router.get('/gmail/status', protect, gmailStatus);
router.post('/gmail/connect', protect, gmailConnect);
router.post('/gmail/disconnect', protect, gmailDisconnect);
router.post('/gmail/sync', protect, gmailSync);

router.get('/queues/status', protect, requireAdmin, queueStatus);

router.post('/ai/apply-pack', createApplyPack);
router.post('/ai/job-match', protect, jobMatch);
router.post('/ai/resume-feedback', protect, resumeFeedback);
router.post('/ai/cover-letter', protect, coverLetter);
router.post('/ai/interview/questions', protect, interviewQuestions);
router.post('/ai/interview/evaluate', protect, interviewEvaluate);
router.post('/ai/rejection-analysis', protect, rejectionAnalysis);
router.post('/ai/workflow', protect, createWorkflow);
router.post('/ai/copilot', protect, createCopilot);
router.post('/ai/company-reply', protect, companyReply);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/resume-text', protect, updateProfileResumeText);
router.get('/profile/export', protect, exportMyData);
router.delete('/profile', protect, deleteAccount);

router.post('/company', protect, requireRole('employer'), createCompany);
router.get('/company/me', protect, requireRole('employer'), getMyCompany);
router.put('/company/me', protect, requireRole('employer'), updateMyCompany);
router.get('/companies/:slug', getPublicCompany);

router.post('/employer/jobs', protect, requireRole('employer'), createEmployerJob);
router.get('/employer/jobs', protect, requireRole('employer'), listEmployerJobs);
router.get('/employer/jobs/:jobId/applications', protect, requireRole('employer'), listJobApplicants);
router.get('/employer/jobs/:id', protect, requireRole('employer'), getEmployerJob);
router.put('/employer/jobs/:id', protect, requireRole('employer'), updateEmployerJob);
router.delete('/employer/jobs/:id', protect, requireRole('employer'), deleteEmployerJob);
router.post('/employer/jobs/:id/publish', protect, requireRole('employer'), publishEmployerJob);
router.post('/employer/jobs/:id/archive', protect, requireRole('employer'), archiveEmployerJob);
router.get('/employer/candidates', protect, requireRole('employer'), listEmployerCandidates);
router.get('/employer/candidates/:applicationId', protect, requireRole('employer'), getEmployerCandidate);
router.patch('/employer/applications/:id/status', protect, requireRole('employer'), updateEmployerApplicationStatus);
router.post('/employer/applications/:id/note', protect, requireRole('employer'), addEmployerApplicationNote);
router.post('/employer/applications/:id/interview', protect, requireRole('employer'), scheduleEmployerInterview);

router.post('/resumes/upload', protect, uploadResume);
router.get('/resumes', protect, listResumes);
router.get('/resumes/:id', protect, getResume);
router.post('/resumes/:id/parse', protect, parseResume);
router.post('/resumes/:id/manual-text', protect, saveManualResumeText);
router.post('/resumes/:id/analyze', protect, analyzeResume);
router.post('/resumes/:id/ats-check', protect, atsCheck);
router.post('/resumes/:id/tailor/:jobId', protect, tailorResume);
router.get('/resumes/:id/versions', protect, resumeVersions);
router.post('/resumes/:id/export/:format', protect, exportResume);
router.delete('/resumes/:id', protect, deleteResume);

router.get('/jobs', listJobs);
router.get('/jobs/search', listJobs);
router.post('/jobs', protect, createJob);
router.get('/jobs/today', protect, todayJobs);
router.get('/jobs/recommended', protect, recommendedJobs);
router.post('/jobs/fetch-daily', protect, fetchDailyJobs);
router.post('/jobs/import-url', protect, importUrl);
router.post('/jobs/save-from-extension', protect, requireRole('job_seeker'), saveFromExtension);
router.get('/jobs/:id', getJob);
router.post('/jobs/:id/save', protect, saveJob);
router.post('/jobs/:id/analyze', protect, analyzeJob);
router.post('/jobs/:id/score', protect, scoreJobEndpoint);

router.post('/saved-jobs/:jobId', protect, requireRole('job_seeker'), saveJobForUser);
router.delete('/saved-jobs/:jobId', protect, requireRole('job_seeker'), unsaveJobForUser);
router.get('/saved-jobs', protect, requireRole('job_seeker'), listSavedJobsForUser);

router.get('/applications', protect, listApplications);
router.get('/jobseeker/applications', protect, requireRole('job_seeker'), listApplications);
router.post('/applications', protect, createApplication);
router.post('/applications/manual-apply', protect, manualApply);
router.get('/applications/stats', protect, applicationStats);
router.get('/applications/analytics', protect, applicationAnalytics);
router.get('/applications/:id', protect, getApplication);
router.post('/applications/:id/withdraw', protect, requireRole('job_seeker'), withdrawApplication);
router.patch('/applications/:id/status', protect, updateApplicationStatus);
router.post('/applications/:id/timeline', protect, addApplicationTimeline);
router.post('/applications/:id/follow-up', protect, setFollowUp);
router.post('/applications/:id/response', protect, generateCompanyResponse);
router.get('/applications/:id/replies', protect, listCompanyResponses);
router.post('/applications/:id/replies', protect, generateCompanyResponse);

router.get('/admin/overview', protect, requireAdmin, adminOverview);
router.get('/admin/stats', protect, requireAdmin, adminStats);
router.get('/admin/users', protect, requireAdmin, adminUsers);
router.patch('/admin/users/:id/status', protect, requireAdmin, updateUserStatus);
router.get('/admin/companies', protect, requireAdmin, adminCompanies);
router.patch('/admin/companies/:id/verify', protect, requireAdmin, verifyCompany);
router.get('/admin/jobs', protect, requireAdmin, adminJobs);
router.patch('/admin/jobs/:id/moderation', protect, requireAdmin, moderateJob);
router.get('/admin/applications', protect, requireAdmin, adminApplications);
router.get('/admin/audit-logs', protect, requireAdmin, adminAuditLogs);
router.post('/admin/jobs/sync', protect, requireAdmin, syncJobs);
router.get('/admin/job-sources/status', protect, requireAdmin, jobSourceStatus);

router.get('/daily-digest', protect, dailyDigest);
router.post('/daily-digest/generate', protect, generateDailyDigest);
router.get('/notifications', protect, listNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationAsRead);
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

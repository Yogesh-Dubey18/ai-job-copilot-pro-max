import { Router } from 'express';
import { createApplyPack, createWorkflow } from '../controllers/ai.controller';
import { adminOverview, syncJobs } from '../controllers/admin.controller';
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

router.get('/jobs', listJobs);
router.post('/jobs', protect, createJob);
router.get('/jobs/:id', getJob);
router.post('/jobs/save-from-extension', saveFromExtension);

router.get('/applications', protect, listApplications);
router.post('/applications', protect, createApplication);
router.patch('/applications/:id/status', protect, updateApplicationStatus);
router.get('/applications/stats', protect, applicationStats);
router.get('/applications/analytics', protect, applicationAnalytics);

router.get('/admin/overview', protect, requireAdmin, adminOverview);
router.post('/admin/jobs/sync', protect, requireAdmin, syncJobs);

export default router;

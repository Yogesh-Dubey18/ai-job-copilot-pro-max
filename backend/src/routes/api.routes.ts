import { Router } from 'express';
import { createApplyPack, createWorkflow } from '../controllers/ai.controller';
import { login, logout, me, register } from '../controllers/auth.controller';
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
import { protect } from '../middleware/auth';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', protect, me);

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

export default router;

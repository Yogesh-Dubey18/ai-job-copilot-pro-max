import Job from '../models/Job';
import SavedJob from '../models/SavedJob';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { getPagination, paginated } from '../utils/pagination';
import { publicJobById } from '../utils/publicJob';

export const saveJobForUser = asyncHandler(async (req: any, res) => {
  const job = await Job.findOne(publicJobById(req.params.jobId)).select('_id');
  if (!job) throw new AppError('Public job not found.', 404);

  const saved = await SavedJob.findOneAndUpdate(
    { userId: req.user.id, jobId: job._id },
    { userId: req.user.id, jobId: job._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  created(res, 'Job saved.', saved);
});

export const unsaveJobForUser = asyncHandler(async (req: any, res) => {
  await SavedJob.deleteOne({ userId: req.user.id, jobId: req.params.jobId });
  ok(res, 'Saved job removed.', { removed: true });
});

export const listSavedJobsForUser = asyncHandler(async (req: any, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = { userId: req.user.id };
  const [items, total] = await Promise.all([
    SavedJob.find(filter).populate('jobId').sort({ createdAt: -1 }).skip(skip).limit(limit),
    SavedJob.countDocuments(filter)
  ]);
  ok(res, 'Saved jobs loaded.', paginated(items, page, limit, total));
});

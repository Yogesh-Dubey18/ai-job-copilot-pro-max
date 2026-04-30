import { asyncHandler } from '../utils/asyncHandler';
import { getQueueStatus } from '../services/queue.service';

export const queueStatus = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: getQueueStatus() });
});

import Notification from '../models/Notification';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { getPagination, paginated } from '../utils/pagination';

export const listNotifications = asyncHandler(async (req: any, res) => {
  const { page, limit, skip } = getPagination(req);
  const [items, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ userId: req.user.id }),
    Notification.countDocuments({ userId: req.user.id, read: false })
  ]);

  res.json({
    success: true,
    data: {
      ...paginated(items, page, limit, total),
      unreadCount
    }
  });
});

export const markNotificationAsRead = asyncHandler(async (req: any, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found.', 404);
  res.json({ success: true, data: notification });
});

export const markAllNotificationsRead = asyncHandler(async (req: any, res) => {
  const result = await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
  res.json({ success: true, data: { modifiedCount: result.modifiedCount } });
});

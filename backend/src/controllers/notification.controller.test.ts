import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listNotifications, markAllNotificationsRead, markNotificationAsRead } from './notification.controller';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  countDocuments: vi.fn(),
  findOneAndUpdate: vi.fn(),
  updateMany: vi.fn()
}));

vi.mock('../models/Notification', () => ({
  default: {
    find: mocks.find,
    countDocuments: mocks.countDocuments,
    findOneAndUpdate: mocks.findOneAndUpdate,
    updateMany: mocks.updateMany
  }
}));

const req = (params = {}, user = { id: 'user1' }) => ({ params, user, query: {}, headers: {}, ip: '127.0.0.1' }) as any;
const res = () => {
  const response: any = {};
  response.status = vi.fn().mockReturnValue(response);
  response.json = vi.fn().mockReturnValue(response);
  return response;
};

const run = async (handler: any, request: any, response: any) => {
  const next = vi.fn();
  handler(request, response, next);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return next;
};

describe('notification controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists only the current user notifications with unread count', async () => {
    mocks.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ _id: 'n1', userId: 'user1', read: false }])
    });
    mocks.countDocuments.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    const response = res();
    const next = await run(listNotifications, req(), response);

    expect(next).not.toHaveBeenCalled();
    expect(mocks.find).toHaveBeenCalledWith({ userId: 'user1' });
    expect(response.json.mock.calls[0][0].data.unreadCount).toBe(1);
  });

  it('marks one owned notification read', async () => {
    mocks.findOneAndUpdate.mockResolvedValue({ _id: 'n1', userId: 'user1', read: true });
    const response = res();
    const next = await run(markNotificationAsRead, req({ id: 'n1' }), response);

    expect(next).not.toHaveBeenCalled();
    expect(mocks.findOneAndUpdate).toHaveBeenCalledWith({ _id: 'n1', userId: 'user1' }, { read: true }, { new: true });
  });

  it('marks all current user notifications read', async () => {
    mocks.updateMany.mockResolvedValue({ modifiedCount: 3 });
    const response = res();
    const next = await run(markAllNotificationsRead, req(), response);

    expect(next).not.toHaveBeenCalled();
    expect(mocks.updateMany).toHaveBeenCalledWith({ userId: 'user1', read: false }, { read: true });
    expect(response.json.mock.calls[0][0].data.modifiedCount).toBe(3);
  });
});

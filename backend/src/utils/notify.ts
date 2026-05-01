import mongoose from 'mongoose';
import Notification from '../models/Notification';

export async function createNotification(input: {
  userId: string | mongoose.Types.ObjectId;
  type: string;
  title: string;
  message?: string;
  link?: string;
  dueAt?: Date;
}) {
  return Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message || '',
    body: input.message || '',
    link: input.link || '',
    dueAt: input.dueAt
  });
}

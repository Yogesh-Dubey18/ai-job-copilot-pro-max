import EventLog from '../models/EventLog';

export const recordEvent = async (input: {
  level?: 'info' | 'warn' | 'error';
  type: string;
  message: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}) => {
  try {
    await EventLog.create(input);
  } catch (error) {
    console.error('Failed to record event:', error);
  }
};

import * as Sentry from '@sentry/node';
import { env } from '../config/env';

export const initObservability = () => {
  if (!env.SENTRY_DSN) return;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    }
  });
};

export const captureError = (error: unknown, requestId?: string) => {
  if (!env.SENTRY_DSN) return;
  Sentry.captureException(error, { tags: { requestId } });
};

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';
import apiRoutes from './routes/api.routes';
import { initObservability } from './services/observability.service';

const app = express();
initObservability();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(requestLogger);
app.use(express.json({ limit: '3mb' }));
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && origin !== env.FRONTEND_URL && !origin.startsWith('chrome-extension://')) {
    return res.status(403).json({ success: false, message: 'Blocked by CSRF origin policy.' });
  }
  return next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'AI Job Copilot API running',
    health: '/api/health'
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'System Operational'
  });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

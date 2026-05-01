import { Request } from 'express';
import AuditLog from '../models/AuditLog';

export async function auditLog(req: Request, action: string, entityType = '', entityId = '', metadata: Record<string, unknown> = {}) {
  const user = (req as any).user;
  await AuditLog.create({
    actorId: user?.id,
    userId: user?.id,
    action,
    entityType,
    entityId,
    entity: entityType,
    metadata,
    requestId: req.headers['x-request-id']?.toString() || '',
    ip: req.ip
  }).catch(() => undefined);
}

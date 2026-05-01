import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String, default: '' },
    entityId: { type: String, default: '' },
    entity: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    requestId: { type: String, default: '' },
    ip: { type: String, default: '' }
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);

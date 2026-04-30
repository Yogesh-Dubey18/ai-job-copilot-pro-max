import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entity: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    requestId: { type: String, default: '' }
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);

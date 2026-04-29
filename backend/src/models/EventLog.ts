import mongoose from 'mongoose';

const eventLogSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
    type: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    requestId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

eventLogSchema.index({ type: 1, createdAt: -1 });
eventLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('EventLog', eventLogSchema);

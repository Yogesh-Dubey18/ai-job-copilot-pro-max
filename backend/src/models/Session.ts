import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, expiresAt: 1 });

export default mongoose.model('Session', sessionSchema);

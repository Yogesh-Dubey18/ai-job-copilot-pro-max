import mongoose from 'mongoose';

const usageCounterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, required: true },
    count: { type: Number, default: 0 },
    period: { type: String, default: 'monthly' }
  },
  { timestamps: true }
);

usageCounterSchema.index({ userId: 1, key: 1, period: 1 }, { unique: true });

export default mongoose.model('UsageCounter', usageCounterSchema);

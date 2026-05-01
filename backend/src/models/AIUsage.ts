import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    feature: { type: String, required: true, trim: true },
    provider: { type: String, enum: ['gemini', 'openai', 'fallback'], default: 'fallback' },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    costEstimate: { type: Number, default: 0 },
    success: { type: Boolean, default: true },
    errorMessage: { type: String, default: '' }
  },
  { timestamps: true }
);

aiUsageSchema.index({ userId: 1, feature: 1, createdAt: -1 });

export default mongoose.model('AIUsage', aiUsageSchema);

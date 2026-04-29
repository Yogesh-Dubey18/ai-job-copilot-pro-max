import mongoose from 'mongoose';

const jobMatchSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    finalScore: { type: Number, default: 0 },
    applyPriority: { type: String, default: 'Tailor First' },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    explanation: { type: String, default: '' }
  },
  { timestamps: true }
);

jobMatchSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.model('JobMatch', jobMatchSchema);

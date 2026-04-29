import mongoose from 'mongoose';

const dailyDigestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    jobsFound: { type: Number, default: 0 },
    highMatchJobs: { type: Number, default: 0 },
    urgentJobs: [{ type: String }],
    missingSkills: [{ type: String }],
    mission: [{ type: String }]
  },
  { timestamps: true }
);

dailyDigestSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyDigest', dailyDigestSchema);

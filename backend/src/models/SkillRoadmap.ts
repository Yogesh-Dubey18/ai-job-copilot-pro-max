import mongoose from 'mongoose';

const skillRoadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, default: '' },
    missingSkills: [{ type: String }],
    weeklyPlan: [{ type: String }],
    readinessScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

skillRoadmapSchema.index({ userId: 1, targetRole: 1 });

export default mongoose.model('SkillRoadmap', skillRoadmapSchema);

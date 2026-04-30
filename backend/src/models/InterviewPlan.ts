import mongoose from 'mongoose';

const interviewPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    likelyRounds: [{ type: String }],
    technicalTopics: [{ type: String }],
    projectQuestions: [{ type: String }],
    hrQuestions: [{ type: String }],
    confidenceScore: { type: Number, default: 70 }
  },
  { timestamps: true }
);

export default mongoose.model('InterviewPlan', interviewPlanSchema);

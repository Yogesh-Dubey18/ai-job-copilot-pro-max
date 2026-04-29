import mongoose from 'mongoose';

const interviewPrepSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    possibleRounds: [{ type: String }],
    questions: [{ type: String }],
    roundClearPlan: [{ type: String }],
    confidenceScore: { type: Number, default: 70 }
  },
  { timestamps: true }
);

export default mongoose.model('InterviewPrep', interviewPrepSchema);

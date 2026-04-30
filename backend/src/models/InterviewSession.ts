import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    questions: [{ type: String }],
    feedback: { type: String, default: '' },
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('InterviewSession', interviewSessionSchema);

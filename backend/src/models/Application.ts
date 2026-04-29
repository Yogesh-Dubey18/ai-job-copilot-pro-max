import mongoose, { InferSchemaType } from 'mongoose';

export const applicationStatuses = [
  'saved',
  'resume_tailored',
  'applied',
  'recruiter_viewed',
  'shortlisted',
  'assessment',
  'interview_round_1',
  'interview_round_2',
  'hr_round',
  'offered',
  'rejected',
  'joined'
] as const;

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: applicationStatuses,
      required: true
    },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    source: { type: String, default: 'user' },
    nextAction: { type: String, default: '' }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    company: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: applicationStatuses,
      default: 'saved'
    },
    appliedDate: { type: Date },
    followUpDate: { type: Date },
    matchScore: { type: Number, min: 0, max: 100 },
    resumeVersionUsed: { type: String, default: '' },
    tailoredResume: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    recruiterEmail: { type: String, default: '' },
    missingSkills: [{ type: String, trim: true }],
    timeline: { type: [timelineSchema], default: [] }
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, status: 1 });

export type ApplicationDocument = InferSchemaType<typeof applicationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export default mongoose.model('Application', applicationSchema);

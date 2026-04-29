import mongoose, { InferSchemaType } from 'mongoose';

export const applicationStatuses = [
  'saved',
  'preparing',
  'manually_applied',
  'resume_tailored',
  'applied',
  'viewed',
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

const responseSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'company_reply' },
    companyMessage: { type: String, default: '' },
    intent: { type: String, default: '' },
    tone: { type: String, default: 'professional' },
    subject: { type: String, default: '' },
    shortReply: { type: String, default: '' },
    detailedReply: { type: String, default: '' },
    shortChannelReply: { type: String, default: '' },
    warnings: [{ type: String }]
  },
  { timestamps: true }
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
    portalSource: { type: String, default: '' },
    contactName: { type: String, default: '' },
    notes: { type: String, default: '' },
    matchScore: { type: Number, min: 0, max: 100 },
    resumeVersionUsed: { type: String, default: '' },
    coverLetterUsed: { type: String, default: '' },
    manualChecklist: {
      resumeTailored: { type: Boolean, default: false },
      coverLetterReady: { type: Boolean, default: false },
      portfolioReady: { type: Boolean, default: false },
      formSubmitted: { type: Boolean, default: false },
      confirmationSaved: { type: Boolean, default: false },
      followUpReminderSet: { type: Boolean, default: false }
    },
    tailoredResume: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    recruiterEmail: { type: String, default: '' },
    missingSkills: [{ type: String, trim: true }],
    timeline: { type: [timelineSchema], default: [] },
    responses: { type: [responseSchema], default: [] }
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, status: 1 });

export type ApplicationDocument = InferSchemaType<typeof applicationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export default mongoose.model('Application', applicationSchema);

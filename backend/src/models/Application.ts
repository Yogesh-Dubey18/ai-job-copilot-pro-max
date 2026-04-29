import mongoose, { InferSchemaType } from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'joined'],
      required: true
    },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now }
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
      enum: ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'joined'],
      default: 'saved'
    },
    appliedDate: { type: Date },
    followUpDate: { type: Date },
    matchScore: { type: Number, min: 0, max: 100 },
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

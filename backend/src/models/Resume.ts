import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    atsScore: { type: Number, default: 0 },
    keywords: [{ type: String }]
  },
  { timestamps: true }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Base Resume' },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: 'text/plain' },
    parsedText: { type: String, default: '' },
    manualText: { type: String, default: '' },
    extractionStatus: {
      type: String,
      enum: ['parsed', 'manual_text', 'needs_manual_text'],
      default: 'parsed'
    },
    detectedSkills: [{ type: String }],
    sections: {
      summary: { type: String, default: '' },
      skills: [{ type: String }],
      experience: { type: String, default: '' },
      education: { type: String, default: '' },
      projects: { type: String, default: '' }
    },
    atsScore: { type: Number, default: null },
    appliedCount: { type: Number, default: 0 },
    responseCount: { type: Number, default: 0 },
    interviewCount: { type: Number, default: 0 },
    offerCount: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: true },
    versions: { type: [resumeVersionSchema], default: [] }
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Resume', resumeSchema);

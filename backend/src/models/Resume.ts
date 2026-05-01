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
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    localPath: { type: String, default: '' },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: 'text/plain' },
    parsedText: { type: String, default: '' },
    extractedText: { type: String, default: '' },
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
    aiScore: { type: Number, default: null },
    aiSuggestions: {
      missingSkills: [{ type: String }],
      weakSections: [{ type: String }],
      atsTips: [{ type: String }],
      keywordImprovements: [{ type: String }],
      summaryImprovement: { type: String, default: '' },
      projectBulletImprovements: [{ type: String }]
    },
    scoreHistory: [
      {
        score: { type: Number, min: 0, max: 100, required: true },
        suggestions: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now },
        at: { type: Date, default: Date.now }
      }
    ],
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

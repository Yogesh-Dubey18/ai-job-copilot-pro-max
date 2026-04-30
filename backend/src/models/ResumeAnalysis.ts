import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    overallScore: { type: Number, default: 0 },
    keywordScore: { type: Number, default: 0 },
    formattingScore: { type: Number, default: 0 },
    chronologyScore: { type: Number, default: 0 },
    impactScore: { type: Number, default: 0 },
    contactInfoScore: { type: Number, default: 0 },
    missingKeywords: [{ type: String }],
    recommendations: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

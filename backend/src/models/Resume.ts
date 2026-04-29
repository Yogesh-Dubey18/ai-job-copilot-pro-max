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
    parsedText: { type: String, required: true },
    atsScore: { type: Number, default: 0 },
    versions: { type: [resumeVersionSchema], default: [] }
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Resume', resumeSchema);

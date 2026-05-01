import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    logo: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    industry: { type: String, default: '', trim: true },
    size: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    location: { type: String, default: '', trim: true },
    socialLinks: {
      linkedin: { type: String, default: '', trim: true },
      twitter: { type: String, default: '', trim: true },
      github: { type: String, default: '', trim: true }
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    trustScore: { type: Number, default: 70, min: 0, max: 100 },
    scamReports: { type: Number, default: 0 },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

companySchema.index({ name: 1 }, { unique: true });
companySchema.index({ slug: 1 }, { unique: true, sparse: true });

export default mongoose.model('Company', companySchema);

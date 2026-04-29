import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    website: { type: String, default: '', trim: true },
    industry: { type: String, default: '', trim: true },
    trustScore: { type: Number, default: 70, min: 0, max: 100 },
    scamReports: { type: Number, default: 0 },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

companySchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Company', companySchema);

import mongoose, { InferSchemaType } from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    source: { type: String, default: 'manual', trim: true },
    sourceJobId: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    remote: { type: Boolean, default: false },
    workplaceType: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'onsite' },
    employmentType: { type: String, enum: ['full_time', 'part_time', 'contract', 'internship'], default: 'full_time' },
    remoteType: { type: String, enum: ['remote', 'hybrid', 'onsite', 'unspecified'], default: 'unspecified' },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: 'INR', trim: true },
    url: { type: String, default: '', trim: true },
    applyUrl: { type: String, default: '', trim: true },
    description: { type: String, required: true },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    experienceLevel: { type: String, default: '', trim: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspicious'], default: 'approved', index: true },
    deadline: { type: Date },
    postedAt: { type: Date },
    expiresAt: { type: Date },
    sourceTrustScore: { type: Number, default: 75, min: 0, max: 100 },
    scamRiskScore: { type: Number, default: 10, min: 0, max: 100 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ source: 1, sourceJobId: 1 });
jobSchema.index({ employerId: 1, status: 1, createdAt: -1 });

export type JobDocument = InferSchemaType<typeof jobSchema> & { _id: mongoose.Types.ObjectId };

export default mongoose.model('Job', jobSchema);

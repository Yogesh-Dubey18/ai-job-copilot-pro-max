import mongoose, { InferSchemaType } from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    source: { type: String, default: 'manual', trim: true },
    sourceJobId: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    remote: { type: Boolean, default: false },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    url: { type: String, default: '', trim: true },
    description: { type: String, required: true },
    skills: [{ type: String, trim: true }],
    postedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ source: 1, sourceJobId: 1 });

export type JobDocument = InferSchemaType<typeof jobSchema> & { _id: mongoose.Types.ObjectId };

export default mongoose.model('Job', jobSchema);

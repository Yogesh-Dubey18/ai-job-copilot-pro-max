import mongoose from 'mongoose';

const applicationEventSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    type: { type: String, required: true },
    note: { type: String, default: '' },
    occurredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

applicationEventSchema.index({ applicationId: 1, occurredAt: -1 });

export default mongoose.model('ApplicationEvent', applicationEventSchema);

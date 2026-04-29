import mongoose from 'mongoose';

const companyReplySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    intent: { type: String, default: '' },
    tone: { type: String, default: 'professional' },
    incomingMessage: { type: String, default: '' },
    subject: { type: String, default: '' },
    replyBody: { type: String, default: '' },
    followUpNeeded: { type: Boolean, default: false },
    suggestedNextAction: { type: String, default: '' }
  },
  { timestamps: true }
);

companyReplySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('CompanyReply', companyReplySchema);

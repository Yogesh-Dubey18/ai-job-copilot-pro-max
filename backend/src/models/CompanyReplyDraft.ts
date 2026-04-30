import mongoose from 'mongoose';

const companyReplyDraftSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    subject: { type: String, default: '' },
    body: { type: String, default: '' },
    tone: { type: String, default: 'professional' },
    factsUsed: [{ type: String }],
    requiresUserInput: [{ type: String }],
    riskFlags: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model('CompanyReplyDraft', companyReplyDraftSchema);

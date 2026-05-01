import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    scheduledAt: { type: Date, required: true },
    mode: { type: String, enum: ['video', 'phone', 'onsite', 'other'], default: 'video' },
    meetingLink: { type: String, default: '', trim: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    body: { type: String, default: '' },
    type: { type: String, default: 'reminder' },
    link: { type: String, default: '' },
    dueAt: { type: Date },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, dueAt: 1 });

export default mongoose.model('Notification', notificationSchema);

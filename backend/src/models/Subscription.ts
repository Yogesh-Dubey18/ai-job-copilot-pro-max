import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
    status: { type: String, enum: ['active', 'past_due', 'cancelled'], default: 'active' },
    currentPeriodEnd: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);

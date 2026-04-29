import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    priceMonthly: { type: Number, default: 0 },
    features: [{ type: String }],
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

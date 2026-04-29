import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    targetRoles: [{ type: String }],
    locations: [{ type: String }],
    remotePreference: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: 'any' },
    salaryMin: { type: Number, default: 0 },
    aiUsageEnabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('UserPreference', userPreferenceSchema);

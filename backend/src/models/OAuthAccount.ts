import mongoose from 'mongoose';

const oauthAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, required: true },
    providerAccountId: { type: String, default: '' },
    accessTokenEncrypted: { type: String, default: '' },
    refreshTokenEncrypted: { type: String, default: '' },
    scope: { type: String, default: '' },
    connected: { type: Boolean, default: false },
    lastSyncAt: { type: Date }
  },
  { timestamps: true }
);

oauthAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });

export default mongoose.model('OAuthAccount', oauthAccountSchema);

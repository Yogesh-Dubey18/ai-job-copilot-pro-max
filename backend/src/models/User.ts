import mongoose, { InferSchemaType } from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetTokenHash: { type: String },
    passwordResetExpires: { type: Date },
    mfa: {
      enabled: { type: Boolean, default: false },
      secretHash: { type: String },
      recoveryCodes: [{ type: String }]
    },
    recoveryEmail: { type: String, lowercase: true, trim: true },
    profile: {
      skills: [{ type: String, trim: true }],
      experienceLevel: { type: String, default: '' },
      resumeBaseText: { type: String, default: '' },
      preferredRoles: [{ type: String, trim: true }],
      expectedSalary: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export default mongoose.model('User', userSchema);

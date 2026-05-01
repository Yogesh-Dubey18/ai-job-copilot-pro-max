import mongoose, { InferSchemaType } from 'mongoose';

export const userRoles = ['job_seeker', 'employer', 'admin', 'user'] as const;
export type UserRole = (typeof userRoles)[number];

export function normalizeUserRole(role?: string): Exclude<UserRole, 'user'> {
  if (role === 'employer') return 'employer';
  if (role === 'admin') return 'admin';
  return 'job_seeker';
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: userRoles,
      default: 'job_seeker'
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
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
      expectedSalary: { type: Number, default: 0 },
      phone: { type: String, default: '', trim: true },
      headline: { type: String, default: '', trim: true },
      location: { type: String, default: '', trim: true },
      experience: { type: String, default: '' },
      education: { type: String, default: '' },
      github: { type: String, default: '', trim: true },
      linkedin: { type: String, default: '', trim: true },
      portfolio: { type: String, default: '', trim: true },
      preferredJobType: { type: String, default: '', trim: true },
      remotePreference: { type: String, default: '', trim: true }
    }
  },
  { timestamps: true }
);

userSchema.pre('validate', function normalizeLegacyRole(next) {
  if (this.role === 'user') this.role = 'job_seeker';
  next();
});

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export default mongoose.model('User', userSchema);

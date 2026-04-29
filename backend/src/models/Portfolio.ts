import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    headline: { type: String, default: '' },
    summary: { type: String, default: '' },
    skills: [{ type: String }],
    projects: [
      {
        name: String,
        description: String,
        url: String
      }
    ],
    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Portfolio', portfolioSchema);

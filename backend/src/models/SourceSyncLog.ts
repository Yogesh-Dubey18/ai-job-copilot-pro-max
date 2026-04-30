import mongoose from 'mongoose';

const sourceSyncLogSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed', 'fallback'], default: 'fallback' },
    importedCount: { type: Number, default: 0 },
    duplicateCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    message: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('SourceSyncLog', sourceSyncLogSchema);

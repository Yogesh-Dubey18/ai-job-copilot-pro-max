import { connectDB } from '../config/db';
import User from '../models/User';
import { isPdfInternalText, isReadableResumeText, sanitizeResumeText } from '../utils/resumeText';

const ensureProfile = (user: any) => {
  user.profile ||= {
    skills: [],
    experienceLevel: '',
    resumeBaseText: '',
    preferredRoles: [],
    expectedSalary: 0
  };
  return user.profile;
};

const cleanupProfiles = async () => {
  await connectDB();
  const users = await User.find();
  let cleaned = 0;

  for (const user of users) {
    const text = String(user.profile?.resumeBaseText || '');
    const clean = sanitizeResumeText(text);
    if (text && (!clean || isPdfInternalText(text) || !isReadableResumeText(clean))) {
      ensureProfile(user).resumeBaseText = '';
      await user.save();
      cleaned += 1;
    } else if (clean && clean !== text) {
      ensureProfile(user).resumeBaseText = clean;
      await user.save();
      cleaned += 1;
    }
  }

  console.log(`Profile cleanup complete. Updated ${cleaned} profile(s).`);
  process.exit(0);
};

cleanupProfiles().catch((error) => {
  console.error('Profile cleanup failed:', error);
  process.exit(1);
});

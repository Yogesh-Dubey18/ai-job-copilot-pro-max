import { connectDB } from '../config/db';
import Resume from '../models/Resume';
import { isPdfInternalText, isReadableResumeText, sanitizeResumeText } from '../utils/resumeText';

const cleanupResumes = async () => {
  await connectDB();
  const resumes = await Resume.find();
  let cleaned = 0;

  for (const resume of resumes) {
    const text = String(resume.parsedText || '');
    const clean = sanitizeResumeText(text);
    if (!clean || isPdfInternalText(text) || !isReadableResumeText(clean)) {
      resume.parsedText = '';
      resume.manualText = '';
      resume.extractionStatus = 'needs_manual_text';
      resume.atsScore = null;
      resume.detectedSkills = [];
      resume.sections = { summary: '', skills: [], experience: '', education: '', projects: '' };
      await resume.save();
      cleaned += 1;
    } else if (clean !== text) {
      resume.parsedText = clean;
      await resume.save();
      cleaned += 1;
    }
  }

  console.log(`Resume cleanup complete. Updated ${cleaned} resume(s).`);
  process.exit(0);
};

cleanupResumes().catch((error) => {
  console.error('Resume cleanup failed:', error);
  process.exit(1);
});

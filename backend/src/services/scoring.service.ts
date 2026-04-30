import { sanitizeResumeText } from '../utils/resumeText';

const skillDictionary = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'MongoDB',
  'REST',
  'API',
  'Tailwind',
  'Testing',
  'Docker',
  'Git',
  'HTML',
  'CSS',
  'Python',
  'Java',
  'Spring Boot',
  'SQL',
  'MySQL',
  'PostgreSQL',
  'Redis',
  'AWS',
  'DSA',
  'GraphQL',
  'Kubernetes',
  'CI/CD',
  'Mongoose',
  'JWT'
];

export interface ScoreContext {
  targetRoles?: string[];
  experienceLevel?: string;
  preferredLocations?: string[];
  expectedSalary?: number;
  job?: {
    title?: string;
    company?: string;
    location?: string;
    remote?: boolean;
    remoteType?: string;
    salaryMin?: number;
    salaryMax?: number;
    sourceTrustScore?: number;
    scamRiskScore?: number;
    skills?: string[];
    source?: string;
    url?: string;
  };
}

const uniq = (values: string[]) =>
  values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, arr) => arr.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index);

const includesWord = (text: string, skill: string) =>
  new RegExp(`(^|[^a-z0-9])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(text);

export const extractSkills = (text: string, explicitSkills: string[] = []) => {
  const clean = sanitizeResumeText(text || '');
  return uniq([...explicitSkills, ...skillDictionary.filter((skill) => includesWord(clean, skill))]);
};

const scoreFromRatio = (matched: number, total: number, fallback = 0) =>
  total ? Math.round((matched / total) * 100) : fallback;

const hasAny = (text: string, terms: string[]) => terms.some((term) => new RegExp(term, 'i').test(text));

export const scoreJob = (profileText: string, resumeText: string, jobDescription: string, context: ScoreContext = {}) => {
  const safeProfile = sanitizeResumeText(profileText || '');
  const safeResume = sanitizeResumeText(resumeText || '');
  const safeJob = sanitizeResumeText(jobDescription || '');
  const combinedUserText = `${safeProfile} ${safeResume}`;
  const profileSkills = new Set(extractSkills(combinedUserText).map((skill) => skill.toLowerCase()));
  const explicitJobSkills = context.job?.skills || [];
  const jobSkills = extractSkills(`${context.job?.title || ''} ${safeJob}`, explicitJobSkills);
  const profileIncomplete = profileSkills.size === 0 && safeResume.length < 200 && safeProfile.length < 40;

  if (profileIncomplete) {
    return {
      profileIncomplete: true,
      finalScore: null,
      jobFitScore: null,
      atsMatchScore: null,
      skillMatchScore: null,
      experienceFitScore: null,
      locationFitScore: null,
      salaryFitScore: null,
      sourceTrustScore: context.job?.sourceTrustScore ?? 70,
      companyQualityScore: context.job?.sourceTrustScore ?? 70,
      scamRiskScore: context.job?.scamRiskScore ?? 10,
      matchedSkills: [],
      missingSkills: jobSkills,
      applyPriority: 'Profile incomplete',
      reasons: ['Upload your resume or add skills to calculate a real job score.'],
      nextActions: ['Upload resume', 'Set target role', 'Add your key skills'],
      aiRecommendation: 'Complete your profile first so scores use your real resume and skills.'
    };
  }

  const matchedSkills = jobSkills.filter((skill) => profileSkills.has(skill.toLowerCase()));
  const missingSkills = jobSkills.filter((skill) => !profileSkills.has(skill.toLowerCase()));
  const skillMatchScore = scoreFromRatio(matchedSkills.length, jobSkills.length, 60);
  const atsMatchScore = Math.min(100, Math.round(skillMatchScore * 0.75 + (safeJob.length > 500 ? 15 : 8) + (safeResume.length > 800 ? 10 : 0)));

  const titleAndDescription = `${context.job?.title || ''} ${safeJob}`;
  const targetRoleScore = context.targetRoles?.length
    ? context.targetRoles.some((role) => titleAndDescription.toLowerCase().includes(role.toLowerCase()))
      ? 95
      : 68
    : 75;

  const userIsFresher = hasAny(`${context.experienceLevel || ''} ${safeResume}`, ['fresher', 'intern', '0\\s*-\\s*1', 'entry']);
  const jobIsFresherFriendly = hasAny(titleAndDescription, ['fresher', 'intern', '0\\s*-\\s*1', '0 to 1', 'entry', 'junior']);
  const jobNeedsSenior = hasAny(titleAndDescription, ['senior', 'lead', '5\\+', '7\\+', 'architect']);
  const experienceFitScore = jobNeedsSenior && userIsFresher ? 45 : userIsFresher && jobIsFresherFriendly ? 92 : jobNeedsSenior ? 62 : 82;

  const locationText = `${context.job?.location || ''} ${context.job?.remoteType || ''} ${context.job?.remote ? 'remote' : ''}`;
  const preferredLocations = context.preferredLocations || [];
  const locationFitScore = /remote|hybrid/i.test(locationText)
    ? 90
    : preferredLocations.length
      ? preferredLocations.some((loc) => locationText.toLowerCase().includes(loc.toLowerCase()))
        ? 88
        : 58
      : 72;

  const expectedSalary = context.expectedSalary || 0;
  const salaryMax = context.job?.salaryMax || 0;
  const salaryMin = context.job?.salaryMin || 0;
  const salaryFitScore = expectedSalary && salaryMax
    ? salaryMax >= expectedSalary
      ? 88
      : Math.max(45, Math.round((salaryMax / expectedSalary) * 80))
    : salaryMin || salaryMax
      ? 72
      : 65;

  const scamSignals = [
    /gmail|yahoo|hotmail/i.test(`${safeJob} ${context.job?.url || ''}`),
    /fee|deposit|payment|registration charge/i.test(safeJob),
    /bit\.ly|tinyurl|telegram|whatsapp only|example\.com/i.test(`${safeJob} ${context.job?.url || ''}`),
    safeJob.length < 180
  ].filter(Boolean).length;
  const scamRiskScore = Math.min(100, Math.max(context.job?.scamRiskScore ?? 0, scamSignals * 25));
  const sourceTrustScore = Math.max(0, Math.min(100, (context.job?.sourceTrustScore ?? 75) - (scamSignals ? 10 : 0)));

  const jobFitScore = Math.round((skillMatchScore * 0.45) + (experienceFitScore * 0.25) + (targetRoleScore * 0.2) + (locationFitScore * 0.1));
  const finalScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        jobFitScore * 0.3 +
          atsMatchScore * 0.2 +
          skillMatchScore * 0.18 +
          experienceFitScore * 0.12 +
          locationFitScore * 0.07 +
          salaryFitScore * 0.05 +
          sourceTrustScore * 0.05 -
          scamRiskScore * 0.07
      )
    )
  );

  const applyPriority =
    scamRiskScore >= 70 ? 'Skip' : finalScore >= 85 ? 'Apply Now' : finalScore >= 70 ? 'Tailor First' : finalScore >= 50 ? 'Improve First' : 'Skip';

  const reasons = [
    matchedSkills.length ? `Matched skills: ${matchedSkills.slice(0, 6).join(', ')}.` : 'No strong skill overlap found yet.',
    missingSkills.length ? `Missing or unproven skills: ${missingSkills.slice(0, 6).join(', ')}.` : 'Core job skills are covered.',
    userIsFresher && jobIsFresherFriendly ? 'This role appears fresher or internship friendly.' : '',
    scamRiskScore >= 50 ? 'Verify this source carefully before sharing personal information.' : ''
  ].filter(Boolean);

  const nextActions =
    applyPriority === 'Apply Now'
      ? ['Tailor resume keywords', 'Generate Application Kit', 'Apply through the official link', 'Track follow-up date']
      : applyPriority === 'Tailor First'
        ? ['Tailor resume for missing keywords', 'Add project proof for strongest skills', 'Then apply manually and track it']
        : applyPriority === 'Improve First'
          ? ['Close top missing skills', 'Add a relevant project bullet', 'Re-score after improving the resume']
          : ['Skip for now', 'Prioritize safer and higher-fit jobs'];

  return {
    profileIncomplete: false,
    finalScore,
    jobFitScore,
    atsMatchScore,
    skillMatchScore,
    experienceFitScore,
    locationFitScore,
    salaryFitScore,
    sourceTrustScore,
    companyQualityScore: sourceTrustScore,
    scamRiskScore,
    matchedSkills,
    missingSkills,
    applyPriority,
    reasons,
    nextActions,
    aiRecommendation: nextActions[0]
  };
};

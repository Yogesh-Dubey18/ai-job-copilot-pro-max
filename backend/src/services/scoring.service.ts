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
  'CSS'
];

export const extractSkills = (text: string) =>
  skillDictionary.filter((skill) => new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(text));

export const scoreJob = (profileText: string, resumeText: string, jobDescription: string) => {
  const profileSkills = new Set(extractSkills(`${profileText} ${resumeText}`).map((skill) => skill.toLowerCase()));
  const jobSkills = extractSkills(jobDescription);
  const matchedSkills = jobSkills.filter((skill) => profileSkills.has(skill.toLowerCase()));
  const missingSkills = jobSkills.filter((skill) => !profileSkills.has(skill.toLowerCase()));
  const skillMatchScore = jobSkills.length ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 70;
  const atsMatchScore = Math.min(100, Math.max(35, skillMatchScore + 8));
  const experienceFitScore = /senior|lead|5\+|7\+/i.test(jobDescription) ? 55 : 82;
  const locationFitScore = /remote|hybrid/i.test(jobDescription) ? 90 : 70;
  const salaryFitScore = /unpaid|stipend/i.test(jobDescription) ? 45 : 75;
  const companyQualityScore = /payment|fee|deposit|whatsapp only/i.test(jobDescription) ? 35 : 80;
  const scamRiskScore = /payment|fee|deposit|registration charge|whatsapp only/i.test(jobDescription) ? 70 : 10;
  const jobFitScore = Math.round((skillMatchScore + experienceFitScore + locationFitScore) / 3);
  const finalScore = Math.round(
    jobFitScore * 0.3 +
      atsMatchScore * 0.25 +
      skillMatchScore * 0.15 +
      experienceFitScore * 0.1 +
      locationFitScore * 0.05 +
      salaryFitScore * 0.05 +
      companyQualityScore * 0.05 -
      scamRiskScore * 0.05
  );

  const applyPriority =
    finalScore >= 85 ? 'Apply Now' : finalScore >= 70 ? 'Tailor Resume First' : finalScore >= 50 ? 'Improve Skills First' : 'Skip';

  return {
    finalScore,
    jobFitScore,
    atsMatchScore,
    skillMatchScore,
    experienceFitScore,
    locationFitScore,
    salaryFitScore,
    companyQualityScore,
    scamRiskScore,
    matchedSkills,
    missingSkills,
    applyPriority,
    aiRecommendation:
      applyPriority === 'Apply Now'
        ? 'Apply today with a tailored resume and recruiter message.'
        : applyPriority === 'Tailor Resume First'
          ? 'Tailor your resume keywords before applying.'
          : applyPriority === 'Improve Skills First'
            ? 'Close the missing skill gaps before prioritizing this role.'
            : 'Skip this role for now and focus on better-fit jobs.'
  };
};

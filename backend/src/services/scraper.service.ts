export interface ScrapedJobPayload {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  source?: string;
}

export const normalizeScrapedJob = (payload: ScrapedJobPayload) => {
  const url = sanitizeOperationalUrl(payload.url || '');
  const text = `${payload.location || ''} ${payload.description || ''}`;
  const remoteType = /remote/i.test(text) ? 'remote' : /hybrid/i.test(text) ? 'hybrid' : /onsite|office/i.test(text) ? 'onsite' : 'unspecified';
  const scamRiskScore = /gmail|yahoo|hotmail|fee|deposit|payment|registration charge|whatsapp only|example\.com/i.test(`${payload.url || ''} ${payload.description || ''}`) ? 65 : 10;

  return {
    source: payload.source || 'chrome-extension',
    sourceJobId: url || undefined,
    title: payload.title?.trim() || 'Untitled Role',
    company: payload.company?.trim() || 'Unknown Company',
    location: payload.location?.trim() || '',
    remote: remoteType === 'remote',
    remoteType,
    url,
    applyUrl: url,
    description: payload.description?.trim() || 'No description captured from page.',
    skills: inferSkills(payload.description || ''),
    sourceTrustScore: url ? 82 : 70,
    scamRiskScore,
    postedAt: new Date()
  };
};

const sanitizeOperationalUrl = (url: string) => {
  if (!url || /(^https?:\/\/)?(www\.)?example\.com/i.test(url)) {
    return '';
  }

  return url;
};

const inferSkills = (description: string) => {
  const commonSkills = [
    'TypeScript',
    'JavaScript',
    'React',
    'Next.js',
    'Node.js',
    'Express',
    'MongoDB',
    'AWS',
    'Docker',
    'Kubernetes',
    'Python',
    'SQL',
    'GraphQL',
    'REST'
  ];

  return commonSkills.filter((skill) => new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(description));
};

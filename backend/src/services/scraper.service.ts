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

  return {
    source: payload.source || 'chrome-extension',
    sourceJobId: url || undefined,
    title: payload.title?.trim() || 'Untitled Role',
    company: payload.company?.trim() || 'Unknown Company',
    location: payload.location?.trim() || '',
    remote: /remote/i.test(`${payload.location || ''} ${payload.description || ''}`),
    url,
    description: payload.description?.trim() || 'No description captured from page.',
    skills: inferSkills(payload.description || '')
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

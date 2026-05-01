export const extractJson = (text: string) => {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    throw new Error('AI response did not contain a JSON object.');
  }

  return cleaned.slice(start, end + 1);
};

export const safeParseJson = <T>(text: string): T => JSON.parse(extractJson(text)) as T;

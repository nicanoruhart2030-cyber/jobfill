function normalizeToken(token: string) {
  return token
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-]/g, "");
}

export function extractKeywords(text: string): string[] {
  const words = text.split(/\s+/g).map(normalizeToken).filter(Boolean);
  return Array.from(new Set(words));
}

export function calculateMatchPercent(profileSkills: string[], jobText: string) {
  if (!profileSkills.length) return 0;
  const keywords = extractKeywords(jobText);
  const keywordSet = new Set(keywords);
  const matches = profileSkills.filter((skill) =>
    keywordSet.has(normalizeToken(skill)),
  ).length;
  return Math.min(99, Math.round((matches / profileSkills.length) * 100));
}

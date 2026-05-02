/** Extract 3–4 short bullet lines from a job description for card UI. */
export function jdBullets(description: string, max = 4): string[] {
  const raw = description.trim();
  if (!raw) return [];

  const byLine = raw
    .split(/\n+/)
    .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
    .filter((s) => s.length > 12 && s.length < 220);

  if (byLine.length >= max) return byLine.slice(0, max);

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 220);

  const merged = [...byLine];
  for (const s of sentences) {
    if (!merged.some((m) => m.includes(s.slice(0, 40)))) merged.push(s);
    if (merged.length >= max) break;
  }

  return merged.slice(0, max);
}

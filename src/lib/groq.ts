/**
 * Groq cover letter generator.
 *
 * Spec:
 *   Model:  llama-3.3-70b-versatile
 *   System: "Write a 3-paragraph cover letter. Professional tone. No clichés.
 *            Never say 'I am writing to apply'. Output letter text only, no headers."
 *   User:   includes applicant name, school, skills, links, full JD text
 *   Max tokens: 600
 *
 * Uses the user's per-profile groq_api_key when present; falls back to GROQ_API_KEY env.
 */

import Groq from 'groq-sdk';
import type { Profile } from '@/lib/types';

const SYSTEM_PROMPT =
  "Write a 3-paragraph cover letter. Professional tone. No clichés. " +
  "Never say 'I am writing to apply'. Output letter text only, no headers.";

const MAX_TOKENS = 600;
const MODEL = 'llama-3.3-70b-versatile' as const;

function buildUserPrompt(profile: Profile, jobDescription: string): string {
  const fullName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim();
  const skills = profile.skills.length ? profile.skills.join(', ') : 'N/A';
  const links = [
    profile.linkedin_url && `LinkedIn: ${profile.linkedin_url}`,
    profile.portfolio_url && `Portfolio: ${profile.portfolio_url}`,
    profile.github_url && `GitHub: ${profile.github_url}`,
  ].filter(Boolean).join(' · ') || 'N/A';

  return [
    `Applicant: ${fullName || 'Anonymous'}`,
    `School: ${profile.school ?? 'N/A'}`,
    `Skills: ${skills}`,
    `Links: ${links}`,
    '',
    'Job description:',
    jobDescription,
  ].join('\n');
}

export async function generateCoverLetter({
  profile,
  jobDescription,
  apiKey,
}: {
  profile: Profile;
  jobDescription: string;
  apiKey?: string | null;
}): Promise<string> {
  const effectiveKey = apiKey || profile.groq_api_key || process.env.GROQ_API_KEY;
  if (!effectiveKey) return '';
  if (!jobDescription.trim()) return '';

  const groq = new Groq({ apiKey: effectiveKey });
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(profile, jobDescription) },
    ],
    max_tokens: MAX_TOKENS,
    temperature: 0.5,
  });

  return completion.choices[0]?.message?.content?.trim() ?? '';
}

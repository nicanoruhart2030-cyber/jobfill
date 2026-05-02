/**
 * Kimi (Moonshot) cover letter generator via OpenAI-compatible API.
 *
 * Uses the user's per-profile kimi_api_key when present; falls back to MOONSHOT_API_KEY env.
 */

import OpenAI from "openai";
import type { Profile } from "@/lib/types";

export async function generateCoverLetter({
  profile,
  jobDescription,
  apiKey,
}: {
  profile: Profile;
  jobDescription: string;
  apiKey?: string | null;
}): Promise<string> {
  const effectiveKey =
    apiKey ?? profile.kimi_api_key ?? profile.groq_api_key ?? process.env.MOONSHOT_API_KEY;
  if (!effectiveKey) return "";
  if (!jobDescription.trim()) return "";

  const kimi = new OpenAI({
    apiKey: effectiveKey,
    baseURL: "https://api.moonshot.ai/v1",
  });

  const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
  const links = [profile.linkedin_url, profile.portfolio_url, profile.github_url].filter(Boolean).join(", ");

  try {
    const completion = await kimi.chat.completions.create({
      model: "kimi-k2.6",
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            `You are a cover letter writer. Write in a professional tone. ` +
            `Be specific, avoid clichés. Never say "I am writing to apply". ` +
            `Write exactly 3 paragraphs. Output ONLY the letter text — ` +
            `no subject line, no date, no address headers, no "Dear Hiring Manager".`,
        },
        {
          role: "user",
          content:
            `Write a cover letter for ${name || "the applicant"}.\n\n` +
            `Applicant background:\n` +
            `- School: ${profile.school || "not specified"}\n` +
            `- Degree: ${profile.degree || "not specified"}\n` +
            `- Skills: ${profile.skills?.length ? profile.skills.join(", ") : "not specified"}\n` +
            `- Links: ${links || "none"}\n\n` +
            `Job description:\n` +
            `"""\n` +
            `${jobDescription.slice(0, 3000)}\n` +
            `"""\n\n` +
            `3 paragraphs:\n` +
            `1. Hook — why this specific role at this specific company\n` +
            `2. Most relevant experience/skills matched to the JD\n` +
            `3. Confident close with enthusiasm`,
        },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() ?? "";
  } catch {
    return "";
  }
}

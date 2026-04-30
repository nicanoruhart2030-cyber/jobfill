import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Job, Profile, QueueResult } from "@/lib/types";
import {
  findBestField,
  frameworkSafeFill,
  frameworkSafeSelect,
  hasUnfilledRequiredFields,
  uploadResumeViaDataTransfer,
} from "@/workers/fieldDetection";
import {
  clickNextIfPresent,
  collectCandidateFrames,
  detectAts,
  extractJobDescription,
  hasCaptcha,
  submitApplication,
  waitForSubmissionConfirmation,
} from "@/workers/atsHandlers";
import { generateCoverLetter } from "@/lib/groq";
import { sendManualReviewEmail } from "@/lib/email/manualReview";

type ClaimedApplication = {
  id: string;
  user_id: string;
  job_id: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeStoragePath(resumeUrl: string | null) {
  if (!resumeUrl) return null;
  if (!resumeUrl.includes("/resumes/")) return resumeUrl;
  return resumeUrl.split("/resumes/")[1] ?? null;
}

async function downloadResumeToTemp(profile: Profile): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const storagePath = normalizeStoragePath(profile.resume_url);
  if (!storagePath) return null;

  const { data, error } = await supabaseAdmin.storage.from("resumes").download(storagePath);
  if (error || !data) return null;

  const bytes = Buffer.from(await data.arrayBuffer());
  const target = path.join(os.tmpdir(), `jobfill-${profile.user_id}-resume.pdf`);
  await fs.writeFile(target, bytes);
  return target;
}

async function loadClaimedApplication(): Promise<ClaimedApplication | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.rpc("claim_next_application");
  if (error) {
    return null;
  }
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    job_id: row.job_id,
  };
}

async function loadContext(claimed: ClaimedApplication): Promise<{ profile: Profile; job: Job } | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const [profileResult, jobResult] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").eq("user_id", claimed.user_id).single(),
    supabaseAdmin.from("jobs").select("*").eq("id", claimed.job_id).single(),
  ]);

  if (profileResult.error || jobResult.error || !profileResult.data || !jobResult.data) {
    await supabaseAdmin
      .from("applications")
      .update({ status: "failed", notes: "Missing profile or job context." })
      .eq("id", claimed.id);
    return null;
  }

  return { profile: profileResult.data as Profile, job: jobResult.data as Job };
}

async function setApplicationStatus(
  id: string,
  patch: Partial<{
    status: string;
    notes: string;
    fields_filled: number;
    cover_letter_used: string | null;
    screenshot_url: string | null;
    applied_at: string | null;
  }>,
) {
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.from("applications").update(patch).eq("id", id);
}

async function notifyManualReview(profile: Profile, applicationId: string, reason: string) {
  try {
    await sendManualReviewEmail({
      to: profile.email,
      firstName: profile.first_name,
      applicationId,
      reason,
    });
  } catch {
    /* Resend optional — queue status is still updated */
  }
}

async function fillFrameFields({
  frame,
  profile,
  coverLetter,
  resumePath,
}: {
  frame: Awaited<ReturnType<typeof collectCandidateFrames>>[number];
  profile: Profile;
  coverLetter: string;
  resumePath: string | null;
}) {
  let fieldsFilledCount = 0;

  const fillConfig: Array<{ intent: Parameters<typeof findBestField>[1]; value?: string | null }> = [
    { intent: "first_name", value: profile.first_name },
    { intent: "last_name", value: profile.last_name },
    { intent: "full_name", value: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() },
    { intent: "email", value: profile.email },
    { intent: "phone", value: profile.phone },
    { intent: "city", value: profile.city },
    { intent: "province", value: profile.province },
    { intent: "country", value: profile.country },
    { intent: "work_auth", value: profile.work_auth },
    { intent: "school", value: profile.school },
    { intent: "degree", value: profile.degree },
    { intent: "major", value: profile.major },
    { intent: "grad_year", value: profile.grad_year?.toString() ?? "" },
    { intent: "cover_letter", value: coverLetter },
  ];

  for (const config of fillConfig) {
    if (!config.value?.trim()) continue;
    const field = await findBestField(frame, config.intent, 50);
    if (!field) continue;
    try {
      if (field.tagName === "select") {
        await frameworkSafeSelect(frame, field.selector, config.value);
      } else {
        await frameworkSafeFill(frame, field.selector, config.value);
      }
      fieldsFilledCount += 1;
    } catch {
      // Continue, we skip fields we can't safely set.
    }
  }

  if (resumePath) {
    const fileField = await findBestField(frame, "resume", 50);
    if (fileField) {
      try {
        await uploadResumeViaDataTransfer(frame, fileField.selector, resumePath);
        fieldsFilledCount += 1;
      } catch {
        // Keep going and let required-field guard decide.
      }
    } else {
      const fallbackFileInput = frame.locator("input[type='file']").first();
      if ((await fallbackFileInput.count()) > 0) {
        const selector =
          (await fallbackFileInput.getAttribute("id"))
            ? `#${await fallbackFileInput.getAttribute("id")}`
            : "input[type='file']";
        await uploadResumeViaDataTransfer(frame, selector, resumePath).catch(() => undefined);
        fieldsFilledCount += 1;
      }
    }
  }

  return fieldsFilledCount;
}

async function runSingleApplication(claimed: ClaimedApplication): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const context = await loadContext(claimed);
  if (!context) return;

  const { profile, job } = context;
  const browser = await chromium.launch({ headless: true });
  let screenshotBase64 = "";
  let fieldsFilledCount = 0;

  try {
    const atsType = detectAts(job.ats_url);
    const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
    await page.goto(job.ats_url, { waitUntil: "domcontentloaded", timeout: 45_000 });

    if (await hasCaptcha(page)) {
      await setApplicationStatus(claimed.id, {
        status: "needs_manual_review",
        notes: "CAPTCHA detected before filling.",
      });
      await notifyManualReview(profile, claimed.id, "CAPTCHA detected before filling.");
      return;
    }

    const [resumePath, jobDescription] = await Promise.all([
      downloadResumeToTemp(profile),
      extractJobDescription(page),
    ]);

    const coverLetter = await generateCoverLetter({
      profile,
      jobDescription,
    });

    const frames = await collectCandidateFrames(page);
    for (const frame of frames) {
      fieldsFilledCount += await fillFrameFields({
        frame,
        profile,
        coverLetter,
        resumePath,
      });
    }

    for (const frame of frames) {
      let clickedNext = await clickNextIfPresent(frame);
      let safetyCounter = 0;
      while (clickedNext && safetyCounter < 4) {
        await sleep(1500);
        clickedNext = await clickNextIfPresent(frame);
        safetyCounter += 1;
      }
    }

    if (await hasCaptcha(page)) {
      await setApplicationStatus(claimed.id, {
        status: "needs_manual_review",
        notes: "CAPTCHA detected after filling.",
        fields_filled: fieldsFilledCount,
        cover_letter_used: coverLetter || null,
      });
      await notifyManualReview(profile, claimed.id, "CAPTCHA detected after filling.");
      return;
    }

    let missingRequired = false;
    for (const frame of frames) {
      if (await hasUnfilledRequiredFields(frame)) {
        missingRequired = true;
        break;
      }
    }

    if (missingRequired) {
      await setApplicationStatus(claimed.id, {
        status: "failed",
        notes: "Required fields missing after confidence-scored fill.",
        fields_filled: fieldsFilledCount,
        cover_letter_used: coverLetter || null,
      });
      return;
    }

    let submitted = false;
    for (const frame of frames) {
      submitted = await submitApplication(frame);
      if (submitted) break;
    }

    if (!submitted) {
      await setApplicationStatus(claimed.id, {
        status: "failed",
        notes: `Submit button not found (${atsType}).`,
        fields_filled: fieldsFilledCount,
        cover_letter_used: coverLetter || null,
      });
      return;
    }

    await sleep(2000);
    const confirmed = await waitForSubmissionConfirmation(page);
    const screenshot = await page.screenshot({ fullPage: true, type: "png" });
    screenshotBase64 = screenshot.toString("base64");

    const storagePath = `screenshots/${claimed.user_id}/${claimed.id}.png`;
    const upload = await supabaseAdmin.storage
      .from("application-proofs")
      .upload(storagePath, screenshot, {
        contentType: "image/png",
        upsert: true,
      });

    const result: QueueResult = {
      success: confirmed,
      fieldsFilled: fieldsFilledCount,
      fieldsSkipped: 0,
      screenshotBase64,
    };

    await setApplicationStatus(claimed.id, {
      status: result.success ? "applied" : "failed",
      notes: result.success ? `Application submitted on ${atsType}.` : "Submission confirmation not detected.",
      fields_filled: result.fieldsFilled,
      cover_letter_used: coverLetter || null,
      screenshot_url: upload.error ? null : storagePath,
      applied_at: result.success ? new Date().toISOString() : null,
    });
  } catch (error) {
    await setApplicationStatus(claimed.id, {
      status: "failed",
      notes: error instanceof Error ? error.message : "Unknown worker failure",
      fields_filled: fieldsFilledCount,
    });
  } finally {
    await browser.close();
  }
}

export async function processNextQueuedApplication(): Promise<boolean> {
  const claimed = await loadClaimedApplication();
  if (!claimed) return false;
  await runSingleApplication(claimed);
  return true;
}

export async function runWorkerLoop(): Promise<void> {
  const runOnce = process.env.WORKER_ONCE === "true";

  while (true) {
    const claimed = await loadClaimedApplication();
    if (!claimed) {
      if (runOnce) break;
      await sleep(2500);
      continue;
    }
    await runSingleApplication(claimed);
    if (runOnce) break;
  }
}

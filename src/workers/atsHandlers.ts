import type { Frame, Page } from "playwright";

export type AtsType = "greenhouse" | "lever" | "workday" | "linkedin" | "generic";

export function detectAts(url: string): AtsType {
  const lower = url.toLowerCase();
  if (lower.includes("boards.greenhouse.io")) return "greenhouse";
  if (lower.includes("jobs.lever.co")) return "lever";
  if (lower.includes("myworkdayjobs.com")) return "workday";
  if (lower.includes("linkedin.com/jobs")) return "linkedin";
  return "generic";
}

export async function collectCandidateFrames(page: Page): Promise<Frame[]> {
  const frames = page.frames();
  const candidates: Frame[] = [];
  for (const frame of frames) {
    try {
      const hasForm = await frame
        .locator("form, input, textarea, select, [role='form']")
        .first()
        .isVisible({ timeout: 200 });
      if (hasForm) candidates.push(frame);
    } catch {
      // Ignore inaccessible cross-origin or detached frames.
    }
  }
  return candidates.length ? candidates : [page.mainFrame()];
}

export async function hasCaptcha(page: Page): Promise<boolean> {
  const indicators = [
    "iframe[src*='recaptcha']",
    "[id*='captcha']",
    "[class*='captcha']",
    "iframe[src*='hcaptcha']",
    ".g-recaptcha",
  ];
  for (const selector of indicators) {
    if (await page.locator(selector).first().isVisible().catch(() => false)) {
      return true;
    }
  }
  return false;
}

export async function clickNextIfPresent(frame: Frame): Promise<boolean> {
  const candidates = frame.getByRole("button", {
    name: /next|continue|review|proceed/i,
  });
  const count = await candidates.count();
  if (!count) return false;

  for (let i = 0; i < count; i += 1) {
    const candidate = candidates.nth(i);
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.click({ timeout: 1000 }).catch(() => undefined);
      return true;
    }
  }
  return false;
}

export async function submitApplication(frame: Frame): Promise<boolean> {
  const submitButton = frame.getByRole("button", {
    name: /submit|apply|send application/i,
  });
  const count = await submitButton.count();
  if (!count) return false;

  for (let i = 0; i < count; i += 1) {
    const button = submitButton.nth(i);
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 1200 }).catch(() => undefined);
      return true;
    }
  }
  return false;
}

export async function waitForSubmissionConfirmation(page: Page): Promise<boolean> {
  const successSelectors = [
    "text=/thank you/i",
    "text=/application submitted/i",
    "text=/received your application/i",
    "[data-testid*='success']",
  ];

  const previousUrl = page.url();
  try {
    await page.waitForURL((url) => url.toString() !== previousUrl, { timeout: 10_000 });
    return true;
  } catch {
    for (const selector of successSelectors) {
      const found = await page.locator(selector).first().isVisible().catch(() => false);
      if (found) return true;
    }
    return false;
  }
}

export async function extractJobDescription(page: Page): Promise<string> {
  const candidates = [
    "[data-qa='job-description']",
    ".job-description",
    ".description",
    "#job-description",
    "article",
    "main",
    "body",
  ];
  for (const selector of candidates) {
    const text = await page
      .locator(selector)
      .first()
      .textContent()
      .catch(() => null);
    if (text && text.trim().length > 200) {
      return text.trim();
    }
  }
  return (await page.textContent("body"))?.trim() ?? "";
}

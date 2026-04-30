import { Resend } from "resend";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendWaitlistConfirmation(to: string): Promise<{ ok: boolean; error?: string }> {
  const r = client();
  if (!r) return { ok: false, error: "Email not configured" };

  const from = process.env.RESEND_FROM_WAITLIST ?? "JobFill <hello@jobfill.co>";
  const { error } = await r.emails.send({
    from,
    to,
    subject: "You're on the list.",
    text:
      "Hey,\n\n" +
      "You're on the JobFill waitlist.\n\n" +
      "We'll email you the moment early access opens.\n" +
      "No spam. Just one email when it's ready.\n\n" +
      "— The JobFill team",
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendApplicationSubmitted(
  to: string,
  jobTitle: string,
  company: string,
  appliedDate: string,
): Promise<{ ok: boolean; error?: string }> {
  const r = client();
  if (!r) return { ok: false, error: "Email not configured" };
  const from = process.env.RESEND_FROM_UPDATES ?? "JobFill <updates@jobfill.co>";
  const { error } = await r.emails.send({
    from,
    to,
    subject: `Applied to ${jobTitle} at ${company}`,
    text:
      "Your application was submitted.\n\n" +
      `Role: ${jobTitle}\n` +
      `Company: ${company}\n` +
      `Applied: ${appliedDate}\n\n` +
      "We'll update you when there's a response.\n\n" +
      "— JobFill",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendApplicationAccepted(
  to: string,
  role: string,
  company: string,
): Promise<{ ok: boolean; error?: string }> {
  const r = client();
  if (!r) return { ok: false, error: "Email not configured" };
  const from = process.env.RESEND_FROM_UPDATES ?? "JobFill <updates@jobfill.co>";
  const { error } = await r.emails.send({
    from,
    to,
    subject: `Good news — ${company} wants to talk`,
    text:
      `Your application to ${role} at ${company} was accepted.\n` +
      "Log in to see details: jobfill.co/results\n",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendApplicationRejected(
  to: string,
  role: string,
  company: string,
): Promise<{ ok: boolean; error?: string }> {
  const r = client();
  if (!r) return { ok: false, error: "Email not configured" };
  const from = process.env.RESEND_FROM_UPDATES ?? "JobFill <updates@jobfill.co>";
  const { error } = await r.emails.send({
    from,
    to,
    subject: `Update from ${company}`,
    text:
      `Your application to ${role} at ${company} wasn't selected this time. ` +
      "Keep swiping — the right one is out there.\n" +
      "jobfill.co/swipe\n",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

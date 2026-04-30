type ManualReviewParams = {
  to: string | null | undefined;
  firstName: string | null | undefined;
  applicationId: string;
  reason: string;
};

export async function sendManualReviewEmail(params: ManualReviewParams): Promise<void> {
  const to = params.to?.trim();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!to || !apiKey || !from) return;

  const name = params.firstName?.trim();
  const greeting = name ? `Hi ${name}` : 'Hi';

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to,
    subject: 'JobFill — action needed on an application',
    text: [
      `${greeting},`,
      '',
      'An application needs your attention (for example a CAPTCHA or manual step).',
      '',
      `Application ID: ${params.applicationId}`,
      `Details: ${params.reason}`,
      '',
      'Open your dashboard to review and finish the application when you can.',
      '',
      '— JobFill',
    ].join('\n'),
  });
}

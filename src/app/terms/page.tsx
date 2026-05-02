import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and conditions — JobFill',
};

export default function TermsPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-4 py-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-[640px]">
        <Link href="/" className="text-[13px] text-[var(--text-secondary)] transition-opacity hover:opacity-80">
          Back home
        </Link>
        <h1 className="mt-8 text-[24px] font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Terms and conditions
        </h1>
        <article
          className="mt-6 space-y-4 text-[14px] leading-relaxed text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <p>
            By using JobFill, you agree to these terms. JobFill helps you organize job applications and may automate parts
            of the application process where supported. You are solely responsible for the accuracy of the information you
            submit and for complying with each employer&apos;s instructions, site terms, and applicable laws.
          </p>
          <p>
            Features depend on third-party sites and may change without notice. Do not use JobFill to misrepresent your
            identity, submit false information, circumvent reasonable rate limits, or bypass security measures (including
            CAPTCHAs) where doing so is prohibited.
          </p>
          <p>
            The service is provided &quot;as is&quot; without warranties. To the maximum extent permitted by law, JobFill
            is not liable indirect damages or losses arising from your use of the product.
          </p>
          <p className="text-[13px] text-[var(--text-3)]">
            Replace this page with counsel-approved terms before production marketing.
          </p>
        </article>
      </div>
    </main>
  );
}

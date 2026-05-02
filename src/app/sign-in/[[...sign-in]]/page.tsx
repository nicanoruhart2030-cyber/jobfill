import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign in — JobFill',
};

export default function SignInPage() {
  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--bg)] px-4 py-12"
    >
      <Link
        href="/"
        className="mb-8 text-[14px] font-extrabold tracking-tight text-[var(--text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden />
        JobFill
      </Link>
      <SignIn
        forceRedirectUrl="/swipe"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-[var(--surface)] border border-[var(--border)] shadow-none',
            headerTitle: 'text-[var(--text-primary)]',
            headerSubtitle: 'text-[var(--text-secondary)]',
            socialButtonsBlockButton: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)]',
            formFieldInput: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]',
            footerActionLink: 'text-[var(--accent)]',
            formButtonPrimary: 'bg-[var(--accent)] text-[var(--bg)] hover:opacity-90',
          },
        }}
      />
    </main>
  );
}

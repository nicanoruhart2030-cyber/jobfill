import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect('/swipe');
  } catch {
    /* env not configured — render the form */
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to keep your queue running."
      footer={
        <>
          <Link href="/" style={{ color: 'var(--text-2)', fontSize: 13 }}>
            About JobFill
          </Link>
          <span style={{ color: 'var(--text-3)', margin: '0 8px' }}>·</span>
          No account?{' '}
          <Link
            href="/signup"
            style={{ color: 'var(--accent)', fontWeight: 500 }}
          >
            Sign up
          </Link>
        </>
      }
    >
      <AuthForm mode="signin" />
    </AuthLayout>
  );
}

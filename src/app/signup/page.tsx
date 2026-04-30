import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SignupPage() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect('/onboarding');
  } catch {
    /* env not configured — render the form */
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever for 10 applications a month."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--accent)', fontWeight: 500 }}
          >
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}

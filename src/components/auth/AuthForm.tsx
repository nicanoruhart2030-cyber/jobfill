'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleIcon } from '@/components/ui/Icons';

type AuthFormProps = {
  mode: 'signin' | 'signup';
};

const POST_AUTH_REDIRECT = '/onboarding';

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [info, setInfo]       = useState<string | null>(null);

  async function handleEmailAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (err) { setError(err.message); return; }
      if (data.session) {
        router.push(POST_AUTH_REDIRECT);
        router.refresh();
        return;
      }
      setInfo('Check your email for a confirmation link.');
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push('/swipe');
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    setOauthLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}${mode === 'signup' ? POST_AUTH_REDIRECT : '/swipe'}`
            : undefined,
      },
    });
    if (err) {
      setOauthLoading(false);
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Button
        type="button"
        variant="secondary"
        loading={oauthLoading}
        onClick={handleGoogle}
        className="w-full"
        style={{ height: 44 }}
      >
        {!oauthLoading && <GoogleIcon size={16} />}
        Continue with Google
      </Button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: 'var(--text-3)',
          fontFamily: 'Inter',
          fontSize: 12,
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        or continue with email
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={error ?? undefined}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={mode === 'signup' ? 8 : undefined}
          value={password}
          onChange={(e) => setPass(e.target.value)}
          placeholder="••••••••"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          hint={mode === 'signup' ? 'At least 8 characters' : undefined}
        />

        {info && (
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: 'var(--accent)',
            }}
          >
            {info}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
          style={{ height: 44, marginTop: 4 }}
        >
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>
    </div>
  );
}

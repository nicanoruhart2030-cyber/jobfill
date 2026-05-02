'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerkSupabase } from '@/lib/supabase/clerk-browser';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { CheckIcon, UploadIcon, TrashIcon } from '@/components/ui/Icons';
import { PRO_MONTHLY_PRICE_CENTS } from '@/lib/billing';

export const dynamic = 'force-dynamic';

type SectionId = 'profile' | 'resume' | 'api-keys' | 'billing' | 'danger';

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'profile',  label: 'Profile' },
  { id: 'resume',   label: 'Resume' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'billing',  label: 'Billing' },
  { id: 'danger',   label: 'Danger zone' },
];

type ProfileForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  linkedin_url: string;
  portfolio_url: string;
  github_url: string;
  work_auth: string;
  school: string;
  degree: string;
  major: string;
  grad_year: string;
  salary_expectation: string;
};

const EMPTY_PROFILE: ProfileForm = {
  first_name: '', last_name: '', email: '', phone: '',
  city: '', province: '', country: 'Canada', postal_code: '',
  linkedin_url: '', portfolio_url: '', github_url: '',
  work_auth: 'Authorized',
  school: '', degree: '', major: '', grad_year: '',
  salary_expectation: '',
};

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signOut } = useClerk();
  const { user, isLoaded: userLoaded } = useUser();
  const supabase = useClerkSupabase();

  const [section, setSection]   = useState<SectionId>('profile');
  const [loaded, setLoaded]     = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  const [profile, setProfile]   = useState<ProfileForm>(EMPTY_PROFILE);
  const [kimiKey, setKimiKey]   = useState('');
  const [showKey, setShowKey]   = useState(false);
  const [plan, setPlan]         = useState<'free' | 'pro'>('free');

  const [resumeName, setResumeName]   = useState<string | null>(null);
  const [resumeSize, setResumeSize]   = useState<number | null>(null);
  const [resumeUpdatedAt, setResumeAt] = useState<string | null>(null);
  const [resumeFile, setResumeFile]   = useState<File | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingResume, setSavingResume]   = useState(false);
  const [savingKey, setSavingKey]         = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting]           = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userLoaded) return;
    if (!user) {
      router.replace('/sign-in');
      return;
    }

    void (async () => {
      const sb = supabase;
      if (!sb) return;

      let { data } = await sb
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (!data) {
        await fetch('/api/profile/ensure', { method: 'POST' });
        ({ data } = await sb
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', user.id)
          .maybeSingle());
      }

      if (data?.user_id) setProfileUserId(data.user_id);

      if (data) {
        const row = data as { kimi_api_key?: string | null; groq_api_key?: string | null };
        const email =
          data.email ??
          user.primaryEmailAddress?.emailAddress ??
          user.emailAddresses[0]?.emailAddress ??
          '';
        setProfile({
          ...EMPTY_PROFILE,
          ...data,
          email,
          country: data.country ?? 'Canada',
          grad_year: data.grad_year?.toString() ?? '',
        });
        if (row.kimi_api_key) setKimiKey(row.kimi_api_key);
        else if (row.groq_api_key) setKimiKey(row.groq_api_key);
        if (data.plan === 'pro') setPlan('pro');
        if (data.resume_url) {
          const fileName = data.resume_url.split('/').pop() ?? 'resume.pdf';
          setResumeName(fileName);
          setResumeAt(data.resume_url.match(/\/(\d+)-/)?.[1]
            ? new Date(Number(data.resume_url.match(/\/(\d+)-/)![1])).toISOString()
            : null
          );
        }
      }
      setLoaded(true);
    })();
  }, [router, supabase, user, userLoaded]);

  /* ── Updaters ── */
  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  /* ── Save profile ── */
  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !user) {
      router.replace('/sign-in');
      return;
    }
    let internalId = profileUserId;
    if (!internalId) {
      await fetch('/api/profile/ensure', { method: 'POST' });
      const { data: row } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('clerk_user_id', user.id)
        .maybeSingle();
      internalId = row?.user_id ?? null;
    }
    if (!internalId) {
      toast('Profile not ready', 'error');
      return;
    }
    setSavingProfile(true);

    const { error } = await supabase.from('profiles').update({
      ...profile,
      grad_year: profile.grad_year ? Number(profile.grad_year) : null,
    }).eq('user_id', internalId);

    setSavingProfile(false);
    if (error) toast(error.message, 'error');
    else toast('Profile saved', 'success');
  }

  /* ── Save resume ── */
  async function saveResume(e: FormEvent) {
    e.preventDefault();
    if (!resumeFile || !supabase || !user) return;
    let internalId = profileUserId;
    if (!internalId) {
      await fetch('/api/profile/ensure', { method: 'POST' });
      const { data: row } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('clerk_user_id', user.id)
        .maybeSingle();
      internalId = row?.user_id ?? null;
    }
    if (!internalId) {
      toast('Profile not ready', 'error');
      return;
    }
    setSavingResume(true);

    const path = `${internalId}/${Date.now()}-${resumeFile.name}`;
    const { error: uploadErr } = await supabase.storage
      .from('resumes')
      .upload(path, resumeFile, { contentType: 'application/pdf', upsert: true });
    if (uploadErr) {
      setSavingResume(false);
      toast(uploadErr.message, 'error');
      return;
    }
    const { error: profileErr } = await supabase.from('profiles')
      .update({ resume_url: path })
      .eq('user_id', internalId);

    setSavingResume(false);
    if (profileErr) {
      toast(profileErr.message, 'error');
      return;
    }
    setResumeName(resumeFile.name);
    setResumeSize(resumeFile.size);
    setResumeAt(new Date().toISOString());
    setResumeFile(null);
    toast('Resume replaced', 'success');
  }

  /* ── Save Kimi key ── */
  async function saveKey(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !user) {
      router.replace('/sign-in');
      return;
    }
    let internalId = profileUserId;
    if (!internalId) {
      await fetch('/api/profile/ensure', { method: 'POST' });
      const { data: row } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('clerk_user_id', user.id)
        .maybeSingle();
      internalId = row?.user_id ?? null;
    }
    if (!internalId) {
      toast('Profile not ready', 'error');
      return;
    }
    setSavingKey(true);
    const { error } = await supabase.from('profiles')
      .update({ kimi_api_key: kimiKey || null })
      .eq('user_id', internalId);
    setSavingKey(false);
    if (error) toast(error.message, 'error');
    else toast('API key saved', 'success');
  }

  /* ── Checkout ── */
  async function startCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        toast(json.error ?? 'Checkout failed', 'error');
        return;
      }
      window.location.href = json.url;
    } finally {
      setCheckoutLoading(false);
    }
  }

  /* ── Delete account ── */
  async function deleteAccount() {
    if (deleteConfirm !== 'DELETE') return;
    if (!supabase || !user) return;
    setDeleting(true);
    let internalId = profileUserId;
    if (!internalId) {
      const { data: row } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('clerk_user_id', user.id)
        .maybeSingle();
      internalId = row?.user_id ?? null;
    }
    if (!internalId) {
      setDeleting(false);
      return;
    }
    await supabase.from('profiles').delete().eq('user_id', internalId);
    await signOut();
    setDeleting(false);
    router.push('/');
  }

  if (!loaded) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg-base)',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            border: '1.5px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </main>
    );
  }

  return (
    <main
      className="page-enter"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '32px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <Link
            href="/swipe"
            style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: 'var(--text-3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Back to swiping
          </Link>
          <h1 className="text-h1" style={{ color: 'var(--text-1)', marginTop: 8 }}>
            Settings
          </h1>
        </div>

        <div
          className="settings-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 200px) minmax(0, 1fr)',
            gap: 32,
            alignItems: 'flex-start',
          }}
        >
          {/* Sidebar */}
          <nav>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                position: 'sticky',
                top: 24,
              }}
            >
              {SECTIONS.map((s) => {
                const active = section === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSection(s.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontFamily: 'Inter',
                        fontSize: 13,
                        fontWeight: active ? 500 : 400,
                        color: active ? 'var(--text-1)' : 'var(--text-2)',
                        background: active ? 'var(--bg-elevated)' : 'transparent',
                        border: '0.5px solid',
                        borderColor: active ? 'var(--border)' : 'transparent',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {section === 'profile' && (
              <Panel title="Profile" subtitle="Used to auto-fill ATS forms.">
                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Grid cols={2}>
                    <Input label="First name" value={profile.first_name} onChange={(e) => update('first_name', e.target.value)} required />
                    <Input label="Last name"  value={profile.last_name}  onChange={(e) => update('last_name',  e.target.value)} required />
                  </Grid>
                  <Grid cols={2}>
                    <Input label="Email" type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} required />
                    <Input label="Phone" type="tel"   value={profile.phone} onChange={(e) => update('phone', e.target.value)} />
                  </Grid>
                  <Grid cols={3}>
                    <Input label="City"        value={profile.city}        onChange={(e) => update('city', e.target.value)} />
                    <Input label="Province"    value={profile.province}    onChange={(e) => update('province', e.target.value)} />
                    <Input label="Country"     value={profile.country}     onChange={(e) => update('country', e.target.value)} />
                  </Grid>
                  <Input label="Postal code"   value={profile.postal_code} onChange={(e) => update('postal_code', e.target.value)} />
                  <Grid cols={3}>
                    <Input label="LinkedIn"  value={profile.linkedin_url}  onChange={(e) => update('linkedin_url', e.target.value)} />
                    <Input label="Portfolio" value={profile.portfolio_url} onChange={(e) => update('portfolio_url', e.target.value)} />
                    <Input label="GitHub"    value={profile.github_url}    onChange={(e) => update('github_url', e.target.value)} />
                  </Grid>
                  <Select
                    label="Work authorization"
                    value={profile.work_auth}
                    onChange={(e) => update('work_auth', e.target.value)}
                    options={[
                      { value: 'Authorized', label: 'Authorized to work' },
                      { value: 'Need sponsorship', label: 'Need sponsorship' },
                    ]}
                  />
                  <Grid cols={2}>
                    <Input label="School" value={profile.school} onChange={(e) => update('school', e.target.value)} />
                    <Input label="Degree" value={profile.degree} onChange={(e) => update('degree', e.target.value)} />
                  </Grid>
                  <Grid cols={2}>
                    <Input label="Major"               value={profile.major}     onChange={(e) => update('major', e.target.value)} />
                    <Input label="Expected graduation" value={profile.grad_year} onChange={(e) => update('grad_year', e.target.value)} type="number" />
                  </Grid>
                  <Input label="Desired salary" value={profile.salary_expectation} onChange={(e) => update('salary_expectation', e.target.value)} />

                  <div style={{ marginTop: 8 }}>
                    <Button type="submit" variant="primary" loading={savingProfile} style={{ height: 40 }}>
                      Save profile
                    </Button>
                  </div>
                </form>
              </Panel>
            )}

            {section === 'resume' && (
              <Panel title="Resume" subtitle="The exact PDF JobFill submits — never modified.">
                {resumeName && (
                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '0.5px solid var(--border)',
                      borderRadius: 10,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--accent-dim)',
                        border: '0.5px solid var(--border-accent)',
                        color: 'var(--accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckIcon size={16} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--text-1)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {resumeName}
                      </p>
                      <p
                        style={{
                          fontFamily: 'DM Mono',
                          fontSize: 11,
                          color: 'var(--text-3)',
                          marginTop: 2,
                        }}
                      >
                        {resumeSize ? `${(resumeSize / 1024).toFixed(0)} KB` : ''}
                        {resumeUpdatedAt
                          ? ` · uploaded ${new Date(resumeUpdatedAt).toLocaleDateString('en-CA', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}`
                          : ''}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={saveResume} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      width: '100%',
                      height: 130,
                      border: '0.5px dashed var(--border-accent)',
                      borderRadius: 12,
                      background: 'transparent',
                      color: 'var(--text-1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <UploadIcon size={18} />
                    <span style={{ fontFamily: 'Inter', fontSize: 13 }}>
                      {resumeFile ? resumeFile.name : 'Click to choose a replacement PDF'}
                    </span>
                    {resumeFile && (
                      <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--text-3)' }}>
                        {(resumeFile.size / 1024).toFixed(0)} KB
                      </span>
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const f = e.target.files?.[0] ?? null;
                      if (f && f.type !== 'application/pdf') {
                        toast('Resume must be a PDF', 'error');
                        return;
                      }
                      if (f && f.size > 10 * 1024 * 1024) {
                        toast('Resume must be under 10 MB', 'error');
                        return;
                      }
                      setResumeFile(f);
                    }}
                  />

                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-3)' }}>
                    Replacing your resume affects all future applications. Applications already submitted are not affected.
                  </p>

                  <div>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={savingResume}
                      disabled={!resumeFile}
                      style={{ height: 40 }}
                    >
                      Replace resume
                    </Button>
                  </div>
                </form>
              </Panel>
            )}

            {section === 'api-keys' && (
              <Panel title="API Keys" subtitle="Used for AI cover letter generation. Never stored in plain text.">
                <form onSubmit={saveKey} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Input
                    label="Kimi API key"
                    type={showKey ? 'text' : 'password'}
                    value={kimiKey}
                    onChange={(e) => setKimiKey(e.target.value)}
                    placeholder="sk-..."
                    autoComplete="off"
                    spellCheck={false}
                    hint="Free at platform.moonshot.ai — used for cover letters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    style={{
                      alignSelf: 'flex-start',
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: 'var(--text-3)',
                    }}
                  >
                    {showKey ? 'Hide key' : 'Show key'}
                  </button>
                  <div>
                    <Button type="submit" variant="primary" loading={savingKey} style={{ height: 40 }}>
                      Save key
                    </Button>
                  </div>
                </form>
              </Panel>
            )}

            {section === 'billing' && (
              <Panel
                title="Billing"
                subtitle={plan === 'pro' ? 'You are on Pro.' : 'You are on the Free plan.'}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontSize: 11,
                      fontWeight: 500,
                      color: plan === 'pro' ? 'var(--accent)' : 'var(--text-2)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: plan === 'pro' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                      border: '0.5px solid',
                      borderColor: plan === 'pro' ? 'var(--border-accent)' : 'var(--border)',
                      borderRadius: 999,
                      padding: '4px 10px',
                    }}
                  >
                    {plan === 'pro' ? 'Pro plan' : 'Free plan'}
                  </span>
                </div>

                {plan === 'pro' ? (
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)' }}>
                    Manage your subscription in the Stripe customer portal.
                  </p>
                ) : (
                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '0.5px solid var(--border-accent)',
                      borderRadius: 12,
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: 'Syne', fontWeight: 500, fontSize: 16, color: 'var(--accent)' }}>
                        Pro
                      </p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                        <span style={{ fontFamily: 'DM Mono', fontWeight: 500, fontSize: 32, color: 'var(--text-1)' }}>
                          ${(PRO_MONTHLY_PRICE_CENTS / 100).toFixed(0)}
                        </span>
                        <span style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-2)' }}>/mo</span>
                      </div>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        'Unlimited applications',
                        'Priority application queue',
                        'Unlimited AI cover letters',
                        'CAPTCHA manual review alerts',
                        'Application analytics',
                      ].map((f) => (
                        <li
                          key={f}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontFamily: 'Inter',
                            fontSize: 13,
                            color: 'var(--text-2)',
                          }}
                        >
                          <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                            <CheckIcon size={13} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      variant="primary"
                      loading={checkoutLoading}
                      onClick={startCheckout}
                      style={{ height: 40, alignSelf: 'flex-start' }}
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </Panel>
            )}

            {section === 'danger' && (
              <Panel title="Danger zone" subtitle="Permanent actions. Cannot be undone.">
                <div
                  style={{
                    border: '0.5px solid var(--border-danger, oklch(58% 0.2 27 / 30%))',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'var(--danger)', display: 'inline-flex' }}>
                      <TrashIcon size={18} />
                    </span>
                    <h3
                      style={{
                        fontFamily: 'Syne',
                        fontWeight: 500,
                        fontSize: 16,
                        color: 'var(--text-1)',
                      }}
                    >
                      Delete account
                    </h3>
                  </div>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)' }}>
                    Removes your profile, queued applications, and uploaded resume. Type{' '}
                    <span style={{ fontFamily: 'DM Mono', color: 'var(--text-1)' }}>DELETE</span>{' '}
                    to confirm.
                  </p>
                  <Input
                    label=""
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                  />
                  <div>
                    <Button
                      type="button"
                      variant="danger"
                      loading={deleting}
                      disabled={deleteConfirm !== 'DELETE'}
                      onClick={deleteAccount}
                      style={{ height: 40 }}
                    >
                      Permanently delete account
                    </Button>
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 14,
        padding: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div>
        <h2 className="text-h2" style={{ color: 'var(--text-1)' }}>
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'var(--text-2)',
              marginTop: 4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 12,
      }}
      className={`s-grid-${cols}`}
    >
      {children}
      <style>{`
        @media (max-width: 640px) {
          .s-grid-${cols} { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

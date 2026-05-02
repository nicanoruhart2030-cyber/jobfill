'use client';

import { useUser } from '@clerk/nextjs';
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useClerkSupabase } from '@/lib/supabase/clerk-browser';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { CheckIcon, CloseIcon, UploadIcon } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

type FormState = {
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

const INITIAL: FormState = {
  first_name: '', last_name: '', email: '', phone: '',
  city: '', province: '', country: 'Canada', postal_code: '',
  linkedin_url: '', portfolio_url: '', github_url: '',
  work_auth: 'Authorized',
  school: '', degree: '', major: '', grad_year: '',
  salary_expectation: '',
};

const MAX_PDF_BYTES = 10 * 1024 * 1024;

const STEPS = ['Personal info', 'Education & career', 'Upload your resume'];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded: userLoaded } = useUser();
  const supabase = useClerkSupabase();

  const [form, setForm]         = useState<FormState>(INITIAL);
  const [skills, setSkills]     = useState<string[]>([]);
  const [skillDraft, setDraft]  = useState('');
  const [resumeFile, setFile]   = useState<File | null>(null);
  const [existingResume, setExistingResume] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [step, setStep]         = useState(0);
  const [saving, setSaving]     = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const [drag, setDrag]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Load existing profile ── */
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

      const row = data;
      const email =
        row?.email ??
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        '';
      if (row?.user_id) setProfileUserId(row.user_id);

      setForm((prev) => ({
        ...prev,
        ...(row ?? {}),
        email,
        country: row?.country ?? 'Canada',
        grad_year: row?.grad_year?.toString() ?? '',
      }));
      if (Array.isArray(row?.skills)) setSkills(row!.skills);
      if (row?.resume_url) setExistingResume(row.resume_url.split('/').pop() ?? 'resume.pdf');
      setLoaded(true);
    })();
  }, [router, supabase, user, userLoaded]);

  /* ── Helpers ── */
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addSkill() {
    const v = skillDraft.trim();
    if (!v) return;
    if (skills.includes(v)) { setDraft(''); return; }
    setSkills((s) => [...s, v]);
    setDraft('');
  }

  function onSkillKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    } else if (e.key === 'Backspace' && skillDraft === '' && skills.length) {
      setSkills((s) => s.slice(0, -1));
    }
  }

  function pickFile(file: File | null) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast('Resume must be a PDF', 'error');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast('Resume must be under 10 MB', 'error');
      return;
    }
    setFile(file);
  }

  function onDropZone(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDrag(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  }

  /* ── Step validation ── */
  function canAdvance(): boolean {
    if (step === 0) {
      return Boolean(
        form.first_name.trim() &&
        form.last_name.trim() &&
        form.email.trim() &&
        form.work_auth.trim()
      );
    }
    if (step === 1) {
      return Boolean(form.school.trim() && form.major.trim() && form.grad_year.trim());
    }
    return Boolean(resumeFile || existingResume);
  }

  /* ── Final submit ── */
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canAdvance()) return;
    if (!supabase || !user) {
      toast('Please sign in', 'error');
      router.replace('/sign-in');
      return;
    }
    setSaving(true);

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
      setSaving(false);
      toast('Profile not ready — try again.', 'error');
      return;
    }

    let resumePath: string | undefined;
    if (resumeFile) {
      resumePath = `${internalId}/${Date.now()}-${resumeFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('resumes')
        .upload(resumePath, resumeFile, { contentType: 'application/pdf', upsert: true });
      if (uploadErr) {
        toast(uploadErr.message, 'error');
        setSaving(false);
        return;
      }
    }

    const { error: upsertErr } = await supabase.from('profiles').upsert(
      {
        user_id: internalId,
        clerk_user_id: user.id,
        ...form,
        grad_year: form.grad_year ? Number(form.grad_year) : null,
        skills,
        ...(resumePath ? { resume_url: resumePath } : {}),
      },
      { onConflict: 'user_id' },
    );

    setSaving(false);
    if (upsertErr) {
      toast(upsertErr.message, 'error');
      return;
    }
    toast('Profile saved', 'success');
    router.push('/swipe');
  }

  if (!loaded) {
    return (
      <main
        className="page-enter grid min-h-[100vh] place-items-center"
        style={{ background: 'var(--bg)' }}
      >
        <span className="load-dot" aria-label="Loading" />
      </main>
    );
  }

  return (
    <main
      className="page-enter"
      style={{
        background: 'var(--bg-base)',
        minHeight: '100vh',
        padding: '40px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Progress dots */}
        <Progress current={step} />

        {/* Header */}
        <div style={{ marginTop: 32, marginBottom: 24 }}>
          <p
            style={{
              fontFamily: 'DM Mono',
              fontSize: 11,
              color: 'var(--text-3)',
              letterSpacing: '0.06em',
            }}
          >
            STEP {(step + 1).toString().padStart(2, '0')} OF {STEPS.length.toString().padStart(2, '0')}
          </p>
          <h1 className="text-h1" style={{ color: 'var(--text-1)', marginTop: 6 }}>
            {STEPS[step]}
          </h1>
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'var(--text-2)',
              marginTop: 6,
            }}
          >
            Fill this once. JobFill uses it to auto-fill ATS forms — never shared.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            if (step < STEPS.length - 1) {
              e.preventDefault();
              if (canAdvance()) setStep((s) => s + 1);
            } else {
              void onSubmit(e);
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* ── Step 1 ── */}
          {step === 0 && (
            <Card>
              <Grid cols={2}>
                <Input label="First name" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required placeholder="Mira" />
                <Input label="Last name"  value={form.last_name}  onChange={(e) => update('last_name',  e.target.value)} required placeholder="Patel" />
              </Grid>
              <Grid cols={2}>
                <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="you@example.com" />
                <Input label="Phone" type="tel"   value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 416 555 0100" />
              </Grid>
              <Grid cols={3}>
                <Input label="City"     value={form.city}        onChange={(e) => update('city', e.target.value)}        placeholder="Toronto" />
                <Input label="Province" value={form.province}    onChange={(e) => update('province', e.target.value)}    placeholder="ON" />
                <Input label="Country"  value={form.country}     onChange={(e) => update('country', e.target.value)}     placeholder="Canada" />
              </Grid>
              <Input label="Postal code" value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} placeholder="M5V 1A1" />

              <Grid cols={3}>
                <Input label="LinkedIn URL"  value={form.linkedin_url}  onChange={(e) => update('linkedin_url', e.target.value)}  placeholder="linkedin.com/in/…" />
                <Input label="Portfolio URL" value={form.portfolio_url} onChange={(e) => update('portfolio_url', e.target.value)} placeholder="yoursite.com" />
                <Input label="GitHub URL"    value={form.github_url}    onChange={(e) => update('github_url', e.target.value)}    placeholder="github.com/…" />
              </Grid>

              <Select
                label="Work authorization"
                value={form.work_auth}
                onChange={(e) => update('work_auth', e.target.value)}
                options={[
                  { value: 'Authorized',         label: 'Authorized to work' },
                  { value: 'Need sponsorship',   label: 'Need sponsorship' },
                ]}
              />
            </Card>
          )}

          {/* ── Step 2 ── */}
          {step === 1 && (
            <Card>
              <Grid cols={2}>
                <Input label="School" value={form.school} onChange={(e) => update('school', e.target.value)} required placeholder="University of Toronto" />
                <Input label="Degree" value={form.degree} onChange={(e) => update('degree', e.target.value)} placeholder="B.Sc." />
              </Grid>
              <Grid cols={2}>
                <Input label="Major"               value={form.major}     onChange={(e) => update('major', e.target.value)}     required placeholder="Computer Science" />
                <Input label="Expected graduation" value={form.grad_year} onChange={(e) => update('grad_year', e.target.value)} required placeholder="2027" type="number" />
              </Grid>

              <SkillTagInput
                value={skills}
                draft={skillDraft}
                onDraft={setDraft}
                onAdd={addSkill}
                onRemove={(t) => setSkills((s) => s.filter((x) => x !== t))}
                onKeyDown={onSkillKey}
              />

              <Input
                label="Desired salary"
                value={form.salary_expectation}
                onChange={(e) => update('salary_expectation', e.target.value)}
                placeholder="CA$85k or $40/hr"
              />
            </Card>
          )}

          {/* ── Step 3 ── */}
          {step === 2 && (
            <Card>
            <div
              onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDropZone}
              style={{
                  height: 180,
                display: 'flex',
                alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 10,
                  cursor: 'pointer',
                  border: drag
                    ? '0.5px dashed var(--accent)'
                    : '0.5px dashed var(--border-accent)',
                  background: drag ? 'var(--accent-dim)' : 'transparent',
                  borderRadius: 12,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                {resumeFile || existingResume ? (
                  <>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--accent-dim)',
                        border: '0.5px solid var(--border-accent)',
                        color: 'var(--accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckIcon size={18} />
                    </span>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-1)' }}>
                        {resumeFile?.name ?? existingResume}
                      </p>
                      {resumeFile && (
                        <p
                          style={{
                            fontFamily: 'DM Mono',
                            fontSize: 11,
                            color: 'var(--text-3)',
                            marginTop: 4,
                          }}
                        >
                          {(resumeFile.size / 1024).toFixed(0)} KB
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--bg-elevated)',
                        border: '0.5px solid var(--border)',
                        color: 'var(--text-2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UploadIcon size={18} />
                    </span>
                    <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-1)' }}>
                      Drop your PDF here or click to browse
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: 'var(--text-3)',
                      }}
                    >
                      PDF only · max 10 MB
                    </p>
                  </>
                )}
              </div>

            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
                style={{ display: 'none' }}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  pickFile(e.target.files?.[0] ?? null)
                }
              />

              <p
                style={{
                  marginTop: 4,
                  fontFamily: 'Inter',
                  fontSize: 12,
                  color: 'var(--text-3)',
                  lineHeight: 1.5,
                }}
              >
                This is the exact file JobFill submits — we never modify it.
              </p>
            </Card>
          )}

          {/* ── Footer buttons ── */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <Button
              type="button"
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              style={{ height: 40 }}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={!canAdvance()}
              style={{ height: 40 }}
            >
              {step < STEPS.length - 1 ? 'Continue →' : 'Start swiping →'}
          </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ─────── Subcomponents ─────── */

function Progress({ current }: { current: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
      }}
    >
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <span
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: done || active ? 'var(--accent)' : 'transparent',
                border: '0.5px solid',
                borderColor: done || active ? 'var(--border-accent)' : 'var(--border)',
                transition: 'background 0.15s',
              }}
            />
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                style={{
                  width: 48,
                  height: 1,
                  background: done ? 'var(--accent)' : 'var(--border)',
                  transition: 'background 0.15s',
                }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
      background: 'var(--bg-surface)',
      border: '0.5px solid var(--border)',
      borderRadius: 14,
        padding: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {children}
    </div>
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
      className={`grid-${cols}`}
    >
      {children}
      <style>{`
        @media (max-width: 640px) {
          .grid-${cols} { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

type SkillProps = {
  value: string[];
  draft: string;
  onDraft: (v: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
};

function SkillTagInput({ value, draft, onDraft, onAdd, onRemove, onKeyDown }: SkillProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontFamily: 'Inter',
          fontSize: 12,
          color: 'var(--text-2)',
          fontWeight: 500,
        }}
      >
        Skills
      </label>
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '0.5px solid var(--border)',
          borderRadius: 8,
          padding: '8px 10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
          minHeight: 42,
        }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: 'var(--text-1)',
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border)',
              borderRadius: 6,
              padding: '3px 6px 3px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              aria-label={`Remove ${tag}`}
              style={{
                color: 'var(--text-3)',
                width: 16,
                height: 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloseIcon size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onAdd}
          placeholder={value.length === 0 ? 'Type a skill and press Enter' : ''}
          style={{
            flex: 1,
            minWidth: 120,
            background: 'transparent',
            outline: 'none',
            border: 'none',
            color: 'var(--text-1)',
            fontFamily: 'Inter',
            fontSize: 13,
          }}
        />
      </div>
      <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-3)' }}>
        Type and press Enter to add. Backspace to remove.
      </p>
    </div>
  );
}

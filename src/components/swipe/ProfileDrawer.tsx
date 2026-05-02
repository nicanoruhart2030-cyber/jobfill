"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useClerkSupabase } from "@/lib/supabase/clerk-browser";
import type { Profile } from "@/lib/types";

type ProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const empty: Partial<Profile> = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  province: "",
  country: "Canada",
  postal_code: "",
  linkedin_url: "",
  portfolio_url: "",
  github_url: "",
  school: "",
  degree: "",
  major: "",
  grad_year: null,
  work_auth: "yes",
  salary_expectation: "",
  resume_url: null,
  kimi_api_key: "",
  skills: [],
};

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const supabase = useClerkSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Profile>>(empty);
  const [skillsInput, setSkillsInput] = useState("");
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userLoaded) return;
    if (!supabase || !user) {
      setUserId(null);
      if (open) setStatus("Sign in to save your profile.");
      return;
    }
    let cancelled = false;
    void (async () => {
      setStatus(null);
      let { data: row } = await supabase
        .from("profiles")
        .select("*")
        .eq("clerk_user_id", user.id)
        .maybeSingle();
      if (!row) {
        await fetch("/api/profile/ensure", { method: "POST" });
        ({ data: row } = await supabase
          .from("profiles")
          .select("*")
          .eq("clerk_user_id", user.id)
          .maybeSingle());
      }
      if (cancelled) return;
      const internalId = (row as Profile | null)?.user_id ?? null;
      setUserId(internalId);
      if (!internalId) {
        setStatus("Could not load profile.");
        return;
      }
      if (row) {
        const p = row as Profile & { groq_api_key?: string | null };
        setForm({
          ...p,
          skills: p.skills ?? [],
          kimi_api_key: p.kimi_api_key ?? p.groq_api_key ?? "",
        });
        setSkillsInput((p.skills ?? []).join(", "));
        if (p.resume_url) {
          const seg = p.resume_url.split("/").pop();
          setResumeName(seg ?? "resume.pdf");
        }
      } else {
        setForm({ ...empty, email: user.primaryEmailAddress?.emailAddress ?? "" });
        setSkillsInput("");
        setResumeName(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, supabase, user, userLoaded]);

  const persist = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!userId || !supabase || !user) return;
      const normalized = { ...patch };
      if (typeof normalized.grad_year === "string") {
        const raw = String(normalized.grad_year).trim();
        if (raw === "") normalized.grad_year = null;
        else {
          const n = parseInt(raw, 10);
          normalized.grad_year = Number.isFinite(n) ? n : null;
        }
      }
      const email =
        (typeof normalized.email === "string" ? normalized.email : user.primaryEmailAddress?.emailAddress) ||
        "";
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: userId,
          clerk_user_id: user.id,
          email,
          ...normalized,
        },
        { onConflict: "user_id" },
      );
      if (error) setStatus(error.message);
      else setStatus(null);
    },
    [userId, supabase, user],
  );

  const onBlurField = (key: string, value: unknown) => {
    if (!userId) return;
    void persist({ [key]: value });
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      const f = files[0];
      if (!f || !userId || !supabase) return;
      const path = `${userId}/${f.name}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, f, { upsert: true });
      if (upErr) {
        setStatus(upErr.message);
        return;
      }
      setResumeName(f.name);
      setForm((prev) => ({ ...prev, resume_url: path }));
      await persist({ resume_url: path });
    },
    [userId, supabase, persist],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: !userId,
  });

  const field =
    (k: keyof Profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = e.target.value;
      setForm((prev) => ({ ...prev, [k]: v }));
    };

  const blurInput =
    (k: string) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      onBlurField(k, e.target.value);
    };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close profile"
            className="fixed inset-0 z-[60] bg-[oklch(0%_0_0_/55%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-[400px] flex-col border-l-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)]"
            style={{ boxShadow: "0 2px 8px color-mix(in oklch, var(--bg-base) 50%, transparent)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b-[0.5px] border-[var(--border)] px-5 py-4">
              <h2 className="text-[16px] text-[var(--text-1)]" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                Profile
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] px-2 py-1 text-[12px] text-[var(--text-2)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Close
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
              {status && (
                <p className="mb-3 text-[12px] text-[var(--danger)]" style={{ fontFamily: "var(--font-body)" }}>
                  {status}
                </p>
              )}

              <SectionTitle>Personal</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <Input label="First name" value={String(form.first_name ?? "")} onChange={field("first_name")} onBlur={blurInput("first_name")} />
                <Input label="Last name" value={String(form.last_name ?? "")} onChange={field("last_name")} onBlur={blurInput("last_name")} />
              </div>
              <Input label="Email" value={String(form.email ?? "")} onChange={field("email")} onBlur={blurInput("email")} />
              <Input label="Phone" value={String(form.phone ?? "")} onChange={field("phone")} onBlur={blurInput("phone")} />

              <SectionTitle>Location</SectionTitle>
              <Input label="City" value={String(form.city ?? "")} onChange={field("city")} onBlur={blurInput("city")} />
              <Input label="Province" value={String(form.province ?? "")} onChange={field("province")} onBlur={blurInput("province")} />
              <Input label="Country" value={String(form.country ?? "Canada")} onChange={field("country")} onBlur={blurInput("country")} />
              <Input label="Postal code" value={String(form.postal_code ?? "")} onChange={field("postal_code")} onBlur={blurInput("postal_code")} />

              <SectionTitle>Links</SectionTitle>
              <Input label="LinkedIn" value={String(form.linkedin_url ?? "")} onChange={field("linkedin_url")} onBlur={blurInput("linkedin_url")} />
              <Input label="Portfolio" value={String(form.portfolio_url ?? "")} onChange={field("portfolio_url")} onBlur={blurInput("portfolio_url")} />
              <Input label="GitHub" value={String(form.github_url ?? "")} onChange={field("github_url")} onBlur={blurInput("github_url")} />

              <SectionTitle>Education</SectionTitle>
              <Input label="School" value={String(form.school ?? "")} onChange={field("school")} onBlur={blurInput("school")} />
              <Input label="Degree" value={String(form.degree ?? "")} onChange={field("degree")} onBlur={blurInput("degree")} />
              <Input label="Major" value={String(form.major ?? "")} onChange={field("major")} onBlur={blurInput("major")} />
              <Input
                label="Grad year"
                value={form.grad_year != null ? String(form.grad_year) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((p) => ({
                    ...p,
                    grad_year: v === "" ? null : (Number.parseInt(v, 10) || null),
                  }));
                }}
                onBlur={blurInput("grad_year")}
              />
              <label className="mt-2 block text-[11px] uppercase tracking-[0.06em] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
                Skills (comma-separated)
              </label>
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onBlur={() => {
                  const skills = skillsInput
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setForm((p) => ({ ...p, skills }));
                  void persist({ skills } as Record<string, unknown>);
                }}
                className="mt-1 w-full rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[14px] text-[var(--text-1)] focus:border-[var(--border-accent)] focus:outline-none"
                style={{ fontFamily: "var(--font-body)" }}
              />

              <SectionTitle>Resume</SectionTitle>
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-[var(--radius-md)] border border-dashed border-[var(--border-accent)] px-4 py-8 text-center text-[13px] text-[var(--text-2)] ${isDragActive ? "bg-[var(--accent-dim)]" : "bg-[var(--bg-surface)]"}`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                <input {...getInputProps()} />
                {resumeName ? `Uploaded: ${resumeName}` : "Drop your PDF here"}
              </div>
              <p className="mt-2 text-[11px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
                This exact file gets submitted. We never modify it.
              </p>

              <SectionTitle>Settings</SectionTitle>
              <label className="mt-2 block text-[11px] uppercase tracking-[0.06em] text-[var(--text-3)]">Work authorization</label>
              <select
                value={String(form.work_auth ?? "yes")}
                onChange={field("work_auth")}
                onBlur={(e) => onBlurField("work_auth", e.target.value)}
                className="mt-1 w-full rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[14px] text-[var(--text-1)] focus:border-[var(--border-accent)] focus:outline-none"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <option value="yes">Authorized to work</option>
                <option value="sponsor">Need sponsorship</option>
                <option value="student">Student / Co-op</option>
              </select>
              <Input label="Salary expectation" value={String(form.salary_expectation ?? "")} onChange={field("salary_expectation")} onBlur={blurInput("salary_expectation")} />
              <Input
                label="Kimi API key (optional)"
                placeholder="sk-..."
                hint="Free at platform.moonshot.ai — used for cover letters"
                value={String(form.kimi_api_key ?? "")}
                onChange={field("kimi_api_key")}
                onBlur={blurInput("kimi_api_key")}
                obscure
              />
            </div>
            <div className="border-t-[0.5px] border-[var(--border)] p-4">
              <button
                type="button"
                onClick={onClose}
                className="h-11 w-full rounded-[var(--radius-md)] bg-[var(--accent)] text-[14px] font-medium text-[var(--bg-base)] transition-colors hover:bg-[var(--accent-hover)] active:scale-[0.99]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Done
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-2 mt-5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
      {children}
    </p>
  );
}

function Input({
  label,
  value,
  onChange,
  onBlur,
  obscure,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  obscure?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <>
      <label className="mt-2 block text-[11px] uppercase tracking-[0.06em] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <input
        type={obscure ? "password" : "text"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="mt-1 w-full rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[14px] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--border-accent)] focus:outline-none"
        style={{ fontFamily: "var(--font-body)" }}
        autoComplete="off"
      />
      {hint ? (
        <p className="mt-1 text-[11px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
          {hint}
        </p>
      ) : null}
    </>
  );
}

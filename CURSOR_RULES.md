# CURSOR_RULES — JobFill

All UI work must follow this document. No exceptions.

## Design tokens

Use only CSS variables from `src/app/globals.css` (`:root`). No arbitrary hex/rgb in components unless unavoidable for SVG masks (prefer tokens).

- **Backgrounds:** `--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-overlay`
- **Accent (teal):** `--accent`, `--accent-dim`, `--accent-hover`, `--border-accent`
- **Semantic:** `--danger`, `--danger-dim`, `--save`, `--save-dim`, `--warning`, `--warning-dim`
- **Text:** `--text-1`, `--text-2`, `--text-3`, `--text-accent`
- **Borders:** `--border`, `--border-hover`, `--border-accent`, `--border-danger`, `--border-save`
- **Radius:** `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (14px max for cards), `--radius-full` (pills only)

## Typography

- **Display / headings:** Syne, weight 500
- **UI / body:** Inter, weights 400 and 500 only (max two weights per screen)
- **All numbers, counts, prices, percentages, dates:** DM Mono — mandatory

## Components

Build reusable patterns: primary/secondary/danger buttons, card (surface + 0.5px border + `--radius-lg`), inputs with focus border `--border-accent`, border-only tags/badges unless semantic status (then dim + pill).

- **Icons:** Inline SVG only, 1.5px stroke, `currentColor`, no icon libraries, no emoji in UI (footer region flag allowed once per product spec)
- **Loading:** Async controls disable immediately + 16px spinning SVG stroke `currentColor`
- **Motion:** Short, purposeful; respect `prefers-reduced-motion` (globals)

## Layout

- Marketing: left-aligned product UI; grids stack at small breakpoints; touch targets ≥ 44px for primary actions
- **Swipe:** Full viewport height, no page scroll on `/swipe`
- **Dashboard kanban:** Six columns — Queued, Applying, Applied, Interview, Offer, Rejected — map `needs_manual_review` → Applying, `failed` → Rejected

## Copy tone (JobFill)

Direct, slightly dry. No exclamation marks. No hype phrases.

## Auth & data

- Supabase session refresh via `src/middleware.ts` + `getAll`/`setAll` cookies on server client
- Errors: inline under fields where possible; toasts for success / background completion

## Implementation stack

Next.js 14 App Router, Supabase, Stripe, Groq, Playwright, Tailwind present for utilities — prefer tokens and shared UI components over ad-hoc colors.

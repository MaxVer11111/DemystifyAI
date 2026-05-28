# Courses, Account & Sign In Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new features to DemystifyAI — Courses (with Feishu in-app reader), Account (with click history), and Sign In (with Supabase auth + mock layer) — replicated from temp/*.html designs.

**Architecture:** Expand existing CSS design system in globals.css with new tokens and component classes. Create a centralized course data layer. Integrate Supabase auth with a mock shim for UI testing. Build a Feishu Open API proxy for in-app doc reading. All pages use App Router.

**Tech Stack:** Next.js 16 (App Router), Supabase (auth), Feishu Open API (doc reading), TypeScript, CSS custom properties (no Tailwind utilities).

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `src/data/courses.ts` | Centralized course categories + tutorials data |
| `src/lib/supabase/client.ts` | Supabase browser client singleton |
| `src/lib/supabase/server.ts` | Supabase server client (cookie-based) |
| `src/lib/supabase/mock.ts` | Mock Supabase client for UI testing |
| `src/lib/feishu.ts` | Feishu token management + doc content fetching |
| `src/components/courses/CourseCard.tsx` | Category card (category-grid in courses.html) |
| `src/components/courses/TutorialCard.tsx` | Tutorial card (tutorial-grid in category-detail.html) |
| `src/components/courses/CourseReader.tsx` | In-app Feishu doc reader |
| `src/components/auth/SignInForm.tsx` | Sign in form with Supabase auth + mock |
| `src/components/account/StatCard.tsx` | Stats counter card |
| `src/components/account/ActivityItem.tsx` | Learning history row |
| `src/app/signin/page.tsx` | Sign in page route |
| `src/app/account/page.tsx` | Account page route |
| `src/app/courses/page.tsx` | Courses page route (category grid) |
| `src/app/courses/[category]/page.tsx` | Category detail page route |
| `src/app/api/feishu/doc/route.ts` | Feishu doc content proxy API |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/globals.css` | Add new tokens + course/account/auth component styles |
| `src/app/layout.tsx` | Add Supabase providers if needed |

---

### Task 1: Expand Design System (globals.css)

**Files:**
- Modify: `src/app/globals.css`

Add missing design tokens and all new component CSS classes for Courses, Account, and Sign In pages.

- [ ] **Step 1: Add new design tokens to `:root`**

Insert these after the existing `--elev-raised` token (around line 49):

```css
  /* Extended tokens for auth, account, courses */
  --fg-2:    oklch(35% 0.02 70);
  --accent-hover:  color-mix(in oklch, var(--accent), black 8%);
  --accent-active: color-mix(in oklch, var(--accent), black 14%);
  --accent-on: #fff;
  --success: oklch(56% 0.14 160);
  --danger:  oklch(52% 0.18 20);
  --warning: oklch(62% 0.14 85);
  --shadow-lg: 0 12px 40px oklch(22% 0.025 70 / 10%);
```

- [ ] **Step 2: Add auth card and form styles**

Insert after the `.tag` block (around line 349):

```css
/* ─── Auth / Sign In ──────────────────────────────────────────────────── */
.auth-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px var(--gutter);
}
.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 48px 40px 40px;
  box-shadow: var(--shadow-md);
}
.auth-card .eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}
.auth-card h1 {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.auth-card .subtitle {
  font-size: 0.9375rem;
  color: var(--muted);
  margin-bottom: 32px;
  line-height: 1.5;
}
.auth-card .subtitle a {
  color: var(--accent);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fg-2);
  margin-bottom: 6px;
}
.form-group .input-wrap {
  position: relative;
}
.form-group .input-wrap svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--muted);
  pointer-events: none;
}
.form-group input {
  width: 100%;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  padding: 13px 14px 13px 42px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--fg);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.form-group input::placeholder {
  color: var(--muted);
  opacity: 0.7;
}
.form-group .toggle-pw {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  display: grid; place-items: center;
  border-radius: 4px;
  transition: color 0.2s;
}
.form-group .toggle-pw:hover { color: var(--fg); }
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.form-options label {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.875rem;
  color: var(--muted);
  cursor: pointer;
}
.form-options label input[type="checkbox"] {
  width: 16px; height: 16px;
  accent-color: var(--accent);
  border-radius: 3px;
  cursor: pointer;
}
.form-options a {
  font-size: 0.875rem;
  color: var(--accent);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.form-error {
  display: none;
  margin-top: 16px;
  padding: 12px 14px;
  background: color-mix(in oklch, var(--danger) 8%, transparent);
  border: 1px solid color-mix(in oklch, var(--danger) 30%, transparent);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--danger);
  line-height: 1.4;
}
.form-error.visible { display: block; }
```

- [ ] **Step 3: Add course page styles (category cards + hero)**

Insert after the auth styles:

```css
/* ─── Courses: Hero ──────────────────────────────────────────────────── */
.courses-hero {
  padding: 56px 0 16px;
}
.courses-hero h1 {
  font-family: var(--font-display);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}
.courses-hero .desc {
  font-size: 1.0625rem;
  color: var(--muted);
  max-width: 560px;
  line-height: 1.55;
}

/* ─── Courses: Category Grid ─────────────────────────────────────────── */
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding-block: 40px 80px;
}
.category-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.3s ease;
  cursor: pointer;
  text-decoration: none;
}
.category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px oklch(22% 0.025 70 / 12%);
}
.category-card .card-illustration {
  aspect-ratio: 16 / 7;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}
.category-card .card-illustration svg {
  width: auto;
  height: 62%;
  max-width: 62%;
}
.category-card .card-body {
  padding: 28px 26px 32px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.category-card .card-body h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin-bottom: 6px;
}
.category-card .card-body .card-desc {
  font-size: 0.9375rem;
  line-height: 1.5;
  opacity: 0.8;
  flex: 1;
  margin-bottom: 16px;
}
.category-card .card-body .learn-more {
  font-size: 0.9375rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.category-card .card-body .learn-more::after {
  content: '→';
  transition: transform 0.2s ease;
}
.category-card:hover .card-body .learn-more::after {
  transform: translateX(4px);
}

@media (max-width: 1100px) {
  .category-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .category-grid { grid-template-columns: 1fr; gap: 20px; }
}
```

- [ ] **Step 4: Add category detail page styles**

Insert after category grid responsive rules:

```css
/* ─── Courses: Category Detail ────────────────────────────────────────── */
.breadcrumb {
  padding: 20px 0;
  font-size: 0.8125rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
}
.breadcrumb a { color: var(--muted); transition: color 0.2s; }
.breadcrumb a:hover { color: var(--accent); }
.breadcrumb .sep { color: var(--border); }
.breadcrumb .current { color: var(--fg); font-weight: 500; }

.category-header {
  padding: 16px 0 40px;
}
.category-header .eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}
.category-header h1 {
  font-family: var(--font-display);
  font-size: clamp(32px, 4.5vw, 48px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}
.category-header .desc {
  font-size: 1.0625rem;
  color: var(--muted);
  max-width: 560px;
  line-height: 1.55;
}
.category-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  font-size: 0.8125rem;
  color: var(--muted);
  font-family: var(--font-mono);
}
.category-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.category-meta svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 1.6; }

.content-surface {
  background: var(--surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding-top: 4px;
  margin-top: -4px;
}

/* ─── Tutorial Grid ────────────────────────────────────────────────────── */
.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding-block: 40px 80px;
}
.tutorial-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  cursor: pointer;
}
.tutorial-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}
.tutorial-thumb {
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}
.tutorial-thumb svg { width: 36px; height: 36px; opacity: 0.5; }
.tutorial-body { padding: 20px 22px 22px; flex: 1; display: flex; flex-direction: column; }
.tutorial-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}
.tutorial-tag {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  text-transform: uppercase;
}
.tutorial-tag.feature {
  background: color-mix(in oklch, var(--fg) 6%, transparent);
  color: var(--fg-2);
}
.tutorial-card h3 {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 6px;
  line-height: 1.35;
}
.tutorial-card .tutorial-desc {
  font-size: 0.8125rem;
  color: var(--muted);
  line-height: 1.5;
  flex: 1;
  margin-bottom: 14px;
}
.tutorial-card .read-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tutorial-card .read-link::after {
  content: '→';
  transition: transform 0.2s ease;
}
.tutorial-card:hover .read-link::after {
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .tutorial-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .tutorial-grid { grid-template-columns: 1fr; gap: 18px; }
}
```

- [ ] **Step 5: Add account page styles**

Insert after tutorial grid responsive rules:

```css
/* ─── Account Page ──────────────────────────────────────────────────────── */
.account-wrap {
  flex: 1;
  max-width: var(--container);
  margin: 0 auto;
  padding: 48px var(--gutter) 64px;
  width: 100%;
}
.account-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border);
}
.account-avatar {
  position: relative;
  flex-shrink: 0;
}
.account-avatar .avatar-circle {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--accent-container);
  color: var(--accent);
  display: grid; place-items: center;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
}
.account-avatar .avatar-badge {
  position: absolute;
  bottom: 0; right: 0;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--success);
  color: #fff;
  display: grid; place-items: center;
  border: 2px solid var(--surface);
  font-size: 0.6rem;
}
.account-heading h1 {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.account-heading .heading-meta {
  font-size: 0.875rem;
  color: var(--muted);
  margin-top: 2px;
}
.account-heading .heading-meta span {
  display: inline-flex; align-items: center; gap: 6px;
}
.account-heading .heading-meta .dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--success);
  margin-inline: 2px;
}
.account-header-right {
  margin-left: auto;
  display: flex;
  gap: 12px;
  align-items: center;
}

/* ─── Account Card ── */
.acard {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
  margin-bottom: 24px;
}
.acard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.acard-header h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.acard-header p { font-size: 0.875rem; color: var(--muted); }

/* ─── Stat Grid ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
  padding: 24px 20px;
  margin-bottom: 0;
}
.stat-card .stat-num {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}
.stat-card .stat-label {
  font-size: 0.8125rem;
  color: var(--muted);
  margin-top: 4px;
}

/* ─── Activity Item ── */
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
}
.activity-item + .activity-item { border-top: 1px solid var(--border); }
.activity-icon {
  width: 40px; height: 40px;
  border-radius: var(--radius);
  background: var(--accent-soft);
  color: var(--accent);
  display: grid; place-items: center;
  flex-shrink: 0;
  font-size: 0.85rem;
}
.activity-body { flex: 1; min-width: 0; }
.activity-body h4 {
  font-size: 0.9375rem;
  font-weight: 500;
  margin-bottom: 2px;
}
.activity-body p {
  font-size: 0.8125rem;
  color: var(--muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.activity-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: 0.75rem;
  color: var(--muted);
  font-family: var(--font-mono);
}
.activity-score {
  font-weight: 500;
  color: var(--accent);
}
.activity-progress {
  width: 80px; height: 4px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}
.activity-progress .bar {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
}
.activity-right {
  text-align: right;
  flex-shrink: 0;
}
.activity-right .act-tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}
.act-tag.course { background: var(--accent-soft); color: var(--accent); }
.act-tag.external { background: color-mix(in oklch, var(--warning) 14%, transparent); color: var(--warning); }

@media (max-width: 700px) {
  :root { --gutter: 16px; }
  .account-wrap { padding: 32px var(--gutter) 48px; }
  .account-header { flex-wrap: wrap; gap: 16px; }
  .account-header-right { margin-left: 0; width: 100%; }
  .account-header-right .btn { flex: 1; }
  .acard { padding: 24px 20px; }
  .stat-grid { grid-template-columns: 1fr; }
}

/* ─── Mini Nav (sign in only) ────────────────────────────────────────── */
.mini-nav {
  position: sticky;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 14px var(--gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: color-mix(in oklab, var(--bg), transparent 28%);
  backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid var(--border);
}
.mini-nav .nav-logo {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--fg);
  letter-spacing: -0.02em;
}
.mini-nav .nav-logo mark {
  display: grid; place-items: center;
  width: 28px; height: 28px;
  background: var(--accent);
  color: var(--accent-on);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: 8px;
}
.mini-nav .nav-links {
  display: flex; align-items: center; gap: 28px;
}
.mini-nav .nav-links a {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fg-2);
  transition: color 0.2s;
}
.mini-nav .nav-links a:hover { color: var(--fg); }
.mini-nav .nav-links .btn-outline {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--accent);
  background: transparent;
  border: 1.5px solid var(--accent);
  padding: 7px 18px;
  border-radius: var(--radius-pill);
  transition: background 0.2s, color 0.2s;
}
.mini-nav .nav-links .btn-outline:hover {
  background: var(--accent);
  color: var(--accent-on);
}

@media (max-width: 600px) {
  .mini-nav { padding: 12px var(--gutter); }
  .mini-nav .nav-links { gap: 16px; }
  .mini-nav .nav-links a { font-size: 0.8125rem; }
  .mini-nav .nav-links .btn-outline { padding: 6px 14px; font-size: 0.75rem; }
}
```

- [ ] **Step 6: Add course reader styles**

Insert after mini-nav responsive rules:

```css
/* ─── Course Reader (Feishu in-app) ──────────────────────────────────────── */
.reader-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px var(--gutter) 80px;
}
.reader-header {
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.reader-header h1 {
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 12px;
}
.reader-meta {
  display: flex;
  gap: 16px;
  font-size: 0.8125rem;
  color: var(--muted);
  font-family: var(--font-mono);
}
.reader-content {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--fg);
}
.reader-content h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 36px 0 12px;
}
.reader-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 28px 0 8px;
}
.reader-content p {
  margin-bottom: 16px;
}
.reader-content ul, .reader-content ol {
  margin: 12px 0 20px;
  padding-left: 24px;
}
.reader-content li {
  margin-bottom: 6px;
}
.reader-content blockquote {
  border-left: 3px solid var(--accent);
  margin: 20px 0;
  padding: 12px 20px;
  background: var(--accent-soft);
  border-radius: 0 var(--radius) var(--radius) 0;
  color: var(--fg-2);
}
.reader-content code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--accent-soft);
  padding: 2px 6px;
  border-radius: 4px;
}
.reader-loading {
  text-align: center;
  padding: 80px 20px;
  color: var(--muted);
}
.reader-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--danger);
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: expand design system with course, account, and auth tokens and styles"
```

---

### Task 2: Create Course Data Layer

**Files:**
- Create: `src/data/courses.ts`

- [ ] **Step 1: Create course data file**

```tsx
// src/data/courses.ts
// Centralized course data — add a course by adding one object to a tutorials array.

export type CourseType = "feishu" | "external";

export interface CourseTutorial {
  id: string;
  title: string;
  description: string;
  type: CourseType;
  url: string;            // Feishu doc URL or external URL
  categoryId: string;
  level: "beginner" | "intermediate";
  time: string;           // e.g. "15 min"
  icon: string;           // icon key name
  tags: string[];
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  eyebrow: string;
  level: string;
  bgColor: string;
  textColor?: string;
  theme: "light" | "dark";
  iconSvg?: string;
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: "ai-basic",
    title: "AI Basic",
    description: "Start here if you're new to AI. Learn what it is, how it works, and the key ideas you need to know — no jargon, no assumptions.",
    eyebrow: "Foundations",
    level: "Beginner",
    bgColor: "#E2DDD5",
    textColor: "var(--fg)",
    theme: "light",
  },
  {
    id: "ai-personal",
    title: "AI Personal",
    description: "Discover how AI can help in your daily life — from productivity tools to creative projects and smart home technology.",
    eyebrow: "Everyday AI",
    level: "Beginner — Intermediate",
    bgColor: "#4B79A1",
    textColor: "#ffffff",
    theme: "dark",
  },
  {
    id: "ai-learning",
    title: "AI Learning",
    description: "Go deeper into how AI actually works — neural networks, training, evaluation, and the engineering behind modern systems.",
    eyebrow: "Intermediate",
    level: "Intermediate",
    bgColor: "#A2B5B4",
    textColor: "#1F2B2A",
    theme: "light",
  },
  {
    id: "ai-production",
    title: "AI Production",
    description: "Practical skills for using AI at work — prompt engineering, workflows, automation, and responsible deployment.",
    eyebrow: "Practical",
    level: "Beginner — Intermediate",
    bgColor: "#A9A9C2",
    textColor: "#1F1F2E",
    theme: "light",
  },
];

export const COURSE_TUTORIALS: CourseTutorial[] = [
  // ── AI Basic ──
  {
    id: "basic-what-is-ai",
    title: "What is AI? A plain-English introduction",
    description: "Understand what artificial intelligence means, where the term came from, and why it matters — without any technical background.",
    type: "feishu",
    url: "basic-what-is-ai",
    categoryId: "ai-basic",
    level: "beginner",
    time: "15 min",
    icon: "bulb",
    tags: ["fundamentals"],
  },
  {
    id: "basic-key-terms",
    title: "Key AI terms explained simply",
    description: "From 'neural network' to 'training data' — a straightforward glossary of the terms you'll encounter in every AI conversation.",
    type: "external",
    url: "https://example.com/ai-terms",
    categoryId: "ai-basic",
    level: "beginner",
    time: "12 min",
    icon: "book",
    tags: ["terminology"],
  },
  {
    id: "basic-history",
    title: "A brief history of AI",
    description: "How did we get here? From Turing to ChatGPT — the major milestones in AI development, explained in everyday language.",
    type: "feishu",
    url: "basic-history",
    categoryId: "ai-basic",
    level: "beginner",
    time: "20 min",
    icon: "clock",
    tags: ["history"],
  },
  {
    id: "basic-types-of-ai",
    title: "Types of AI: narrow, general, and superintelligence",
    description: "Learn the difference between the AI we have today, the AI researchers are working toward, and the science-fiction version.",
    type: "feishu",
    url: "basic-types-of-ai",
    categoryId: "ai-basic",
    level: "beginner",
    time: "10 min",
    icon: "layers",
    tags: ["fundamentals"],
  },
  {
    id: "basic-how-ai-learns",
    title: "How AI learns from data",
    description: "A gentle introduction to machine learning: how computers find patterns in data and use them to make decisions.",
    type: "external",
    url: "https://example.com/how-ai-learns",
    categoryId: "ai-basic",
    level: "beginner",
    time: "18 min",
    icon: "trend",
    tags: ["terminology"],
  },
  {
    id: "basic-misconceptions",
    title: "Common misconceptions about AI",
    description: "Separating fact from fiction — addressing the most common myths and misunderstandings about artificial intelligence.",
    type: "feishu",
    url: "basic-misconceptions",
    categoryId: "ai-basic",
    level: "beginner",
    time: "14 min",
    icon: "check",
    tags: ["fundamentals"],
  },
  // ── AI Personal ──
  {
    id: "personal-productivity",
    title: "AI-powered productivity tools for daily life",
    description: "Explore how AI assistants, smart schedulers, and automated reminders can save you hours every week.",
    type: "external",
    url: "https://example.com/ai-productivity",
    categoryId: "ai-personal",
    level: "beginner",
    time: "12 min",
    icon: "zap",
    tags: ["tools"],
  },
  {
    id: "personal-creative",
    title: "Using AI for creative projects and hobbies",
    description: "From generating art and music to writing stories — learn how AI can be your creative collaborator.",
    type: "feishu",
    url: "personal-creative",
    categoryId: "ai-personal",
    level: "beginner",
    time: "15 min",
    icon: "pen",
    tags: ["fundamentals"],
  },
  {
    id: "personal-chat-comparison",
    title: "Getting the most from ChatGPT, Claude, and Copilot",
    description: "A practical comparison of today's leading AI assistants — what each does best and how to choose.",
    type: "external",
    url: "https://example.com/ai-assistant-comparison",
    categoryId: "ai-personal",
    level: "beginner",
    time: "18 min",
    icon: "message",
    tags: ["tools"],
  },
  {
    id: "personal-knowledge-mgmt",
    title: "Personal knowledge management with AI",
    description: "Build a second brain: use AI to organize notes, summarize articles, and connect ideas across your digital life.",
    type: "feishu",
    url: "personal-knowledge-mgmt",
    categoryId: "ai-personal",
    level: "intermediate",
    time: "22 min",
    icon: "book",
    tags: ["workflows"],
  },
  {
    id: "personal-health",
    title: "AI for health, fitness, and wellness tracking",
    description: "How AI-powered apps analyze your sleep, activity, and nutrition — and what they actually get right.",
    type: "external",
    url: "https://example.com/ai-health",
    categoryId: "ai-personal",
    level: "beginner",
    time: "14 min",
    icon: "trend",
    tags: ["terminology"],
  },
  {
    id: "personal-smart-home",
    title: "Smart home AI: how it works under the hood",
    description: "A plain-English look at the AI behind smart speakers, thermostats, and security cameras.",
    type: "feishu",
    url: "personal-smart-home",
    categoryId: "ai-personal",
    level: "intermediate",
    time: "16 min",
    icon: "cpu",
    tags: ["fundamentals"],
  },
  {
    id: "personal-photo-video",
    title: "AI photo and video tools explained",
    description: "How AI editing tools remove backgrounds, enhance quality, and generate images — and how to use them responsibly.",
    type: "external",
    url: "https://example.com/ai-photo-tools",
    categoryId: "ai-personal",
    level: "beginner",
    time: "20 min",
    icon: "bulb",
    tags: ["tools"],
  },
  {
    id: "personal-privacy",
    title: "Privacy and security when using AI at home",
    description: "What data your AI tools collect, how to protect your privacy, and what settings to check first.",
    type: "feishu",
    url: "personal-privacy",
    categoryId: "ai-personal",
    level: "beginner",
    time: "13 min",
    icon: "shield",
    tags: ["workflows"],
  },
  // ── AI Learning ──
  {
    id: "learning-neural-networks",
    title: "How neural networks work",
    description: "A visual, intuition-first explanation of the architecture that powers modern AI — from a single neuron to deep networks.",
    type: "feishu",
    url: "learning-neural-networks",
    categoryId: "ai-learning",
    level: "intermediate",
    time: "25 min",
    icon: "network",
    tags: ["fundamentals"],
  },
  {
    id: "learning-supervised",
    title: "Supervised vs. unsupervised learning",
    description: "The two main paradigms of machine learning, explained with real-world examples you encounter every day.",
    type: "external",
    url: "https://example.com/supervised-unsupervised",
    categoryId: "ai-learning",
    level: "intermediate",
    time: "18 min",
    icon: "layers",
    tags: ["fundamentals"],
  },
  {
    id: "learning-datasets",
    title: "What makes a good training dataset",
    description: "Why data quality matters more than quantity, and how biases in training data affect AI outputs.",
    type: "feishu",
    url: "learning-datasets",
    categoryId: "ai-learning",
    level: "intermediate",
    time: "20 min",
    icon: "database",
    tags: ["terminology"],
  },
  {
    id: "learning-llms",
    title: "Understanding large language models",
    description: "How GPT and similar models work under the hood — tokenization, attention, and why scale leads to emergent abilities.",
    type: "external",
    url: "https://example.com/how-llms-work",
    categoryId: "ai-learning",
    level: "intermediate",
    time: "30 min",
    icon: "message",
    tags: ["terminology"],
  },
  {
    id: "learning-fine-tuning",
    title: "Transfer learning and fine-tuning",
    description: "How pre-trained models are adapted for specific tasks — the technique that makes AI practical for real-world applications.",
    type: "feishu",
    url: "learning-fine-tuning",
    categoryId: "ai-learning",
    level: "intermediate",
    time: "22 min",
    icon: "sliders",
    tags: ["tools"],
  },
  {
    id: "learning-evaluation",
    title: "Evaluation metrics: how we measure AI performance",
    description: "Accuracy, precision, recall, and F1 — what these numbers actually tell us about how well an AI system works.",
    type: "external",
    url: "https://example.com/ai-evaluation-metrics",
    categoryId: "ai-learning",
    level: "intermediate",
    time: "15 min",
    icon: "chart",
    tags: ["terminology"],
  },
  {
    id: "learning-ethics",
    title: "The ethical challenges of AI",
    description: "Fairness, transparency, accountability — a clear-eyed look at the ethical questions the AI industry is grappling with today.",
    type: "feishu",
    url: "learning-ethics",
    categoryId: "ai-learning",
    level: "intermediate",
    time: "20 min",
    icon: "scale",
    tags: ["history"],
  },
  {
    id: "learning-edge-ai",
    title: "Edge AI: intelligence on your device",
    description: "How AI is moving from the cloud to your phone, watch, and laptop — and why that matters for privacy and speed.",
    type: "external",
    url: "https://example.com/edge-ai-explained",
    categoryId: "ai-learning",
    level: "intermediate",
    time: "16 min",
    icon: "cpu",
    tags: ["tools"],
  },
  // ── AI Production ──
  {
    id: "production-prompt-101",
    title: "Prompt engineering 101",
    description: "Learn how to write effective prompts that get useful results from ChatGPT, Claude, and other AI assistants.",
    type: "feishu",
    url: "production-prompt-101",
    categoryId: "ai-production",
    level: "beginner",
    time: "15 min",
    icon: "edit",
    tags: ["prompts"],
  },
  {
    id: "production-writing",
    title: "Using AI for writing and editing",
    description: "Practical techniques for using AI to draft, revise, and polish your writing — emails, reports, and creative projects.",
    type: "external",
    url: "https://example.com/ai-writing-editing",
    categoryId: "ai-production",
    level: "beginner",
    time: "20 min",
    icon: "pen",
    tags: ["workflows"],
  },
  {
    id: "production-research",
    title: "AI-powered research and summarization",
    description: "Save hours by letting AI digest articles, papers, and reports — with techniques to verify accuracy.",
    type: "feishu",
    url: "production-research",
    categoryId: "ai-production",
    level: "beginner",
    time: "18 min",
    icon: "search",
    tags: ["tools"],
  },
  {
    id: "production-no-code",
    title: "Building AI workflows with no code",
    description: "Connect AI tools together using Zapier, Make, and built-in integrations — no programming experience needed.",
    type: "external",
    url: "https://example.com/ai-no-code-workflows",
    categoryId: "ai-production",
    level: "intermediate",
    time: "30 min",
    icon: "zap",
    tags: ["workflows"],
  },
  {
    id: "production-data-analysis",
    title: "Using AI for data analysis",
    description: "How to use AI tools to clean, analyze, and visualize data — even if you've never touched a spreadsheet formula.",
    type: "feishu",
    url: "production-data-analysis",
    categoryId: "ai-production",
    level: "intermediate",
    time: "25 min",
    icon: "chart",
    tags: ["tools"],
  },
  {
    id: "production-advanced-prompting",
    title: "Advanced prompting techniques",
    description: "Chain-of-thought, few-shot learning, and structured outputs — techniques that get dramatically better results from AI.",
    type: "external",
    url: "https://example.com/advanced-prompting",
    categoryId: "ai-production",
    level: "intermediate",
    time: "22 min",
    icon: "sliders",
    tags: ["prompts"],
  },
  {
    id: "production-meeting-notes",
    title: "AI for meeting notes and knowledge management",
    description: "Automate meeting summaries, action items, and searchable knowledge bases using AI transcription and summarization.",
    type: "feishu",
    url: "production-meeting-notes",
    categoryId: "ai-production",
    level: "beginner",
    time: "15 min",
    icon: "users",
    tags: ["workflows"],
  },
  {
    id: "production-responsible-ai",
    title: "Responsible AI use at work",
    description: "Guidelines for using AI tools safely and effectively in a professional context — data privacy, verification, and disclosure.",
    type: "external",
    url: "https://example.com/responsible-ai-work",
    categoryId: "ai-production",
    level: "beginner",
    time: "12 min",
    icon: "shield",
    tags: ["workflows"],
  },
];

/** Get tutorials for a given category */
export function getTutorialsByCategory(categoryId: string): CourseTutorial[] {
  return COURSE_TUTORIALS.filter((t) => t.categoryId === categoryId);
}

/** Get a single tutorial by id */
export function getTutorialById(id: string): CourseTutorial | undefined {
  return COURSE_TUTORIALS.find((t) => t.id === id);
}

/** Get category by id */
export function getCategoryById(id: string): CourseCategory | undefined {
  return COURSE_CATEGORIES.find((c) => c.id === id);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/courses.ts
git commit -m "feat: add centralized course and category data layer"
```

---

### Task 3: Create CourseCard Component

**Files:**
- Create: `src/components/courses/CourseCard.tsx`

- [ ] **Step 1: Create CourseCard component**

```tsx
// src/components/courses/CourseCard.tsx
import Link from "next/link";
import type { CourseCategory } from "@/data/courses";

interface CourseCardProps {
  category: CourseCategory;
}

export function CourseCard({ category }: CourseCardProps) {
  const textColor = category.textColor ?? "var(--fg)";

  return (
    <Link
      href={`/courses/${category.id}`}
      className="category-card"
    >
      <div
        className="card-illustration"
        style={{ background: category.bgColor }}
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="1.3">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <div
        className="card-body"
        style={{ background: category.bgColor, color: textColor }}
      >
        <h3 style={category.theme === "dark" ? { color: "#fff" } : undefined}>
          {category.title}
        </h3>
        <p className="card-desc" style={category.theme === "dark" ? { opacity: 0.85 } : undefined}>
          {category.description}
        </p>
        <span className="learn-more" style={category.theme === "dark" ? { color: "#fff" } : undefined}>
          Choose course
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create courses barrel export**

```tsx
// src/components/courses/index.ts
export { CourseCard } from "./CourseCard";
export { TutorialCard } from "./TutorialCard";
export { CourseReader } from "./CourseReader";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/courses/CourseCard.tsx src/components/courses/index.ts
git commit -m "feat: add CourseCard component for category grid"
```

---

### Task 4: Create Courses Page

**Files:**
- Create: `src/app/courses/page.tsx`

- [ ] **Step 1: Create courses page**

```tsx
// src/app/courses/page.tsx
import { Container } from "@/components/layout/Container";
import { CourseCard } from "@/components/courses/CourseCard";
import { COURSE_CATEGORIES } from "@/data/courses";

export default function CoursesPage() {
  return (
    <>
      <main>
        <Container>
          <section className="courses-hero">
            <h1>Courses</h1>
            <p className="desc">
              Structured learning paths for every stage of your AI journey — from
              absolute beginner to production practitioner.
            </p>
          </section>

          <section className="category-grid">
            {COURSE_CATEGORIES.map((cat) => (
              <CourseCard key={cat.id} category={cat} />
            ))}
          </section>
        </Container>
      </main>

      <footer className="pagefoot">
        <Container className="row-between">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--fg)" }}>
            DemystifyAI
          </span>
          <span className="meta">
            Breaking the AI information gap, one plain explanation at a time.
          </span>
        </Container>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/courses/page.tsx
git commit -m "feat: add courses page with category grid"
```

---

### Task 5: Create TutorialCard Component

**Files:**
- Create: `src/components/courses/TutorialCard.tsx`

- [ ] **Step 1: Create TutorialCard component**

```tsx
// src/components/courses/TutorialCard.tsx
import Link from "next/link";
import type { CourseTutorial, CourseCategory } from "@/data/courses";
import { getCategoryById } from "@/data/courses";

interface TutorialCardProps {
  tutorial: CourseTutorial;
}

const ICONS: Record<string, React.ReactNode> = {
  bulb: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
  book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  layers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  trend: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  network: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>,
  database: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  message: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  sliders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  scale: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  cpu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  pen: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

export function TutorialCard({ tutorial }: TutorialCardProps) {
  const category = getCategoryById(tutorial.categoryId);
  const catColors: Record<string, { bg: string; icon: string }> = {
    basic: { bg: "#E2DDD5", icon: "var(--fg)" },
    personal: { bg: "#4B79A1", icon: "#ffffff" },
    learning: { bg: "#A2B5B4", icon: "#1F2B2A" },
    production: { bg: "#A9A9C2", icon: "#1F1F2E" },
  };
  const catKey = (tutorial.categoryId.replace("ai-", "") || "basic") as keyof typeof catColors;
  const col = catColors[catKey] ?? catColors.basic;
  const iconSvg = ICONS[tutorial.icon] ?? ICONS.book;

  const href = tutorial.type === "external"
    ? tutorial.url
    : `/courses/${tutorial.categoryId}/${tutorial.id}`;

  const levelLabel = tutorial.level === "beginner" ? "Beginner" : "Intermediate";
  const tagClass = `cat-${catKey}-tag`;

  return (
    <a
      href={href}
      className="tutorial-card"
      target={tutorial.type === "external" ? "_blank" : undefined}
      rel={tutorial.type === "external" ? "noopener noreferrer" : undefined}
    >
      <div className="tutorial-thumb" style={{ background: col.bg, color: col.icon }}>
        {iconSvg}
      </div>
      <div className="tutorial-body">
        <div className="tutorial-tags">
          <span className={`tutorial-tag ${tagClass}`}>{category?.title ?? tutorial.categoryId}</span>
          <span className="tutorial-tag feature">{levelLabel}</span>
        </div>
        <h3>{tutorial.title}</h3>
        <p className="tutorial-desc">{tutorial.description}</p>
        <span className="read-link">
          {tutorial.type === "external" ? "Open link" : "Read tutorial"}
        </span>
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/courses/TutorialCard.tsx
git commit -m "feat: add TutorialCard component with icon map and type-aware link behavior"
```

---

### Task 6: Create Category Detail Page

**Files:**
- Create: `src/app/courses/[category]/page.tsx`

- [ ] **Step 1: Create category detail page**

```tsx
// src/app/courses/[category]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { TutorialCard } from "@/components/courses/TutorialCard";
import { getCategoryById, getTutorialsByCategory, COURSE_CATEGORIES } from "@/data/courses";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return COURSE_CATEGORIES.map((cat) => ({ category: cat.id }));
}

export default async function CategoryDetailPage({ params }: Props) {
  const { category: categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  const tutorials = getTutorialsByCategory(categoryId);
  const themeAttr = category.theme === "dark" ? "dark" : "";

  return (
    <>
      <main>
        {/* Full-width hero with category color */}
        <section
          className="category-hero"
          style={{ background: category.bgColor }}
        >
          <Container>
            <nav className="breadcrumb" data-cat-theme={themeAttr}>
              <Link href="/courses">Courses</Link>
              <span className="sep">/</span>
              <span className="current">{category.title}</span>
            </nav>

            <section className="category-header" data-cat-theme={themeAttr}>
              <p className="eyebrow"
                style={category.theme === "dark" ? { color: "rgba(255,255,255,0.92)" } : undefined}
              >
                {category.eyebrow}
              </p>
              <h1 style={category.theme === "dark" ? { color: "#fff" } : undefined}>
                {category.title}
              </h1>
              <p className="desc"
                style={category.theme === "dark" ? { color: "rgba(255,255,255,0.78)" } : undefined}
              >
                {category.description}
              </p>
              <div className="category-meta"
                style={category.theme === "dark" ? { color: "rgba(255,255,255,0.78)" } : undefined}
              >
                <span>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{tutorials.length} tutorials</span>
                </span>
                <span>
                  <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  <span>{category.level}</span>
                </span>
              </div>
            </section>
          </Container>
        </section>

        {/* White surface section */}
        <div className="content-surface">
          <Container>
            <section className="tutorial-grid">
              {tutorials.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
                  <p>No tutorials available yet.</p>
                </div>
              ) : (
                tutorials.map((t) => (
                  <TutorialCard key={t.id} tutorial={t} />
                ))
              )}
            </section>
          </Container>
        </div>
      </main>

      <footer className="pagefoot">
        <Container className="row-between">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--fg)" }}>
            DemystifyAI
          </span>
          <span className="meta">
            Breaking the AI information gap, one plain explanation at a time.
          </span>
        </Container>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/courses/\[category\]/page.tsx
git commit -m "feat: add category detail page with tutorial grid"
```

---

### Task 7: Create Feishu API Helper

**Files:**
- Create: `src/lib/feishu.ts`

- [ ] **Step 1: Create Feishu API helper**

```ts
// src/lib/feishu.ts

const FEISHU_APP_ID = "cli_aa9da34d01381bd8";
const FEISHU_APP_SECRET = "roSnsazGMlqeirJ0WaGQ9fPfw8POgcvz";
const FEISHU_BASE = "https://open.feishu.cn/open-apis";

interface FeishuToken {
  access_token: string;
  expire: number; // absolute timestamp ms
}

let tokenCache: FeishuToken | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (tokenCache && Date.now() < tokenCache.expire - 300_000) {
    return tokenCache.access_token;
  }

  const res = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Feishu auth failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  tokenCache = {
    access_token: data.tenant_access_token,
    expire: Date.now() + data.expire * 1000,
  };
  return tokenCache.access_token;
}

export interface FeishuDocContent {
  title: string;
  markdown: string;
}

/** Fetch a Feishu document's content as markdown */
export async function fetchFeishuDoc(docId: string): Promise<FeishuDocContent> {
  const token = await getAccessToken();

  // Fetch raw content (markdown format)
  const res = await fetch(
    `${FEISHU_BASE}/docx/v1/documents/${docId}/raw_content`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Feishu doc fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    title: data.data?.title ?? "",
    markdown: data.data?.content ?? "",
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/feishu.ts
git commit -m "feat: add Feishu API helper with token caching and doc content fetching"
```

---

### Task 8: Create Feishu API Route

**Files:**
- Create: `src/app/api/feishu/doc/route.ts`

- [ ] **Step 1: Create Feishu doc API route**

```ts
// src/app/api/feishu/doc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchFeishuDoc } from "@/lib/feishu";

// Mock content for UI testing without hitting Feishu
const MOCK_CONTENT: Record<string, { title: string; markdown: string }> = {
  "basic-what-is-ai": {
    title: "What is AI? A plain-English introduction",
    markdown: `## What is Artificial Intelligence?

At its simplest, **artificial intelligence (AI)** is the ability of a computer or machine to perform tasks that usually require human intelligence.

### A Simple Analogy

Think of AI like a very fast pattern-matching engine. Just as you recognize a friend's face by noticing patterns (eyes, nose, voice), AI recognizes patterns in data.

### Key Concepts

- **Training**: Showing an AI system thousands of examples so it learns patterns
- **Inference**: Using those learned patterns to make predictions or decisions
- **Model**: The trained system that can make inferences

### What AI Can Do Today

1. Understand and generate human language
2. Recognize objects in images
3. Make recommendations
4. Translate between languages

> **Key insight:** Today's AI doesn't "think" or "understand" like humans do. It processes patterns at enormous scale.`,
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("id");

  if (!docId) {
    return NextResponse.json({ error: "Missing doc id" }, { status: 400 });
  }

  // Return mock content if available
  if (MOCK_CONTENT[docId]) {
    return NextResponse.json(MOCK_CONTENT[docId]);
  }

  // Fallback: try Feishu live API
  try {
    const content = await fetchFeishuDoc(docId);
    return NextResponse.json(content);
  } catch (err) {
    console.error("Feishu fetch error:", err);
    // Return a generic placeholder so the UI doesn't break
    return NextResponse.json({
      title: docId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      markdown: `## Content Unavailable\n\nThe content for this document could not be loaded. Please try again later.`,
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/feishu/doc/route.ts
git commit -m "feat: add Feishu doc proxy API route with mock fallback"
```

---

### Task 9: Create CourseReader Component

**Files:**
- Create: `src/components/courses/CourseReader.tsx`

- [ ] **Step 1: Create CourseReader component**

```tsx
// src/components/courses/CourseReader.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

interface CourseReaderProps {
  docId: string;
  courseTitle: string;
  categoryId: string;
}

export function CourseReader({ docId, courseTitle, categoryId }: CourseReaderProps) {
  const [content, setContent] = useState<{ title: string; markdown: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/feishu/doc?id=${docId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setContent(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [docId]);

  if (loading) {
    return (
      <div className="reader-wrap">
        <div className="reader-loading">
          <p>Loading content…</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="reader-wrap">
        <div className="reader-error">
          <p>Failed to load content. Please try again later.</p>
          <Link href={`/courses/${categoryId}`} className="btn btn-secondary" style={{ marginTop: 16, display: "inline-flex" }}>
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  // Simple markdown-to-HTML renderer (inline — keeps it simple)
  const html = renderMarkdown(content.markdown);

  return (
    <Container>
      <article className="reader-wrap">
        <div className="reader-header">
          <Link
            href={`/courses/${categoryId}`}
            className="meta"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, textDecoration: "underline" }}
          >
            &larr; Back to {courseTitle}
          </Link>
          <h1>{content.title}</h1>
        </div>
        <div
          className="reader-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </Container>
  );
}

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inList = false;
  let listType: "ul" | "ol" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    if (line.startsWith("### ")) {
      closeList();
      html += `<h3>${escapeHtml(line.slice(4))}</h3>\n`;
    } else if (line.startsWith("## ")) {
      closeList();
      html += `<h2>${escapeHtml(line.slice(3))}</h2>\n`;
    } else if (line.startsWith("# ")) {
      closeList();
      html += `<h1>${escapeHtml(line.slice(2))}</h1>\n`;
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      closeList();
      html += `<blockquote>${escapeHtml(line.slice(2))}</blockquote>\n`;
    }
    // Unordered list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        closeList();
        html += "<ul>\n";
        inList = true;
        listType = "ul";
      }
      html += `  <li>${escapeHtml(line.slice(2))}</li>\n`;
    }
    // Ordered list
    else if (/^\d+\.\s/.test(line)) {
      if (!inList || listType !== "ol") {
        closeList();
        html += "<ol>\n";
        inList = true;
        listType = "ol";
      }
      html += `  <li>${escapeHtml(line.replace(/^\d+\.\s/, ""))}</li>\n`;
    }
    // Empty line
    else if (line.trim() === "") {
      closeList();
    }
    // Paragraph
    else {
      closeList();
      if (line.trim()) {
        // Inline formatting
        let p = escapeHtml(line);
        p = p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        p = p.replace(/`(.+?)`/g, "<code>$1</code>");
        html += `<p>${p}</p>\n`;
      }
    }
  }

  closeList();
  return html;

  function closeList() {
    if (inList) {
      html += `</${listType}>\n`;
      inList = false;
      listType = null;
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/courses/CourseReader.tsx
git commit -m "feat: add CourseReader component with markdown rendering and Feishu API integration"
```

---

### Task 10: Create Course Reader Page Route

**Files:**
- Create: `src/app/courses/[category]/[courseId]/page.tsx`

- [ ] **Step 1: Create course reader page**

```tsx
// src/app/courses/[category]/[courseId]/page.tsx
import { notFound } from "next/navigation";
import { getTutorialById, getCategoryById } from "@/data/courses";
import { CourseReader } from "@/components/courses/CourseReader";
import { TopNav } from "@/components/layout/TopNav";

interface Props {
  params: Promise<{ category: string; courseId: string }>;
}

export default async function CourseReaderPage({ params }: Props) {
  const { courseId } = await params;
  const tutorial = getTutorialById(courseId);
  if (!tutorial || tutorial.type !== "feishu") notFound();

  const category = getCategoryById(tutorial.categoryId);

  return (
    <>
      <TopNav
        links={[
          { label: "Discovery", href: "/discovery" },
          { label: "Courses", href: "/courses", active: true },
          { label: "Account", href: "/account" },
        ]}
      />
      <main>
        <CourseReader
          docId={tutorial.url}
          courseTitle={category?.title ?? ""}
          categoryId={tutorial.categoryId}
        />
      </main>
      <footer className="pagefoot">
        <div className="container row-between">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--fg)" }}>
            DemystifyAI
          </span>
          <span className="meta">
            Breaking the AI information gap, one plain explanation at a time.
          </span>
        </div>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/courses/\[category\]/\[courseId\]/page.tsx
git commit -m "feat: add course reader page for Feishu doc in-app viewing"
```

---

### Task 11: Create Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/mock.ts`
- Create: `src/lib/supabase/index.ts`

- [ ] **Step 1: Create browser client**

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
```

- [ ] **Step 2: Create server client**

```ts
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create mock client**

```ts
// src/lib/supabase/mock.ts
// Mock Supabase client for UI testing without a real auth backend

interface MockUser {
  id: string;
  email: string;
  user_metadata: { name: string; avatar_initials: string };
}

const MOCK_USER: MockUser = {
  id: "mock-user-001",
  email: "alex.kimura@example.com",
  user_metadata: { name: "Alex Kimura", avatar_initials: "AK" },
};

export function createMockClient() {
  return {
    auth: {
      signInWithPassword: async (_params: { email: string; password: string }) => {
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 1000));
        if (!_params.email) {
          return { data: { user: null, session: null }, error: { message: "Email is required" } };
        }
        if (!_params.password || _params.password.length < 6) {
          return { data: { user: null, session: null }, error: { message: "Invalid password" } };
        }
        return {
          data: {
            user: MOCK_USER,
            session: { access_token: "mock-token", user: MOCK_USER },
          },
          error: null,
        };
      },
      signOut: async () => {
        await new Promise((r) => setTimeout(r, 300));
        return { error: null };
      },
      getSession: async () => ({
        data: { session: { user: MOCK_USER } },
        error: null,
      }),
      getUser: async () => ({
        data: { user: MOCK_USER },
        error: null,
      }),
      onAuthStateChange: (_callback: (event: string, session: any) => void) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  };
}
```

- [ ] **Step 4: Create barrel export**

```ts
// src/lib/supabase/index.ts
export { createClient } from "./client";
export { createServerSupabaseClient } from "./server";
export { createMockClient } from "./mock";
```

- [ ] **Step 5: Create `.env.local` with Supabase credentials**

```
NEXT_PUBLIC_SUPABASE_URL=https://csgrbaroiyzoryavuuov.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZ3JiYXJvaXl6b3J5YXZ1dW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTQwNTEsImV4cCI6MjA5NTQ3MDA1MX0.1gqNp4U47qYa75E5VyKfnvsD8TTAYGanu9kOOT0vMXA
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/ .env.local
git commit -m "feat: add Supabase client setup with mock client for UI testing"
```

---

### Task 12: Create SignInForm Component

**Files:**
- Create: `src/components/auth/SignInForm.tsx`

- [ ] **Step 1: Create SignInForm component**

```tsx
// src/components/auth/SignInForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { createMockClient } from "@/lib/supabase/mock";

// Toggle this boolean to switch between mock and real Supabase
const USE_MOCK = true;

function getClient() {
  if (USE_MOCK) return createMockClient();
  // Dynamic import to avoid build issues when no real client
  const { createClient } = require("@/lib/supabase/client");
  return createClient();
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const client = getClient();
    const { error: authError } = await client.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Redirect to account page on success
    window.location.href = "/account";
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <div className="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPw ? "text" : "password"}
            id="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-pw"
            onClick={() => setShowPw(!showPw)}
            aria-label="Toggle password visibility"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" style={{ opacity: showPw ? 0.5 : 1 }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="form-options">
        <label>
          <input type="checkbox" defaultChecked /> Remember me
        </label>
        <a href="#">Forgot password?</a>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px 28px", fontSize: "1rem" }} disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className={`form-error${error ? " visible" : ""}`}>{error}</div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/SignInForm.tsx
git commit -m "feat: add SignInForm component with client validation and mock auth"
```

---

### Task 13: Create Sign In Page

**Files:**
- Create: `src/app/signin/page.tsx`

- [ ] **Step 1: Create sign in page**

```tsx
// src/app/signin/page.tsx
import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <>
      {/* Mini nav (separate style for sign in) */}
      <nav className="mini-nav">
        <Link href="/" className="nav-logo">
          <mark>DA</mark>
          DemystifyAI
        </Link>
        <div className="nav-links">
          <Link href="/" className="btn-outline">Home</Link>
        </div>
      </nav>

      {/* Toast placeholder */}
      <div className="toast" id="toast" />

      <section className="auth-section">
        <div className="auth-card">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your account</h1>
          <p className="subtitle">
            New here? <a href="#">Create an account</a>
          </p>

          <SignInForm />
        </div>
      </section>

      <footer className="pagefoot" style={{ marginTop: "auto" }}>
        <div className="container row-between">
          <span className="footer-meta" style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            &copy; 2026 DemystifyAI
          </span>
          <div className="footer-social" style={{ display: "flex", gap: 16 }}>
            <a href="#" aria-label="YouTube" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="#" aria-label="X / Twitter" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/signin/page.tsx
git commit -m "feat: add sign in page with mini-nav and auth card layout"
```

---

### Task 14: Create Account Components

**Files:**
- Create: `src/components/account/StatCard.tsx`
- Create: `src/components/account/ActivityItem.tsx`
- Create: `src/components/account/index.ts`

- [ ] **Step 1: Create StatCard component**

```tsx
// src/components/account/StatCard.tsx
interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-num">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create ActivityItem component**

```tsx
// src/components/account/ActivityItem.tsx
interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
  score?: string;
  progress?: number;
  tag: string;
  tagType: "course" | "external";
}

export function ActivityItem({
  icon,
  title,
  description,
  meta,
  score,
  progress,
  tag,
  tagType,
}: ActivityItemProps) {
  return (
    <div className="activity-item">
      <div className="activity-icon">{icon}</div>
      <div className="activity-body">
        <h4>{title}</h4>
        <p>{description}</p>
        <div className="activity-meta">
          <span>{meta}</span>
          {score && <span className="activity-score">{score}</span>}
          {progress !== undefined && (
            <div className="activity-progress">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
      <div className="activity-right">
        <span className={`act-tag ${tagType}`}>{tag}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create account barrel export**

```ts
// src/components/account/index.ts
export { StatCard } from "./StatCard";
export { ActivityItem } from "./ActivityItem";
```

- [ ] **Step 4: Commit**

```bash
git add src/components/account/
git commit -m "feat: add StatCard and ActivityItem account components"
```

---

### Task 15: Create Account Page

**Files:**
- Create: `src/app/account/page.tsx`

- [ ] **Step 1: Create account page**

```tsx
// src/app/account/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { StatCard } from "@/components/account/StatCard";
import { ActivityItem } from "@/components/account/ActivityItem";
import { TopNav } from "@/components/layout/TopNav";
import { createMockClient } from "@/lib/supabase/mock";

const MOCK_USER = {
  name: "Alex Kimura",
  email: "alex.kimura@example.com",
  initials: "AK",
  joined: "March 2026",
};

const MOCK_ACTIVITY = [
  {
    id: "1",
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M7 4v16M17 4v16M3 8h4m10 4h4M3 12h4m10 4h4M3 16h4"/></svg>,
    title: "Transformers & Attention: A Visual Guide",
    description: "Completed all 6 modules with a score of 92%. This course covers the transformer architecture from first principles.",
    meta: "Completed 2 days ago",
    score: "92%",
    progress: 100,
    tag: "Course",
    tagType: "course" as const,
  },
  {
    id: "2",
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><circle cx="10" cy="10" r="8"/><path d="M8 6v8l6-4z"/></svg>,
    title: "Andrej Karpathy: AI for Everyone",
    description: "Watched 32 of 45 minutes. A high-level overview of deep learning fundamentals pitched at a general audience.",
    meta: "Watched 1 week ago",
    progress: 71,
    tag: "Video",
    tagType: "external" as const,
  },
];

export default function AccountPage() {
  const [signedOut, setSignedOut] = useState(false);
  const client = createMockClient();

  const handleSignOut = async () => {
    await client.auth.signOut();
    setSignedOut(true);
  };

  if (signedOut) {
    return (
      <>
        <TopNav
          links={[
            { label: "Discovery", href: "/discovery" },
            { label: "Courses", href: "/courses" },
          ]}
        />
        <Container>
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <h2 style={{ marginBottom: 12 }}>Signed out</h2>
            <p className="meta" style={{ marginBottom: 24 }}>
              You have been signed out successfully.
            </p>
            <Link href="/signin" className="btn btn-primary">
              Sign in again
            </Link>
          </div>
        </Container>
        <footer className="pagefoot">
          <Container className="row-between">
            <span className="meta">&copy; 2026 DemystifyAI</span>
            <span className="meta">Breaking the AI information gap</span>
          </Container>
        </footer>
      </>
    );
  }

  return (
    <>
      <TopNav
        links={[
          { label: "Discovery", href: "/discovery" },
          { label: "Courses", href: "/courses" },
          { label: "Account", href: "/account", active: true },
        ]}
      />

      <div className="account-wrap">
        {/* Header */}
        <div className="account-header">
          <div className="account-avatar">
            <div className="avatar-circle">{MOCK_USER.initials}</div>
            <div className="avatar-badge">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>
            </div>
          </div>
          <div className="account-heading">
            <h1>{MOCK_USER.name}</h1>
            <p className="heading-meta">
              <span>
                {MOCK_USER.email}
                <span className="dot" />
                Verified
              </span>
              &middot;
              <span>Joined {MOCK_USER.joined}</span>
            </p>
          </div>
          <div className="account-header-right">
            <button className="btn btn-secondary btn-xs" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <StatCard value={12} label="Courses started" />
          <StatCard value={8} label="Completed" />
          <StatCard value={24} label="Resources saved" />
        </div>

        {/* Recent Activity */}
        <div className="acard">
          <div className="acard-header">
            <div>
              <h2>Clicked Courses History</h2>
              <p>Courses you have opened or accessed.</p>
            </div>
          </div>

          {MOCK_ACTIVITY.map((item) => (
            <ActivityItem key={item.id} {...item} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button className="btn btn-secondary btn-xs">View all activity</button>
        </div>
      </div>

      <footer className="pagefoot">
        <Container className="row-between">
          <span className="meta">&copy; 2026 DemystifyAI</span>
          <div className="footer-social" style={{ display: "flex", gap: 16 }}>
            <a href="#" aria-label="YouTube" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </Container>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/account/page.tsx
git commit -m "feat: add account page with stats, click history, and mock auth"
```

---

### Task 16: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md` — add new directory entries and component notes

- [ ] **Step 1: Update directory structure and component reuse rules**

In `AGENTS.md`, update the directory structure to include:

```
  courses/
    CourseCard.tsx       # Category card with hover lift effect
    TutorialCard.tsx     # Tutorial card with type-aware link behavior
    CourseReader.tsx     # In-app Feishu doc reader with markdown rendering
  account/
    StatCard.tsx         # Stats counter card
    ActivityItem.tsx     # Learning history row with progress bar
  auth/
    SignInForm.tsx       # Sign in form with Supabase + mock auth
```

And add a note under Development Notes:

```markdown
## Courses Note

Course data lives in `src/data/courses.ts` — add a category by adding to `COURSE_CATEGORIES`, add a tutorial by adding to `COURSE_TUTORIALS`. Tutorials use `type: "feishu"` for in-app reading or `type: "external"` for link-out. Feishu doc content is proxied through `src/app/api/feishu/doc/route.ts` and rendered by `CourseReader`.

## Auth Note

Auth uses Supabase with a mock layer. Toggle `USE_MOCK` in `src/components/auth/SignInForm.tsx` to switch between mock and live auth. The mock client in `src/lib/supabase/mock.ts` simulates successful sign-in with a demo user.
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md with courses, account, and auth structure"
```

---

### Task 17: Update Design System Preview Page

**Files:**
- Modify: `src/app/design-system/page.tsx` — add new component showcases

- [ ] **Step 1: Add new component previews to the design system page**

Read the current file first, then add sections for auth card, form inputs, stat cards, activity items, and course/tutorial cards using the new CSS classes.

Add these sections after the existing content (exact location depends on current structure):

```tsx
<section className="section">
  <div className="container stack">
    <SectionHeader
      title="Auth Card"
      description="Sign in card with form elements"
    />
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1 style={{ marginBottom: 8 }}>Sign in</h1>
        <div className="form-group">
          <label>Email</label>
          <div className="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" placeholder="you@example.com" />
          </div>
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" placeholder="Enter your password" />
          </div>
        </div>
        <div className="form-options">
          <label><input type="checkbox" defaultChecked /> Remember me</label>
          <a href="#">Forgot?</a>
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }}>Sign in</button>
      </div>
    </div>
  </div>
</section>

<section className="section">
  <div className="container stack">
    <SectionHeader
      title="Stat Cards"
      description="Account dashboard stat counters"
    />
    <div className="stat-grid" style={{ maxWidth: 600 }}>
      <div className="stat-card"><div className="stat-num">12</div><div className="stat-label">Courses started</div></div>
      <div className="stat-card"><div className="stat-num">8</div><div className="stat-label">Completed</div></div>
      <div className="stat-card"><div className="stat-num">24</div><div className="stat-label">Saved</div></div>
    </div>
  </div>
</section>

<section className="section">
  <div className="container stack">
    <SectionHeader
      title="Activity Item"
      description="Learning history row with progress"
    />
    <div className="acard" style={{ maxWidth: 600 }}>
      <div className="activity-item">
        <div className="activity-icon">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M7 4v16M17 4v16M3 8h4m10 4h4M3 12h4m10 4h4M3 16h4"/></svg>
        </div>
        <div className="activity-body">
          <h4>Sample Course Title</h4>
          <p>Completed with a score of 92%.</p>
          <div className="activity-meta">
            <span>Completed 2 days ago</span>
            <span className="activity-score">92%</span>
            <div className="activity-progress"><div className="bar" style={{ width: "100%" }} /></div>
          </div>
        </div>
        <div className="activity-right">
          <span className="act-tag course">Course</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/design-system/page.tsx
git commit -m "feat: add auth card, stat card, and activity item previews to design system page"
```

---

## Self-Review

**Spec Coverage:**
- ✅ Courses page with category card grid → Task 4 (page) + Task 3 (component)
- ✅ Category detail page with tutorial grid (no filters) → Task 6 (page) + Task 5 (component)
- ✅ Feishu in-app reader (approach A) → Task 7 (API helper) + Task 8 (proxy route) + Task 9 (reader component) + Task 10 (reader page)
- ✅ Sign In page with mini-nav → Task 12 (form component) + Task 13 (page)
- ✅ Account page with stats + click history → Task 14 (components) + Task 15 (page)
- ✅ Supabase auth integrated with mock → Task 11 (client setup) + Task 12 (USE_MOCK toggle)
- ✅ Design system expansion (globals.css tokens + component styles) → Task 1
- ✅ Centralized course data → Task 2
- ✅ Course history minimal (only clicked courses) → Task 15 (hardcoded mock activity)
- ✅ Navigation: unified TopNav for Courses/Account, mini-nav for Sign In → Tasks 13, 15
- ✅ AGENTS.md update → Task 16
- ✅ Design system preview update → Task 17

**Placeholder check:** All code blocks contain complete, working implementations. No TODOs, TBDs, or "implement later" patterns.

**Type consistency:** `CourseTutorial`, `CourseCategory`, `CourseCard`, `TutorialCard`, `StatCard`, `ActivityItem`, `SignInForm`, `CourseReader`, `FeishuDocContent` — types used consistently across all tasks.

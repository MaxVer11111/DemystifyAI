# DemystifyAI — Frontend

Breaking the AI information gap. A curated, jargon-free platform that helps non-technical people stay current on AI developments.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Custom CSS with design tokens (no CSS-in-JS, no Tailwind utilities in components)
- **Fonts**: Playfair Display (display), Inter (body), JetBrains Mono (mono) — loaded from Google Fonts
- **Language**: TypeScript

## Directory Structure

```
src/
  app/
    globals.css           # All design tokens, base styles, and component CSS classes
    layout.tsx            # Root layout: fonts, metadata, html shell
    page.tsx              # Home / launcher page
    landing/
      page.tsx            # Marketing landing page
    discovery/
      page.tsx            # Main product page (feed, people, skills, library)
    design-system/
      page.tsx            # Design system preview (DEV ONLY)
  components/
    layout/               # Layout primitives
      Container.tsx        #   Max-width content wrapper
      Section.tsx          #   Vertical section with padding
      TopNav.tsx           #   Sticky navigation bar with blur backdrop
      Footer.tsx           #   Page footer
      LogoMark.tsx         #   DA monogram + wordmark
      SectionHeader.tsx    #   Section title + description + optional right slot
    ui/                   # Reusable UI atoms
      Button.tsx           #   primary | secondary | ghost, default | xs, arrow variant
      Card.tsx             #   default | flat surface container
      Pill.tsx             #   Accent-colored mono uppercase badge
      Tag.tsx              #   Muted border tag
      Avatar.tsx           #   Colored circle with initials (sm | default | lg)
      TabBar.tsx           #   Client component: tab navigation bar
      FilterChip.tsx       #   Pill-shaped filter toggle
      LevelBadge.tsx       #   Beginner/Intermediate level indicator
      Shimmer.tsx          #   Animated loading placeholder
      SyncBadge.tsx        #   Green/orange sync status dot + text
      FeedScore.tsx        #   Score badge (e.g. 9/10)
      Eyebrow.tsx          #   Mono uppercase category label
      Lead.tsx             #   Larger muted intro paragraph
      Meta.tsx             #   Mono muted metadata text
    discovery/            # Domain components for the Discovery page
      FeedItem.tsx         #   Single feed post row
      FeedSummary.tsx      #   Daily AI feed summary card
      PersonCard.tsx       #   Person profile card with bio + tags
      SkillCard.tsx        #   Agent skill/tool card with stars + tags
      LibraryCard.tsx      #   Resource library card (podcast/show)
      AppCard.tsx          #   Recommended app card (icon + description)
      CompanyChip.tsx      #   Company recommendation chip
      data.tsx             #   PEOPLE, SKILLS, LIBRARY, FEED_POSTS, FEED_SUMMARY datasets
    landing/              # Domain components for the Landing page
      HeroSection.tsx      #   Hero with eyebrow, title, lead, and CTA slot
      Feature.tsx          #   Icon + title + description feature card
      ValuePropCard.tsx     #   Numbered value proposition card
    index/                # Domain components for the Home/Launcher page
      LauncherCard.tsx     #   Icon + title + description link card
  courses/
    CourseCard.tsx        # Category card with hover lift effect
    TutorialCard.tsx      # Tutorial card with type-aware link behavior
    CourseReader.tsx      # In-app Feishu doc reader with markdown rendering
  account/
    StatCard.tsx          # Stats counter card
    ActivityItem.tsx      # Learning history row with progress bar
  auth/
    SignInForm.tsx        # Sign in form with Supabase + mock auth
```

## Design System Architecture

All styles live in `src/app/globals.css` — a single source of truth. There are no CSS modules, no Tailwind utility classes used in components, and no inline `<style>` blocks.

### Tokens (CSS custom properties on `:root`)

**Colors** — warm paper-like oklch palette:
- `--bg`, `--surface`, `--fg`, `--muted`, `--border`, `--accent`
- `--accent-soft`, `--accent-container`, `--fg-soft` (derived via `color-mix`)

**Typography** — three font families + type scale:
- `--font-display` (Playfair Display), `--font-body` (Inter), `--font-mono` (JetBrains Mono)
- `--fs-h1` through `--fs-xs` (clamp-responsive headings, fixed body sizes)

**Spacing** — semantic gap scale:
- `--gap-xs`(8) `--gap-sm`(12) `--gap-md`(20) `--gap-lg`(32) `--gap-xl`(56) `--gap-2xl`(80)

**Layout**:
- `--container` (1120px), `--gutter` (32px)
- `--radius` (10px), `--radius-lg` (16px), `--radius-pill` (999px)

### Class naming convention

Flat, single-class BEM-lite: `.btn`, `.btn-primary`, `.card`, `.card-flat`, `.feed-item`, `.person-card`, etc. All classes are defined in globals.css. Components apply these classes via `className`.

### Responsive breakpoints

- `@media (max-width: 600px)` — mobile: collapse nav, reduce gutter, stack feed items
- `@media (max-width: 700px)` — collapse some grids to 1-col
- `@media (max-width: 920px)` — collapse multi-col grids to 1-col
- `@media (max-width: 1100px)` — reduce 4-col grids to 2-col

## Component Reuse Rules

### 1. Always check existing components first

Before writing any UI element, scan `src/components/ui/` and `src/components/layout/`. There is a high chance a reusable component already exists.

### 2. Extend via props before creating new components

Existing components accept `className` for style overrides and typed props for semantic variants. Examples:

```tsx
// Extend with className
<Button variant="primary" className="my-custom-spacing">...</Button>

// Use existing size/variant props
<Avatar size="lg" initials="AK" background="oklch(...)" color="#fff" />
```

### 3. When to add a new component

Only create a new component file when:
- The visual pattern appears in 2+ distinct pages or sections
- The element has unique structural markup (not just a style variation)
- An existing component cannot be extended via `variant`, `size`, or `className` props

### 4. When to add new CSS

- **New design token**: Add to `:root` in globals.css if it's a genuinely new semantic value
- **New component class**: Add in the appropriate section of globals.css
- **One-off style**: Use inline `style={{}}` for truly one-off adjustments (e.g., `style={{ maxWidth: 600 }}`)
- **Never**: Create a `.module.css` file or use Tailwind utility classes in components

### 5. "Client" vs "Server" components

Only add `"use client"` when the component uses:
- `useState`, `useEffect`, or other React hooks
- Event handlers (`onClick`, `onChange`) that manage local state
- Browser APIs

Default to server components. Currently only `TabBar` and the `discovery/page.tsx` are client components.

## Development Notes

- The design system preview page at `/design-system` is for development reference only — it renders all colors, fonts, and components in one view
- Data for the discovery page (people, skills, library) lives in `src/components/discovery/data.tsx` as typed constants — in production these would come from the FastAPI backend
- Fonts are loaded via `<link>` tags in `layout.tsx`, not via `next/font` — this avoids build-time font processing for Google Fonts
- The Tailwind CSS v4 postcss plugin is installed but not used — all styling goes through `globals.css`. Do not add Tailwind utility classes to components
- This project follows Next.js 16 conventions — refer to `node_modules/next/dist/docs/` for any API questions

## Courses Note

Course data lives in `src/data/courses.ts` — add a category by adding to `COURSE_CATEGORIES`, add a tutorial by adding to `COURSE_TUTORIALS`. Tutorials use `type: "feishu"` for in-app reading or `type: "external"` for link-out. Feishu doc content is proxied through `src/app/api/feishu/doc/route.ts` and rendered by `CourseReader`.

## Auth Note

Auth uses Supabase with a mock layer. Toggle `USE_MOCK` in `src/components/auth/SignInForm.tsx` to switch between mock and live auth. The mock client in `src/lib/supabase/mock.ts` simulates successful sign-in with a demo user.

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

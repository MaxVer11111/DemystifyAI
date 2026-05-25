import { Container, Section, SectionHeader, Footer, LogoMark } from "@/components/layout";
import { Button, Card, Pill, Tag, Avatar, Eyebrow, Lead, Meta, FeedScore, LevelBadge, Shimmer, SyncBadge } from "@/components/ui";
import { FilterChip } from "@/components/ui/FilterChip";
import { PersonCard, SkillCard, LibraryCard, AppCard, PEOPLE, SKILLS, LIBRARY } from "@/components/discovery";

export default function DesignSystemPage() {
  if (process.env.NODE_ENV !== "development") {
    return (
      <Container>
        <Section>
          <h1>Design System Preview</h1>
          <p className="lead">This page is only available in development mode.</p>
        </Section>
      </Container>
    );
  }

  return (
    <>
      <main>
        <Section>
          <Container>
            <h1>Design System Preview</h1>
            <p className="lead" style={{ marginTop: 8 }}>
              A comprehensive showcase of all design tokens and reusable components.
            </p>
          </Container>
        </Section>

        {/* ─── Colors ─────────────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Colors</h2>
            <div className="grid-3" style={{ alignItems: "start" }}>
              {[
                { name: "Background", var: "--bg", color: "var(--bg)" },
                { name: "Surface", var: "--surface", color: "var(--surface)" },
                { name: "Foreground", var: "--fg", color: "var(--fg)" },
                { name: "Muted", var: "--muted", color: "var(--muted)" },
                { name: "Border", var: "--border", color: "var(--border)" },
                { name: "Accent", var: "--accent", color: "var(--accent)" },
                { name: "Accent Soft", var: "--accent-soft", color: "var(--accent-soft)" },
                { name: "FG Soft", var: "--fg-soft", color: "var(--fg-soft)" },
              ].map((c) => (
                <div key={c.var} className="card" style={{ padding: 16 }}>
                  <div
                    style={{
                      width: "100%",
                      height: 60,
                      borderRadius: "var(--radius)",
                      background: c.color,
                      border: c.var === "--surface" || c.var === "--bg" ? "1px solid var(--border)" : undefined,
                      marginBottom: 10,
                    }}
                  />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{c.var}</div>
                  <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 2 }}>{c.name}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* ─── Typography ─────────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Typography</h2>
            <div className="stack">
              <div>
                <Meta>H1 / --fs-h1</Meta>
                <h1>The quick brown fox</h1>
              </div>
              <div>
                <Meta>H2 / --fs-h2</Meta>
                <h2>The quick brown fox jumps over</h2>
              </div>
              <div>
                <Meta>H3 / --fs-h3</Meta>
                <h3>The quick brown fox jumps over the lazy dog</h3>
              </div>
              <div>
                <Meta>Lead / --fs-lead</Meta>
                <Lead>
                  The quick brown fox jumps over the lazy dog. This is a lead paragraph used for introductory text that
                  needs emphasis.
                </Lead>
              </div>
              <div>
                <Meta>Body / --fs-body</Meta>
                <p style={{ maxWidth: "56ch" }}>
                  The quick brown fox jumps over the lazy dog. This is body text used for the main reading content
                  throughout the application.
                </p>
              </div>
              <div>
                <Meta>Meta / --fs-meta</Meta>
                <Meta>The quick brown fox · 2h ago</Meta>
              </div>
              <div>
                <Meta>Eyebrow</Meta>
                <Eyebrow>Category Label · Mono Uppercase</Eyebrow>
              </div>
              <div>
                <Meta>Num (tabular-nums)</Meta>
                <span className="num">123,456,789</span>
              </div>
            </div>
          </Container>
        </Section>

        {/* ─── Buttons ────────────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Buttons</h2>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" size="xs">XS Primary</Button>
              <Button variant="secondary" size="xs">XS Secondary</Button>
              <Button variant="ghost" size="xs">XS Ghost</Button>
              <Button variant="primary" arrow>Arrow Button</Button>
            </div>
          </Container>
        </Section>

        {/* ─── Cards ──────────────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Cards</h2>
            <div className="grid-3">
              <Card>
                <h3>Default Card</h3>
                <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
                  Standard card with surface background, border, and hover effect.
                </p>
              </Card>
              <Card>
                <h3>Card with Tags</h3>
                <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
                  Cards can contain any content.
                </p>
                <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                  <Tag>Tag one</Tag>
                  <Tag>Tag two</Tag>
                </div>
              </Card>
              <Card variant="flat">
                <h3>Flat Card</h3>
                <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
                  Flat card has no background or border. Useful for embedded sections.
                </p>
              </Card>
            </div>
          </Container>
        </Section>

        {/* ─── Pills, Tags & Badges ───────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Pills, Tags &amp; Badges</h2>
            <div className="stack">
              <div className="row" style={{ flexWrap: "wrap" }}>
                <Pill>Pill</Pill>
                <Pill>AI Education</Pill>
                <Pill>Research</Pill>
              </div>
              <div className="row" style={{ flexWrap: "wrap" }}>
                <Tag>Tag</Tag>
                <Tag>OpenAI</Tag>
                <Tag>Product</Tag>
                <Tag>Design</Tag>
              </div>
              <div className="row" style={{ flexWrap: "wrap" }}>
                <LevelBadge level="Beginner" />
                <LevelBadge level="Intermediate" />
                <FeedScore score="9/10" />
              </div>
            </div>
          </Container>
        </Section>

        {/* ─── Avatars ────────────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Avatars</h2>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <Avatar initials="AK" background="oklch(75% 0.06 220)" color="oklch(35% 0.06 220)" />
              <Avatar initials="LR" background="oklch(72% 0.07 50)" color="oklch(30% 0.07 50)" />
              <Avatar initials="DS" background="oklch(50% 0.12 240)" color="#fff" />
              <Avatar initials="SM" background="oklch(75% 0.06 220)" color="oklch(35% 0.06 220)" size="sm" />
              <Avatar initials="LG" background="oklch(75% 0.06 220)" color="oklch(35% 0.06 220)" size="lg" />
            </div>
          </Container>
        </Section>

        {/* ─── Filter Chips ───────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Filter Chips</h2>
            <div className="filter-bar">
              <FilterChip active>All</FilterChip>
              <FilterChip>General AI</FilterChip>
              <FilterChip>Product & Startups</FilterChip>
              <FilterChip>Technology</FilterChip>
            </div>
          </Container>
        </Section>

        {/* ─── Forms ──────────────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Forms &amp; Input</h2>
            <Card>
              <div className="stack">
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                    Text Input
                  </label>
                  <input
                    type="text"
                    placeholder="Placeholder text..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--fg)",
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  <Button variant="primary">Submit</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            </Card>
          </Container>
        </Section>

        {/* ─── Status Indicators ──────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Status Indicators</h2>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <SyncBadge />
              <SyncBadge syncedText="Synced 8h ago" stale />
            </div>
          </Container>
        </Section>

        {/* ─── Loading ────────────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Loading / Shimmer</h2>
            <div className="grid-2">
              <Shimmer height={16} />
              <Shimmer height={16} />
              <Shimmer height={40} />
              <Shimmer height={40} />
              <Shimmer height={100} />
            </div>
          </Container>
        </Section>

        {/* ─── Logo Mark ──────────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Logo Mark</h2>
            <div className="row" style={{ flexWrap: "wrap", gap: "var(--gap-lg)" }}>
              <div>
                <Meta>Small (nav)</Meta>
                <div style={{ marginTop: 8 }}>
                  <LogoMark href="#" />
                </div>
              </div>
              <div>
                <Meta>Large (hero)</Meta>
                <div style={{ marginTop: 8 }}>
                  <div className="cg-monogram-lg">DA</div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* ─── Page Components ────────────────────────────────────────── */}
        <Section>
          <Container>
            <h2 style={{ marginBottom: "var(--gap-md)" }}>Page Components</h2>

            <div style={{ marginTop: "var(--gap-lg)" }}>
              <h3 style={{ marginBottom: "var(--gap-sm)" }}>PersonCard</h3>
              <div className="people-grid">
                <PersonCard person={PEOPLE[0]} />
                <PersonCard person={PEOPLE[3]} />
              </div>
            </div>

            <div style={{ marginTop: "var(--gap-lg)" }}>
              <h3 style={{ marginBottom: "var(--gap-sm)" }}>SkillCard</h3>
              <div className="grid-2">
                <SkillCard skill={SKILLS[0]} />
                <SkillCard skill={SKILLS[1]} />
              </div>
            </div>

            <div style={{ marginTop: "var(--gap-lg)" }}>
              <h3 style={{ marginBottom: "var(--gap-sm)" }}>LibraryCard</h3>
              <div className="grid-2">
                <LibraryCard item={LIBRARY[0]} />
                <LibraryCard item={LIBRARY[5]} />
              </div>
            </div>

            <div style={{ marginTop: "var(--gap-lg)" }}>
              <h3 style={{ marginBottom: "var(--gap-sm)" }}>AppCard</h3>
              <div className="app-grid">
                <AppCard
                  name="ima"
                  domain="Learning"
                  description="AI-powered knowledge base that helps you capture, organize, and retrieve what you learn."
                  href="#"
                  icon={
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="3" y="4" width="22" height="18" rx="2" fill="#4A90D9" stroke="#3A70B0" strokeWidth="1.2" />
                      <path d="M8 10h12M8 14h8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="21" cy="21" r="5" fill="#52B36E" stroke="#fff" strokeWidth="1.2" />
                      <path d="M19 21.5l1.5 1.5 3-3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />
                <AppCard
                  name="Claude Code"
                  domain="Coding"
                  description="Agentic coding tool that understands your entire codebase."
                  href="#"
                  icon={
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="4" y="5" width="20" height="18" rx="3" fill="#1E1E2E" stroke="#3A3A50" strokeWidth="1.2" />
                      <text x="8" y="17" fontFamily="monospace" fontSize="12" fill="#52B36E">$ _</text>
                    </svg>
                  }
                />
              </div>
            </div>

            <div style={{ marginTop: "var(--gap-lg)" }}>
              <h3 style={{ marginBottom: "var(--gap-sm)" }}>SectionHeader</h3>
              <SectionHeader
                title="Section Title"
                description="A supporting description that explains what this section contains and why the user should care about it."
              >
                <SyncBadge />
              </SectionHeader>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNav, Footer, Section, SectionHeader } from "@/components/layout";
import { TabBar } from "@/components/ui";
import {
  FeedItem,
  FeedSummary,
  PersonCard,
  SkillCard,
  LibraryCard,
  AppCard,
  FEED_SUMMARY,
  PEOPLE,
  SKILLS,
  LIBRARY,
  CATEGORY_EMOJI,
} from "@/components/discovery";
import type { FeedArticle, AtAGlance } from "@/components/discovery/data";
import { FilterChip } from "@/components/ui/FilterChip";

const TABS = [
  { key: "feed", label: "⚡ Live Feed" },
  { key: "people", label: "◎ People" },
  { key: "skills", label: "◇ Skills" },
  { key: "library", label: "◈ Library" },
];

const LIBRARY_CATEGORIES = [
  "All",
  "General AI",
  "Product & Startups",
  "AI Labs & Research",
  "Technology",
];

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState("feed");
  const [libFilter, setLibFilter] = useState("All");

  // Feed data state
  const [feedArticles, setFeedArticles] = useState<FeedArticle[]>([]);
  const [atAGlance, setAtAGlance] = useState<AtAGlance | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    if (activeTab !== "feed") return;

    let cancelled = false;

    async function loadFeed() {
      setFeedLoading(true);
      setFeedError(null);
      try {
        const res = await fetch("/api/feed");
        if (!res.ok) throw new Error(`Feed API error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setFeedArticles(data.articles || []);
          setAtAGlance(data.at_a_glance || null);
        }
      } catch (err) {
        if (!cancelled) {
          setFeedError(err instanceof Error ? err.message : "Failed to load feed");
        }
      } finally {
        if (!cancelled) {
          setFeedLoading(false);
        }
      }
    }

    loadFeed();
    return () => { cancelled = true; };
  }, [activeTab]);

  const categories = useMemo(() => {
    const cats = feedArticles
      .map((a) => a.source_category)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    return cats;
  }, [feedArticles]);

  const filteredArticles = categoryFilter === "All"
    ? feedArticles
    : feedArticles.filter((a) => a.source_category === categoryFilter);

  const filteredLibrary =
    libFilter === "All" ? LIBRARY : LIBRARY.filter((item) => item.category === libFilter);

  return (
    <>
      <TopNav
        links={[
          { label: "Discovery", href: "/discovery", active: true },
          { label: "Courses", href: "#", disabled: true },
          { label: "Account", href: "#", disabled: true },
        ]}
      />

      <div className="discovery-layout">
        <aside className="discovery-sidebar">
          <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} vertical />
        </aside>

        <main className="discovery-content">
          {/* Feed Tab */}
          {activeTab === "feed" && (
            <Section>
              <SectionHeader
                title="Live AI Feed"
                description="Posts from top AI voices, filtered and summarized for clarity."
              />

              {feedError && (
                <div
                  className="card"
                  style={{
                    marginBottom: "var(--gap-lg)",
                    borderColor: "oklch(55% 0.14 20)",
                    background: "color-mix(in oklch, oklch(55% 0.14 20) 8%, transparent)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14 }}>
                    Could not load live feed: {feedError}.{" "}
                    <button
                      onClick={() => setActiveTab("feed")}
                      className="btn btn-ghost btn-xs"
                      style={{ color: "var(--accent)" }}
                    >
                      Retry
                    </button>
                  </p>
                </div>
              )}

              {feedLoading && (
                <>
                  <div className="feed-summary">
                    <div className="summary-body">
                      <div className="shimmer" style={{ width: "30%", height: 16, marginBottom: 12 }} />
                      <div className="shimmer" style={{ width: "100%", height: 20, marginBottom: 4 }} />
                      <div className="shimmer" style={{ width: "100%", height: 20, marginBottom: 4 }} />
                      <div className="shimmer" style={{ width: "70%", height: 20 }} />
                    </div>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="feed-item">
                      <div className="shimmer" style={{ width: "100%", height: 80, borderRadius: "var(--radius)" }} />
                    </div>
                  ))}
                </>
              )}

              {!feedLoading && !feedError && (
                <>
                  {atAGlance && <FeedSummary data={atAGlance} />}

                  {/* Category filter */}
                  {categories.length > 1 && (
                    <div className="filter-bar" style={{ marginBottom: "var(--gap-md)" }}>
                      <FilterChip
                        active={categoryFilter === "All"}
                        onClick={() => setCategoryFilter("All")}
                      >
                        All
                      </FilterChip>
                      {categories.map((cat) => (
                        <FilterChip
                          key={cat}
                          active={categoryFilter === cat}
                          onClick={() => setCategoryFilter(cat)}
                        >
                          {CATEGORY_EMOJI[cat] || ""} {cat}
                        </FilterChip>
                      ))}
                    </div>
                  )}

                  {filteredArticles.length === 0 && (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px 0" }}>
                      {categoryFilter === "All"
                        ? "No articles yet. The pipeline runs daily at 7am."
                        : "No articles in this category."}
                    </p>
                  )}

                  {filteredArticles.map((article) => (
                    <FeedItem key={article.url} article={article} />
                  ))}
                </>
              )}
            </Section>
          )}

          {/* People Tab */}
          {activeTab === "people" && (
            <Section>
              <SectionHeader
                title="People to Follow"
                description="A hand-picked starter pack of the voices shaping AI — educators, researchers, product leaders, and builders. Each one chosen because they consistently make the complex feel clear."
              />

              <div style={{ marginBottom: "var(--gap-md)" }}>
                <p className="eyebrow">AI Educators & Researchers</p>
              </div>
              <div className="people-grid">
                {PEOPLE.map((person) => (
                  <PersonCard key={person.handle} person={person} />
                ))}
              </div>
            </Section>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <Section>
              <SectionHeader
                title="Agentic Skills & Tools"
                description="The best open-source agent skills, frameworks, and developer tools — ranked by community adoption and explained in plain language."
              />
              <div className="grid-2">
                {SKILLS.map((skill) => (
                  <SkillCard key={skill.url} skill={skill} />
                ))}
              </div>
            </Section>
          )}

          {/* Library Tab */}
          {activeTab === "library" && (
            <Section>
              <SectionHeader
                title="Resource Library"
                description="Curated podcasts and shows — evaluated for clarity, trustworthiness, and relevance. Every entry here has been listened to and recommended by a real person."
              />

              <div className="filter-bar">
                {LIBRARY_CATEGORIES.map((cat) => (
                  <FilterChip
                    key={cat}
                    active={libFilter === cat}
                    onClick={() => setLibFilter(cat)}
                  >
                    {cat}
                  </FilterChip>
                ))}
              </div>

              <div className="grid-2">
                {filteredLibrary.map((item) => (
                  <LibraryCard key={item.title} item={item} />
                ))}
              </div>

              {/* Recommended Apps */}
              <div className="app-module">
                <SectionHeader
                  title="Recommended Apps"
                  description="Tools we use and recommend for learning, designing, and building with AI."
                />
                <div className="app-grid">
                  <AppCard
                    name="ima"
                    domain="Learning"
                    description="AI-powered knowledge base that helps you capture, organize, and retrieve what you learn — like a second brain that actually works."
                    href="https://ima.qq.com"
                    icon={
                      <img src="/images/ima.jpg" alt="ima" width={28} height={28} style={{ borderRadius: 4 }} />
                    }
                  />
                  <AppCard
                    name="Open Design"
                    domain="Design"
                    description="AI-native design tool that turns your ideas into production-ready interfaces — from wireframe to polished prototype in minutes."
                    href="https://opendesign.ai"
                    icon={
                      <img src="/images/opendesign.png" alt="Open Design" width={28} height={28} style={{ borderRadius: 4 }} />
                    }
                  />
                  <AppCard
                    name="Claude Code"
                    domain="Coding"
                    description="Agentic coding tool that understands your entire codebase — refactors, debugs, and builds features directly in your terminal."
                    href="https://claude.ai/code"
                    icon={
                      <img src="/images/claude-code.png" alt="Claude Code" width={28} height={28} style={{ borderRadius: 4 }} />
                    }
                  />
                </div>
              </div>
            </Section>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}

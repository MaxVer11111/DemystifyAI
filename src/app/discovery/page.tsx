"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNav, Footer, Section, SectionHeader } from "@/components/layout";
import { TabBar } from "@/components/ui";
import {
  FeedPostItem,
  FeedSummary,
  PersonCard,
  SkillCard,
  LibraryCard,
  AppCard,
  FEED_SUMMARY,
  PEOPLE,
  SKILLS,
  LIBRARY,
  xPostToFeedPost,
} from "@/components/discovery";
import type { AtAGlance, Person, XPost } from "@/components/discovery/data";
import { FilterChip } from "@/components/ui/FilterChip";
import { AnimatedPanel, AnimatedInView } from "@/components/animations";

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
  const [peopleFilter, setPeopleFilter] = useState("All");

  // Feed data state
  const [xPosts, setXPosts] = useState<XPost[]>([]);
  const [atAGlance, setAtAGlance] = useState<AtAGlance | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [handleFilter, setHandleFilter] = useState("All");

  const personMap = useMemo(() => {
    const map: Record<string, Person> = {};
    for (const p of PEOPLE) {
      map[p.handle] = p;
    }
    return map;
  }, []);

  useEffect(() => {
    if (activeTab !== "feed") return;

    let cancelled = false;

    async function loadFeed() {
      setFeedLoading(true);
      setFeedError(null);
      try {
        const res = await fetch("/api/feed");
        if (!res.ok) throw new Error(`Feed API error: ${res.status}`);
        const data: { posts: XPost[]; at_a_glance: AtAGlance | null } = await res.json();
        if (!cancelled) {
          setXPosts(data.posts || []);
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

  const handles = useMemo(() => {
    const hs = [...new Set(xPosts.map((p) => p.handle))].sort();
    return hs;
  }, [xPosts]);

  const filteredPosts = handleFilter === "All"
    ? xPosts
    : xPosts.filter((p) => p.handle === handleFilter);

  const filteredLibrary =
    libFilter === "All" ? LIBRARY : LIBRARY.filter((item) => item.category === libFilter);

  const peopleCategories = useMemo(() => {
    const cats = [...new Set(PEOPLE.map((p) => p.category))].sort();
    return ["All", ...cats];
  }, []);

  const filteredPeople =
    peopleFilter === "All" ? PEOPLE : PEOPLE.filter((p) => p.category === peopleFilter);

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
            <AnimatedPanel key="feed" direction="left">
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
                      <div className="shimmer" style={{ width: "100%", height: 100, borderRadius: "var(--radius)" }} />
                    </div>
                  ))}
                </>
              )}

              {!feedLoading && !feedError && (
                <>
                  {atAGlance && <FeedSummary data={atAGlance} />}

                  {/* User filter */}
                  {handles.length > 1 && (
                    <div className="filter-bar" style={{ marginBottom: "var(--gap-md)" }}>
                      <FilterChip
                        active={handleFilter === "All"}
                        onClick={() => setHandleFilter("All")}
                        layoutId="x-filter"
                      >
                        All
                      </FilterChip>
                      {handles.map((handle) => {
                        const person = personMap[handle];
                        return (
                          <FilterChip
                            key={handle}
                            active={handleFilter === handle}
                            onClick={() => setHandleFilter(handle)}
                            layoutId="x-filter"
                          >
                            {person?.initials} {person?.name || handle}
                          </FilterChip>
                        );
                      })}
                    </div>
                  )}

                  {filteredPosts.length === 0 && (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px 0" }}>
                      {handleFilter === "All"
                        ? "No posts yet. The pipeline runs daily at 7am."
                        : "No posts from this account."}
                    </p>
                  )}

                  {filteredPosts.map((post, i) => (
                    <AnimatedInView key={post.id} delay={i * 0.05}>
                      <FeedPostItem post={xPostToFeedPost(post, personMap)} />
                    </AnimatedInView>
                  ))}
                </>
              )}
            </Section>
            </AnimatedPanel>
          )}

          {/* People Tab */}
          {activeTab === "people" && (
            <AnimatedPanel key="people" direction="left">
            <Section>
              <SectionHeader
                title="People to Follow"
                description="A hand-picked starter pack of the voices shaping AI — educators, researchers, product leaders, and builders. Each one chosen because they consistently make the complex feel clear."
              />

              <div className="filter-bar">
                {peopleCategories.map((cat) => (
                  <FilterChip
                    key={cat}
                    active={peopleFilter === cat}
                    onClick={() => setPeopleFilter(cat)}
                    layoutId="people-filter"
                  >
                    {cat}
                  </FilterChip>
                ))}
              </div>

              <div className="people-grid" key={peopleFilter}>
                {filteredPeople.map((person, i) => (
                  <AnimatedInView key={person.handle} delay={i * 0.05}>
                    <PersonCard person={person} />
                  </AnimatedInView>
                ))}
              </div>
            </Section>
            </AnimatedPanel>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <AnimatedPanel key="skills" direction="left">
            <Section>
              <SectionHeader
                title="Agentic Skills & Tools"
                description="The best open-source agent skills, frameworks, and developer tools — ranked by community adoption and explained in plain language."
              />
              <div className="grid-2">
                {SKILLS.map((skill, i) => (
                  <AnimatedInView key={skill.url} delay={i * 0.05}>
                    <SkillCard skill={skill} />
                  </AnimatedInView>
                ))}
              </div>
            </Section>
            </AnimatedPanel>
          )}

          {/* Library Tab */}
          {activeTab === "library" && (
            <AnimatedPanel key="library" direction="left">
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
                    layoutId="library-filter"
                  >
                    {cat}
                  </FilterChip>
                ))}
              </div>

              <div className="grid-2">
                {filteredLibrary.map((item, i) => (
                  <AnimatedInView key={item.title} delay={i * 0.05}>
                    <LibraryCard item={item} />
                  </AnimatedInView>
                ))}
              </div>

              {/* Recommended Apps */}
              <div className="app-module">
                <SectionHeader
                  title="Recommended Apps"
                  description="Tools we use and recommend for learning, designing, and building with AI."
                />
                <div className="app-grid">
                  <AnimatedInView delay={0}>
                  <AppCard
                    name="ima"
                    domain="Learning"
                    description="AI-powered knowledge base that helps you capture, organize, and retrieve what you learn — like a second brain that actually works."
                    href="https://ima.qq.com"
                    icon={
                      <img src="/images/ima.jpg" alt="ima" width={28} height={28} style={{ borderRadius: 4 }} />
                    }
                  />
                  </AnimatedInView>
                  <AnimatedInView delay={0.05}>
                  <AppCard
                    name="Open Design"
                    domain="Design"
                    description="AI-native design tool that turns your ideas into production-ready interfaces — from wireframe to polished prototype in minutes."
                    href="https://opendesign.ai"
                    icon={
                      <img src="/images/opendesign.png" alt="Open Design" width={28} height={28} style={{ borderRadius: 4 }} />
                    }
                  />
                  </AnimatedInView>
                  <AnimatedInView delay={0.1}>
                  <AppCard
                    name="Claude Code"
                    domain="Coding"
                    description="Agentic coding tool that understands your entire codebase — refactors, debugs, and builds features directly in your terminal."
                    href="https://claude.ai/code"
                    icon={
                      <img src="/images/claude-code.png" alt="Claude Code" width={28} height={28} style={{ borderRadius: 4 }} />
                    }
                  />
                  </AnimatedInView>
                </div>
              </div>
            </Section>
            </AnimatedPanel>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}

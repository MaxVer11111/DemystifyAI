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

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

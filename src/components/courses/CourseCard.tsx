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

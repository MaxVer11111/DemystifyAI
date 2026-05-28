// src/app/courses/CourseReader.tsx
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
      .then((data: unknown) => {
        const d = data as { error?: string; title?: string; markdown?: string };
        if (d.error) throw new Error(d.error);
        setContent(d as { title: string; markdown: string });
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

  if (error) {
    return (
      <div className="reader-wrap">
        <div className="reader-error">
          <p>Failed to load content. Please try again later.</p>
          <Link href={`/courses/${categoryId}`} className="btn btn-secondary btn-xs">
            ← Back to category
          </Link>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="reader-wrap">
      <div className="reader-header">
        <Link
          href={`/courses/${categoryId}`}
          className="btn btn-ghost btn-xs"
          style={{ marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          ← Back to {courseTitle}
        </Link>
        <h1>{content.title}</h1>
      </div>
      <div className="reader-content markdown-body">
        {content.markdown.split("\n").map((line, i) => {
          if (line.startsWith("# ")) return <h1 key={i}>{line.slice(2)}</h1>;
          if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
          if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
          if (line.startsWith("#### ")) return <h4 key={i}>{line.slice(5)}</h4>;
          if (line.startsWith("- ")) return <li key={i} style={{ marginBottom: 4 }}>{line.slice(2)}</li>;
          if (line.startsWith("> ")) return <blockquote key={i}>{line.slice(2)}</blockquote>;
          if (/^\d+\.\s/.test(line)) return <li key={i} style={{ marginBottom: 4 }}>{line.replace(/^\d+\.\s/, "")}</li>;
          if (line.trim() === "") return <br key={i} />;
          return <p key={i}>{line}</p>;
        })}
      </div>
    </div>
  );
}

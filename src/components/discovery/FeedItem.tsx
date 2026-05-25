"use client";

import { useState } from "react";
import type { FeedArticle } from "./data";

interface FeedItemProps {
  article: FeedArticle;
}

const TAG_COLORS: Record<string, string> = {
  "Model Release":   "oklch(65% 0.14 30)",
  "Research":        "oklch(60% 0.12 260)",
  "Product Launch":  "oklch(62% 0.13 160)",
  "Policy & Safety": "oklch(60% 0.08 50)",
  "Industry News":   "oklch(55% 0.06 240)",
  "Tooling":         "oklch(62% 0.10 300)",
  "AI & Society":    "oklch(60% 0.08 10)",
  "Coding & Building": "oklch(58% 0.12 200)",
};

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const hours = Math.round(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function FeedItem({ article }: FeedItemProps) {
  const [expanded, setExpanded] = useState(false);
  const tags = parseTags(article.tags);

  return (
    <div className="feed-item">
      <div className="feed-article">
        <div className="feed-article-meta">
          <span className="feed-article-source">{article.source_name}</span>
          {article.author && (
            <>
              <span className="feed-article-sep">·</span>
              <span className="feed-article-author">{article.author}</span>
            </>
          )}
          <span className="feed-article-sep">·</span>
          <span className="feed-article-time">{formatDate(article.published_at)}</span>
        </div>

        {tags.length > 0 && (
          <div className="feed-article-tags">
            {tags.map((tag) => (
              <span
                key={tag}
                className="feed-article-tag"
                style={{ background: TAG_COLORS[tag] || "var(--muted)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="feed-article-title">{article.title}</h3>

        {article.ai_summary && (
          <p className="feed-article-summary">{article.ai_summary}</p>
        )}

        {article.raw_content && (
          <>
            <button
              className="btn btn-ghost btn-xs feed-article-toggle"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "▲ Hide full article" : "▼ Read full article"}
            </button>

            {expanded && (
              <div className="feed-article-full">
                <p>{article.raw_content}</p>
              </div>
            )}
          </>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="feed-article-link"
        >
          Read original →
        </a>
      </div>
    </div>
  );
}

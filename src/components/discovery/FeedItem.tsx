"use client";

import { useState } from "react";
import { GlowEffect, MagneticLink } from "@/components/animations";
import type { FeedArticle } from "./data";
import { CATEGORY_EMOJI } from "./data";

interface FeedItemProps {
  article: FeedArticle;
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
  const category = article.source_category;
  const emoji = CATEGORY_EMOJI[category] || "";

  return (
    <GlowEffect>
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

          {category && (
            <div className="feed-article-tags">
              <span className="feed-article-tag feed-article-tag-category">
                {emoji} {category}
              </span>
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

          <MagneticLink>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="feed-article-link"
            >
              Read original →
            </a>
          </MagneticLink>
        </div>
      </div>
    </GlowEffect>
  );
}

"use client";

import { useState } from "react";
import { GlowEffect, MagneticLink } from "@/components/animations";
import { Pill } from "@/components/ui";
import type { FeedPost } from "./data";

interface FeedPostItemProps {
  post: FeedPost;
}

export function FeedPostItem({ post }: FeedPostItemProps) {
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  return (
    <GlowEffect>
      <div className="feed-item">
        <div className="x-post">
          {/* Avatar + author row */}
          <div className="x-post-header">
            <span
              className="x-post-avatar"
              style={{ background: post.bg, color: post.fg }}
            >
              {post.initials}
            </span>
            <div className="x-post-author">
              <span className="x-post-name">{post.name}</span>
              <span className="x-post-handle">{post.handle} · {post.time}</span>
            </div>
          </div>

          {/* Content */}
          <p className="x-post-content">{post.content}</p>

          {/* Category */}
          {post.category && (
            <div style={{ marginTop: "var(--gap-xs)" }}>
              <Pill>{post.category}</Pill>
            </div>
          )}

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="x-post-images">
              {post.images.slice(0, 4).map((img, i) => (
                !imgError[i] && (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className={`x-post-image x-post-image-${Math.min(post.images!.length, 4)}`}
                    onError={() => setImgError(prev => ({ ...prev, [i]: true }))}
                    loading="lazy"
                  />
                )
              ))}
            </div>
          )}

          {/* Engagement + actions row */}
          <div className="x-post-actions">
            <span className="x-post-action">
              ♥ {post.likes}
            </span>
            <span className="x-post-action">
              ⟳ {post.reposts}
            </span>
            {post.url && (
              <MagneticLink>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="x-post-link"
                >
                  View on X →
                </a>
              </MagneticLink>
            )}
          </div>
        </div>
      </div>
    </GlowEffect>
  );
}

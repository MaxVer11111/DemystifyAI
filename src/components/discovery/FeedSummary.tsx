import { Eyebrow } from "../ui/Eyebrow";
import type { AtAGlance } from "./data";

interface FeedSummaryProps {
  data: AtAGlance;
}

export function FeedSummary({ data }: FeedSummaryProps) {
  return (
    <div className="feed-summary">
      <div className="summary-body">
        <Eyebrow>At a Glance</Eyebrow>
        <h3>{data.title}</h3>
        {data.themes.length > 0 && (
          <div className="summary-themes">
            {data.themes.map((theme) => (
              <span key={theme} className="summary-theme">
                {theme}
              </span>
            ))}
          </div>
        )}
        {data.top_posts.length > 0 && (
          <div className="summary-top">
            Top posts:{" "}
            {data.top_posts.map((p, i) => (
              <span key={p.name}>
                {i > 0 && i < data.top_posts.length - 1 && ", "}
                {i === data.top_posts.length - 1 && data.top_posts.length > 1 && ", and "}
                <strong>{p.name}</strong> ({p.desc})
              </span>
            ))}{" "}
            — top stories from today's feed.
          </div>
        )}
      </div>
    </div>
  );
}

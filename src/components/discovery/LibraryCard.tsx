import { Tag } from "../ui/Tag";
import { LevelBadge } from "../ui/LevelBadge";
import type { LibraryItem } from "./data";

interface LibraryCardProps {
  item: LibraryItem;
}

export function LibraryCard({ item }: LibraryCardProps) {
  return (
    <div className="lib-card" style={{ marginBottom: "var(--gap-sm)" }}>
      <div className="lib-icon">{item.type}</div>
      <div className="lib-info">
        <div className="lib-title">{item.title}</div>
        <div className="lib-creator">{item.creator}</div>
        <div className="lib-desc">{item.desc}</div>
        <div className="lib-meta">
          {item.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          <LevelBadge level={item.level} />
        </div>
      </div>
    </div>
  );
}

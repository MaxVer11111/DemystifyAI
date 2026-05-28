// src/components/account/ActivityItem.tsx
interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
  score?: string;
  progress?: number;
  tag: string;
  tagType: "course" | "external";
}

export function ActivityItem({
  icon,
  title,
  description,
  meta,
  score,
  progress,
  tag,
  tagType,
}: ActivityItemProps) {
  return (
    <div className="activity-item">
      <div className="activity-icon">{icon}</div>
      <div className="activity-body">
        <h4>{title}</h4>
        <p>{description}</p>
        <div className="activity-meta">
          <span>{meta}</span>
          {score && <span className="activity-score">{score}</span>}
          {progress !== undefined && (
            <div className="activity-progress">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
      <div className="activity-right">
        <span className={`act-tag ${tagType}`}>{tag}</span>
      </div>
    </div>
  );
}

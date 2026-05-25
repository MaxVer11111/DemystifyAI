type Level = "Beginner" | "Intermediate";

interface LevelBadgeProps {
  level: Level;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const levelClass = level === "Beginner" ? "level-beginner" : "level-intermediate";
  return <span className={`level-badge ${levelClass}`}>{level}</span>;
}

interface SyncBadgeProps {
  syncedText?: string;
  stale?: boolean;
}

export function SyncBadge({ syncedText = "Synced 2h ago", stale = false }: SyncBadgeProps) {
  return (
    <span className="sync-badge">
      <span className={`sync-dot${stale ? " stale" : ""}`} />
      {syncedText}
    </span>
  );
}

interface FeedScoreProps {
  score: string;
}

export function FeedScore({ score }: FeedScoreProps) {
  return <span className="feed-score">{score}</span>;
}

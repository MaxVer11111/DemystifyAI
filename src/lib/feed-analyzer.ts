import { analyzePost, type AnalysisResult } from "./deepseek";

export interface RawPost {
  id: string;
  author: string;
  handle: string;
  text: string;
  likes: number;
  reposts: number;
  created_at: string;
}

export interface ProcessedPost {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  content: string;
  original: string;
  plain_summary: string | undefined;
  score: number;
  tags: string[];
  likes: number;
  reposts: number;
  posted_at: string;
}

type AnalyzeFn = (text: string, author: string) => Promise<AnalysisResult | null>;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

const MAX_CONCURRENCY = 4;

export async function runFeedPipeline(
  posts: RawPost[],
  minScore: number,
  analyzeFn?: AnalyzeFn
): Promise<ProcessedPost[]> {
  const analyze = analyzeFn || analyzePost;
  const results: ProcessedPost[] = [];

  for (let i = 0; i < posts.length; i += MAX_CONCURRENCY) {
    const batch = posts.slice(i, i + MAX_CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (post) => {
        const analysis = await analyze(post.text, post.author);
        return { post, analysis };
      })
    );

    for (const result of settled) {
      if (result.status === "rejected") {
        console.error("[feed-analyzer] batch item failed:", result.reason);
        continue;
      }

      const { post, analysis } = result.value;
      if (!analysis) continue;
      if (!analysis.relevant) continue;
      if (analysis.score < minScore) continue;

      const content = analysis.keep_original
        ? post.text
        : (analysis.plain_summary || post.text);

      results.push({
        id: post.id,
        handle: post.handle,
        name: post.author,
        avatar: getInitials(post.author),
        content,
        original: post.text,
        plain_summary: analysis.plain_summary,
        score: analysis.score,
        tags: analysis.tags,
        likes: post.likes,
        reposts: post.reposts,
        posted_at: post.created_at,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

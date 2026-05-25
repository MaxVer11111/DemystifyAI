import { describe, test, expect, vi } from "vitest";
import type { AnalysisResult } from "../deepseek";
import { runFeedPipeline, type RawPost } from "../feed-analyzer";

const samplePosts: RawPost[] = [
  {
    id: "post-1", author: "Andrej Karpathy", handle: "@karpathy",
    text: "LLMs from scratch tutorial updated.",
    likes: 2400, reposts: 892, created_at: "2026-05-25T10:00:00Z",
  },
  {
    id: "post-2", author: "Meme Bot", handle: "@memebot",
    text: "lol check out this cat",
    likes: 50, reposts: 3, created_at: "2026-05-25T09:00:00Z",
  },
  {
    id: "post-3", author: "OpenAI", handle: "@OpenAI",
    text: "GPT-5 released today.",
    likes: 12400, reposts: 5600, created_at: "2026-05-25T12:00:00Z",
  },
];

function makeAnalysis(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    relevant: true, score: 8, plain_summary: "A summary.",
    tags: ["News"], keep_original: true,
    ...overrides,
  };
}

describe("runFeedPipeline", () => {
  test("processes all posts and returns sorted by score", async () => {
    const mockAnalyze = vi.fn()
      .mockResolvedValueOnce(makeAnalysis({ score: 8 }))
      .mockResolvedValueOnce(makeAnalysis({ score: 3 }))
      .mockResolvedValueOnce(makeAnalysis({ score: 10 }));

    const result = await runFeedPipeline(samplePosts, 6, mockAnalyze);

    expect(result).toHaveLength(2);
    expect(result[0].score).toBe(10);
    expect(result[1].score).toBe(8);
    expect(result[0].name).toBe("OpenAI");
  });

  test("filters out posts with score below minScore", async () => {
    const mockAnalyze = vi.fn()
      .mockResolvedValueOnce(makeAnalysis({ score: 5 }))
      .mockResolvedValueOnce(makeAnalysis({ score: 9 }));

    const result = await runFeedPipeline(samplePosts.slice(0, 2), 7, mockAnalyze);

    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(9);
  });

  test("filters out posts where relevant is false", async () => {
    const mockAnalyze = vi.fn()
      .mockResolvedValueOnce(makeAnalysis({ relevant: false, score: 8 }))
      .mockResolvedValueOnce(makeAnalysis({ relevant: true, score: 7 }));

    const result = await runFeedPipeline(samplePosts.slice(0, 2), 1, mockAnalyze);

    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(7);
  });

  test("skips posts where analysis returns null", async () => {
    const mockAnalyze = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeAnalysis({ score: 7 }));

    const result = await runFeedPipeline(samplePosts.slice(0, 2), 1, mockAnalyze);

    expect(result).toHaveLength(1);
  });

  test("returns empty array for empty input", async () => {
    const result = await runFeedPipeline([], 6, vi.fn());
    expect(result).toEqual([]);
  });

  test("generates avatar initials from author name", async () => {
    const mockAnalyze = vi.fn().mockResolvedValueOnce(makeAnalysis({ score: 8 }));
    const [result] = await runFeedPipeline([samplePosts[0]], 1, mockAnalyze);
    expect(result!.avatar).toBe("AK");
  });

  test("preserves original post fields in processed output", async () => {
    const mockAnalyze = vi.fn().mockResolvedValueOnce(makeAnalysis({
      score: 8,
      plain_summary: "Custom summary.",
      tags: ["Research", "Education"],
      keep_original: false,
    }));

    const [result] = await runFeedPipeline([samplePosts[0]], 1, mockAnalyze);

    expect(result!.id).toBe("post-1");
    expect(result!.handle).toBe("@karpathy");
    expect(result!.original).toBe(samplePosts[0].text);
    expect(result!.plain_summary).toBe("Custom summary.");
    expect(result!.tags).toEqual(["Research", "Education"]);
    expect(result!.likes).toBe(2400);
    expect(result!.reposts).toBe(892);
  });

  test("uses original text when keep_original is true", async () => {
    const mockAnalyze = vi.fn().mockResolvedValueOnce(makeAnalysis({
      score: 8, keep_original: true,
    }));

    const [result] = await runFeedPipeline([samplePosts[0]], 1, mockAnalyze);
    expect(result!.content).toBe(samplePosts[0].text);
  });

  test("uses summary as content when keep_original is false", async () => {
    const mockAnalyze = vi.fn().mockResolvedValueOnce(makeAnalysis({
      score: 8, plain_summary: "Short summary.", keep_original: false,
    }));

    const [result] = await runFeedPipeline([samplePosts[0]], 1, mockAnalyze);
    expect(result!.content).toBe("Short summary.");
  });
});

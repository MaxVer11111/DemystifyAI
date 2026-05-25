/**
 * Data fetching layer for the DemystifyAI frontend.
 *
 * In development / without a backend: returns mock data from
 * components/discovery/data.tsx.
 *
 * With a FastAPI backend running: fetches from the backend URL
 * configured via NEXT_PUBLIC_API_BASE_URL.
 */

import type { FeedPost } from "@/components/discovery/data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface FeedResponse {
  posts: FeedPost[];
  count: number;
  last_sync: string | null;
}

interface FeedStatusResponse {
  last_sync: string | null;
  status: string;
}

export async function fetchFeed(params?: {
  handle?: string;
  limit?: number;
  offset?: number;
  minScore?: number;
}): Promise<FeedResponse> {
  if (!API_BASE) {
    // No backend configured — use Next.js API route as fallback
    const url = new URL("/api/feed", window.location.origin);
    if (params?.handle) url.searchParams.set("handle", params.handle);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.offset) url.searchParams.set("offset", String(params.offset));
    if (params?.minScore) url.searchParams.set("min_score", String(params.minScore));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Feed API error: ${res.status}`);
    return res.json();
  }

  // FastAPI backend configured
  const url = new URL("/api/feed", API_BASE);
  if (params?.handle) url.searchParams.set("handle", params.handle);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));
  if (params?.minScore) url.searchParams.set("min_score", String(params.minScore));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Feed API error: ${res.status}`);
  return res.json();
}

export async function fetchFeedStatus(): Promise<FeedStatusResponse> {
  const base = API_BASE || window.location.origin;
  const url = `${base}/api/feed/status`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Status API error: ${res.status}`);
  return res.json();
}

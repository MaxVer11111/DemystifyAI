import { NextResponse } from "next/server";
import feedData from "@/data/feed.json";

export async function GET() {
  try {
    return NextResponse.json(feedData);
  } catch {
    return NextResponse.json({
      generated_at: new Date().toISOString(),
      articles: [],
      at_a_glance: null,
    });
  }
}

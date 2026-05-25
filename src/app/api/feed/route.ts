import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), "src", "data", "feed.json");
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      generated_at: new Date().toISOString(),
      articles: [],
      at_a_glance: null,
    });
  }
}

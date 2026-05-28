// src/app/api/feishu/doc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchFeishuDoc } from "@/lib/feishu";

// Mock content for UI testing without hitting Feishu
const MOCK_CONTENT: Record<string, { title: string; markdown: string }> = {
  "basic-what-is-ai": {
    title: "What is AI? A plain-English introduction",
    markdown: `## What is Artificial Intelligence?

At its simplest, **artificial intelligence (AI)** is the ability of a computer or machine to perform tasks that usually require human intelligence.

### A Simple Analogy

Think of AI like a very fast pattern-matching engine. Just as you recognize a friend's face by noticing patterns (eyes, nose, voice), AI recognizes patterns in data.

### Key Concepts

- **Training**: Showing an AI system thousands of examples so it learns patterns
- **Inference**: Using those learned patterns to make predictions or decisions
- **Model**: The trained system that can make inferences

### What AI Can Do Today

1. Understand and generate human language
2. Recognize objects in images
3. Make recommendations
4. Translate between languages

> **Key insight:** Today's AI doesn't "think" or "understand" like humans do. It processes patterns at enormous scale.`,
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("id");

  if (!docId) {
    return NextResponse.json({ error: "Missing doc id" }, { status: 400 });
  }

  // Return mock content if available
  if (MOCK_CONTENT[docId]) {
    return NextResponse.json(MOCK_CONTENT[docId]);
  }

  // Fallback: try Feishu live API
  try {
    const content = await fetchFeishuDoc(docId);
    return NextResponse.json(content);
  } catch (err) {
    console.error("Feishu fetch error:", err);
    // Return a generic placeholder so the UI doesn't break
    return NextResponse.json({
      title: docId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      markdown: `## Content Unavailable\n\nThe content for this document could not be loaded. Please try again later.`,
    });
  }
}

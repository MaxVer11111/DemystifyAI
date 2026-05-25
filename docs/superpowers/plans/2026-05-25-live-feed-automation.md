# Live Feed Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated RSS-to-feed pipeline that fetches AI newsletters, summarizes them with DeepSeek, and displays them in an expandable card UI.

**Architecture:** Python script (triggered by GitHub Actions cron at 7am daily) fetches RSS feeds via feedparser, calls DeepSeek API for summarization + tagging, writes to SQLite, and exports a JSON file for the Next.js frontend. Frontend reads the JSON via an API route and renders article-style expandable cards.

**Tech Stack:** Python (feedparser, openai SDK for DeepSeek), SQLite, GitHub Actions, Next.js 16 API routes, React 19

---
## Phase 1: Data Pipeline (Python)

### Task 1: Scripts directory structure + dependencies

**Files:**
- Create: `scripts/requirements.txt`
- Create: `scripts/.env.example`

- [ ] **Step 1: Create `scripts/requirements.txt`**

```txt
feedparser>=6.0.11
openai>=1.0.0
python-dotenv>=1.0.0
requests>=2.31.0
```

- [ ] **Step 2: Create `scripts/.env.example`**

```env
# DeepSeek API configuration
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# SQLite database path (relative to scripts/ directory)
DB_PATH=./data/feed.db

# JSON export path for frontend dev
EXPORT_PATH=../src/data/feed.json

# Sources configuration
SOURCES_PATH=./sources.json
```

- [ ] **Step 3: Commit**

```bash
git add scripts/requirements.txt scripts/.env.example
git commit -m "feat: add Python script dependencies for feed pipeline"
```

---

### Task 2: Source configuration

**Files:**
- Create: `scripts/sources.json`

- [ ] **Step 1: Create `scripts/sources.json`**

MVP starts with the confirmed RSS feed. Other sources will be added as their RSS feeds are confirmed.

```json
[
  {
    "id": "ainews",
    "name": "AINews by smol.ai",
    "site_url": "https://news.smol.ai",
    "feed_url": "https://news.smol.ai/rss.xml",
    "type": "rss",
    "icon_url": null,
    "enabled": true
  }
]
```

Each source entry:
- `id`: unique slug used as DB primary key reference
- `name`: display name in the frontend
- `site_url`: link to the source homepage (used for "Read original" button)
- `feed_url`: RSS feed URL
- `type`: `"rss"` for now, extensible to `"rsshub"` or `"scrape"` later
- `icon_url`: null for MVP — frontend will show source name as a text badge
- `enabled`: toggle without deleting the config

- [ ] **Step 2: Commit**

```bash
git add scripts/sources.json
git commit -m "feat: add RSS source config for feed pipeline"
```

---

### Task 3: SQLite database module

**Files:**
- Create: `scripts/db.py`

- [ ] **Step 1: Create `scripts/db.py`**

```python
"""
SQLite database module for the feed pipeline.
Handles schema creation, insert, and query operations.
"""

import sqlite3
import os
from datetime import datetime
from typing import Optional


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS articles (
    id          TEXT PRIMARY KEY,          -- hash of source + URL for dedup
    source_id   TEXT NOT NULL,             -- references sources.json id
    source_name TEXT NOT NULL,
    title       TEXT NOT NULL,
    author      TEXT,
    url         TEXT NOT NULL UNIQUE,      -- URL dedup
    published_at TEXT,                     -- ISO 8601
    raw_content TEXT,                      -- full article text, AI-untouched
    ai_summary  TEXT,                      -- DeepSeek 1-3 sentence summary
    tags        TEXT,                      -- JSON array of tag strings
    fetched_at  TEXT NOT NULL,             -- ISO 8601 when we fetched this
    processed   INTEGER DEFAULT 0          -- 0 = pending, 1 = summarized
);

CREATE TABLE IF NOT EXISTS at_a_glance (
    date        TEXT PRIMARY KEY,          -- YYYY-MM-DD
    title       TEXT NOT NULL,
    themes      TEXT NOT NULL,             -- JSON array
    top_posts   TEXT NOT NULL,             -- JSON array of {name, desc}
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fetch_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id   TEXT NOT NULL,
    fetched_at  TEXT NOT NULL,
    new_count   INTEGER DEFAULT 0,
    error       TEXT
);
"""


def get_db_path() -> str:
    path = os.environ.get("DB_PATH", "./data/feed.db")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    """Create tables if they don't exist."""
    conn = get_connection()
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    conn.close()


def article_exists(url: str) -> bool:
    """Check if an article URL has already been stored (URL-level dedup)."""
    conn = get_connection()
    row = conn.execute("SELECT 1 FROM articles WHERE url = ?", (url,)).fetchone()
    conn.close()
    return row is not None


def insert_article(
    source_id: str,
    source_name: str,
    title: str,
    author: Optional[str],
    url: str,
    published_at: Optional[str],
    raw_content: str,
) -> str:
    """Insert a new article. Returns the article ID."""
    import hashlib
    article_id = hashlib.sha256(url.encode()).hexdigest()[:16]
    now = datetime.utcnow().isoformat()

    conn = get_connection()
    conn.execute(
        """INSERT OR IGNORE INTO articles
           (id, source_id, source_name, title, author, url, published_at, raw_content, fetched_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (article_id, source_id, source_name, title, author, url, published_at, raw_content, now),
    )
    conn.commit()
    conn.close()
    return article_id


def update_summary(article_id: str, summary: str, tags: list[str]) -> None:
    """Store the AI-generated summary and tags for an article."""
    conn = get_connection()
    import json
    conn.execute(
        "UPDATE articles SET ai_summary = ?, tags = ?, processed = 1 WHERE id = ?",
        (summary, json.dumps(tags), article_id),
    )
    conn.commit()
    conn.close()


def get_unprocessed_articles() -> list[dict]:
    """Get articles that haven't been summarized yet."""
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, title, raw_content, source_name FROM articles WHERE processed = 0"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_recent_articles(limit: int = 50) -> list[dict]:
    """Get most recent processed articles for JSON export."""
    conn = get_connection()
    rows = conn.execute(
        """SELECT source_name, title, author, url, published_at,
                  ai_summary, tags, raw_content
           FROM articles
           WHERE processed = 1
           ORDER BY published_at DESC
           LIMIT ?""",
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_at_a_glance(date_str: str, title: str, themes: list[str], top_posts: list[dict]) -> None:
    """Save or update the At a Glance entry for a given date."""
    import json
    now = datetime.utcnow().isoformat()
    conn = get_connection()
    conn.execute(
        """INSERT OR REPLACE INTO at_a_glance (date, title, themes, top_posts, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (date_str, title, json.dumps(themes), json.dumps(top_posts), now),
    )
    conn.commit()
    conn.close()


def get_at_a_glance(date_str: str) -> Optional[dict]:
    """Get the At a Glance entry for a given date."""
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM at_a_glance WHERE date = ?", (date_str,)
    ).fetchone()
    conn.close()
    if row:
        import json
        d = dict(row)
        d["themes"] = json.loads(d["themes"])
        d["top_posts"] = json.loads(d["top_posts"])
        return d
    return None


def log_fetch(source_id: str, new_count: int, error: Optional[str] = None) -> None:
    """Log a fetch operation."""
    now = datetime.utcnow().isoformat()
    conn = get_connection()
    conn.execute(
        "INSERT INTO fetch_log (source_id, fetched_at, new_count, error) VALUES (?, ?, ?, ?)",
        (source_id, now, new_count, error),
    )
    conn.commit()
    conn.close()
```

- [ ] **Step 2: Commit**

```bash
git add scripts/db.py
git commit -m "feat: add SQLite database module for feed pipeline"
```

---

### Task 4: RSS fetcher module

**Files:**
- Create: `scripts/fetcher.py`

- [ ] **Step 1: Create `scripts/fetcher.py`**

```python
"""
RSS feed fetcher module.
Handles fetching and parsing RSS feeds using feedparser.
"""

import feedparser
import re
from datetime import datetime
from typing import Optional


def fetch_feed(feed_url: str) -> Optional[list[dict]]:
    """
    Fetch and parse an RSS feed.
    Returns a list of article dicts with consistent fields, or None on failure.
    """
    parsed = feedparser.parse(feed_url)

    if parsed.bozo and not parsed.entries:
        return None

    articles = []
    for entry in parsed.entries:
        title = _get(entry, "title", "Untitled")
        url = _get_link(entry)
        author = _get_author(entry)
        published = _get_published(entry)
        content = _get_content(entry)

        if not url:
            continue

        articles.append({
            "title": _clean_html(title),
            "url": url,
            "author": author,
            "published_at": published,
            "raw_content": _clean_html(content),
        })

    return articles


def _get(entry, key: str, default: str = "") -> str:
    val = getattr(entry, key, None)
    if val is None and key in entry:
        val = entry[key]
    return val if val else default


def _get_link(entry) -> Optional[str]:
    if hasattr(entry, "link") and entry.link:
        return entry.link
    if "link" in entry:
        return entry["link"]
    for link in getattr(entry, "links", []):
        if link.get("rel") == "alternate":
            return link.get("href")
    return None


def _get_author(entry) -> Optional[str]:
    if hasattr(entry, "author") and entry.author:
        return entry.author
    if "author" in entry:
        return entry["author"]
    return None


def _get_published(entry) -> Optional[str]:
    published = getattr(entry, "published_parsed", None) or getattr(entry, "updated_parsed", None)
    if published:
        try:
            from time import mktime
            return datetime.fromtimestamp(mktime(published)).isoformat()
        except Exception:
            pass

    raw = getattr(entry, "published", "") or getattr(entry, "updated", "")
    return raw if raw else None


def _get_content(entry) -> str:
    """Extract the full content from an RSS entry."""
    if hasattr(entry, "content") and entry.content:
        combined = " ".join(c.get("value", "") for c in entry.content)
        if combined.strip():
            return combined

    if hasattr(entry, "summary") and entry.summary:
        return entry.summary

    if hasattr(entry, "description") and entry.description:
        return entry.description

    if "content:encoded" in entry:
        return entry.get("content:encoded", "")

    return ""


def _clean_html(text: str) -> str:
    """Strip HTML tags from text."""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
```

- [ ] **Step 2: Commit**

```bash
git add scripts/fetcher.py
git commit -m "feat: add RSS feed fetcher module"
```

---

### Task 5: DeepSeek summarizer module

**Files:**
- Create: `scripts/summarizer.py`

- [ ] **Step 1: Create `scripts/summarizer.py`**

```python
"""
DeepSeek API integration for article summarization and tagging.
Uses OpenAI-compatible SDK to call DeepSeek API.
"""

import os
import json
from openai import OpenAI
from typing import Optional


TAG_POOL = [
    "Model Release",
    "Research",
    "Product Launch",
    "Policy & Safety",
    "Industry News",
    "Tooling",
    "AI & Society",
    "Coding & Building",
]

SUMMARY_PROMPT = """You are an AI assistant that helps summarize AI news articles for a non-technical audience.

For the article below, produce a JSON response with exactly these fields:
{
  "summary": "1-3 sentence plain-language summary. Assume the reader is curious but not a technical expert. Focus on WHAT happened and WHY it matters.",
  "tags": ["Tag1", "Tag2"]
}

Rules for tags:
- Choose 1-3 tags from this list: {tag_pool}
- Only use tags from the list. Do not invent new tags.
- Choose the most specific tags that apply.

Article title: {title}
Article text:
{content}
"""

AT_A_GLANCE_PROMPT = """You are an AI assistant that summarizes a daily collection of AI news articles.

Given the list of today's articles (with titles and summaries), produce a JSON response with exactly these fields:
{{
  "title": "A single sentence summarizing today's feed overall. Start with 'Today's feed...'. Example: 'Today's feed spans frontier model releases, open-source breakthroughs, and product launches.'",
  "themes": ["Theme1", "Theme2", "Theme3"],
  "topPosts": [
    {{"name": "Article Title 1", "desc": "Very brief reason it's important"}},
    {{"name": "Article Title 2", "desc": "Very brief reason it's important"}}
  ]
}}

Rules:
- themes: 2-5 broad themes that capture what today's articles are about
- topPosts: 2-4 most important articles, sorted by importance. Keep desc under 10 words.
- Be honest — if nothing stands out, just list the top articles without hyperbole.

Today's articles ({article_count} total):
{articles}
"""


def _get_client() -> OpenAI:
    return OpenAI(
        api_key=os.environ["DEEPSEEK_API_KEY"],
        base_url=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )


def summarize_article(title: str, content: str) -> Optional[dict]:
    """
    Call DeepSeek to generate a summary and tags for a single article.
    Returns {"summary": str, "tags": list[str]} or None on failure.
    """
    if not content.strip():
        return None

    # Truncate content to avoid token limits (~8000 chars should be ~2000 tokens)
    truncated = content[:8000]

    try:
        client = _get_client()
        model = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
        prompt = SUMMARY_PROMPT.format(tag_pool=json.dumps(TAG_POOL), title=title, content=truncated)

        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        text = resp.choices[0].message.content.strip()
        result = json.loads(text)

        # Validate tags
        tags = [t for t in result.get("tags", []) if t in TAG_POOL]
        if not tags:
            tags = ["Industry News"]

        return {
            "summary": result.get("summary", "").strip(),
            "tags": tags,
        }

    except Exception as e:
        print(f"[summarizer] Error summarizing '{title}': {e}")
        return None


def generate_at_a_glance(articles: list[dict]) -> Optional[dict]:
    """
    Call DeepSeek to generate the daily At a Glance summary.
    articles: list of {"title": str, "summary": str}
    """
    if not articles:
        return None

    try:
        client = _get_client()
        model = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")

        summaries = []
        for a in articles:
            summaries.append(f"- {a['title']}: {a['summary']}")

        articles_text = "\n".join(summaries)
        prompt = AT_A_GLANCE_PROMPT.format(article_count=len(articles), articles=articles_text)

        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        text = resp.choices[0].message.content.strip()
        result = json.loads(text)

        return {
            "title": result.get("title", "").strip(),
            "themes": result.get("themes", []),
            "topPosts": result.get("topPosts", []),
        }

    except Exception as e:
        print(f"[summarizer] Error generating At a Glance: {e}")
        return None
```

- [ ] **Step 2: Commit**

```bash
git add scripts/summarizer.py
git commit -m "feat: add DeepSeek summarizer module for article summarization"
```

---

### Task 6: Pipeline orchestrator

**Files:**
- Create: `scripts/pipeline.py`

- [ ] **Step 1: Create `scripts/pipeline.py`**

```python
#!/usr/bin/env python3
"""
Feed pipeline orchestrator.
Entry point for the daily feed processing pipeline.

Usage:
    python pipeline.py              # Full run: fetch → summarize → export
    python pipeline.py --fetch-only # Only fetch new articles
    python pipeline.py --export-only # Only export JSON (reprocess existing)
"""

import os
import sys
import json
import argparse
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load .env from same directory as this script
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from db import (
    init_db, article_exists, insert_article, update_summary,
    get_unprocessed_articles, get_recent_articles,
    save_at_a_glance, log_fetch,
)
from fetcher import fetch_feed
from summarizer import summarize_article, generate_at_a_glance


def load_sources() -> list[dict]:
    sources_path = os.environ.get("SOURCES_PATH", os.path.join(os.path.dirname(__file__), "sources.json"))
    with open(sources_path) as f:
        all_sources = json.load(f)
    return [s for s in all_sources if s.get("enabled", True)]


def run_fetch(source: dict) -> int:
    """Fetch articles from a single source. Returns count of new articles."""
    print(f"[pipeline] Fetching: {source['name']} ({source['feed_url']})")
    articles = fetch_feed(source["feed_url"])

    if articles is None:
        print(f"[pipeline]  ✗ Failed to fetch {source['name']}")
        log_fetch(source["id"], 0, "fetch failed")
        return 0

    new_count = 0
    for article in articles:
        if article_exists(article["url"]):
            continue

        insert_article(
            source_id=source["id"],
            source_name=source["name"],
            title=article["title"],
            author=article.get("author"),
            url=article["url"],
            published_at=article.get("published_at"),
            raw_content=article.get("raw_content", ""),
        )
        new_count += 1

    print(f"[pipeline]  ✓ {new_count} new articles from {source['name']}")
    log_fetch(source["id"], new_count)
    return new_count


def run_summarize(max_articles: int = 50) -> int:
    """Summarize unprocessed articles. Returns count of summarized articles."""
    articles = get_unprocessed_articles()
    if not articles:
        print("[pipeline] No unprocessed articles to summarize")
        return 0

    articles = articles[:max_articles]
    print(f"[pipeline] Summarizing {len(articles)} articles...")

    success_count = 0
    for article in articles:
        print(f"[pipeline]  Summarizing: {article['title'][:60]}...")
        result = summarize_article(article["title"], article["raw_content"])
        if result:
            update_summary(article["id"], result["summary"], result["tags"])
            success_count += 1
            print(f"[pipeline]  ✓ Tags: {result['tags']}")
        else:
            # Mark as processed anyway so we don't retry failed summaries
            # The article will still be exported, just without summary/tags
            update_summary(article["id"], "", [])
            print(f"[pipeline]  ✗ Failed, marked as processed")

    print(f"[pipeline] Summarized {success_count}/{len(articles)} articles")
    return success_count


def run_at_a_glance() -> None:
    """Generate At a Glance for today."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    recent = get_recent_articles(limit=50)

    # Only generate for articles fetched today
    today_articles = [
        {"title": a["title"], "summary": a.get("ai_summary", "") or "(no summary)"}
        for a in recent
        if a.get("ai_summary")
    ][:20]  # Limit to 20 articles for prompt

    if not today_articles:
        print("[pipeline] No summarized articles to generate At a Glance")
        return

    result = generate_at_a_glance(today_articles)
    if result:
        save_at_a_glance(today, result["title"], result["themes"], result["top_posts"])
        print(f"[pipeline] At a Glance saved for {today}")
    else:
        print("[pipeline] Failed to generate At a Glance")


def run_export() -> str:
    """Export processed articles and At a Glance to JSON for the frontend.
    Returns the path to the exported file."""
    export_path = os.environ.get(
        "EXPORT_PATH",
        os.path.join(os.path.dirname(__file__), "..", "src", "data", "feed.json"),
    )

    articles = get_recent_articles(limit=50)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    at_a_glance = None

    from db import get_at_a_glance
    at_a_glance = get_at_a_glance(today)

    # If today's not ready, try yesterday
    if not at_a_glance:
        from datetime import timedelta
        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
        at_a_glance = get_at_a_glance(yesterday)

    export = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "articles": articles,
        "at_a_glance": at_a_glance,
    }

    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(export, f, ensure_ascii=False, indent=2)

    print(f"[pipeline] Exported {len(articles)} articles to {export_path}")
    return export_path


def main():
    parser = argparse.ArgumentParser(description="Daily feed pipeline")
    parser.add_argument("--fetch-only", action="store_true", help="Only fetch new articles")
    parser.add_argument("--summarize-only", action="store_true", help="Only summarize pending articles")
    parser.add_argument("--export-only", action="store_true", help="Only export JSON")
    args = parser.parse_args()

    # Determine modes
    fetch = not args.summarize_only and not args.export_only
    summarize = not args.fetch_only and not args.export_only
    export_mode = args.export_only or (not args.fetch_only and not args.summarize_only)

    if fetch or args.fetch_only:
        init_db()
        sources = load_sources()
        total_new = 0
        for source in sources:
            total_new += run_fetch(source)
        print(f"[pipeline] Fetch complete: {total_new} new articles total")

    if summarize or args.summarize_only:
        init_db()
        summarized = run_summarize()
        if summarized > 0:
            run_at_a_glance()
        print(f"[pipeline] Summarize complete")

    if export_mode:
        init_db()
        run_export()
        print("[pipeline] Export complete")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test the pipeline locally**

```bash
cd scripts
python -m venv venv
venv\Scripts\pip install -r requirements.txt
# Create .env with DEEPSEEK_API_KEY=sk-your-key
# Copy to .env
venv\Scripts\python pipeline.py --fetch-only
```

Expected: Fetches articles from AINews RSS, stores in SQLite, prints count of new articles.

- [ ] **Step 3: Commit**

```bash
git add scripts/pipeline.py
git commit -m "feat: add pipeline orchestrator for daily feed processing"
```

---

### Task 7: JSON export target directory + .gitignore

**Files:**
- Create: `src/data/.gitignore`
- Create: `scripts/data/.gitignore`

- [ ] **Step 1: Create `.gitignore` files**

`src/data/.gitignore`:
```
*
!.gitignore
```

`scripts/data/.gitignore`:
```
*
!.gitignore
```

These ensure the `data/` directories exist for JSON/SQLite output but the generated files are not committed.

- [ ] **Step 2: Commit**

```bash
git add src/data/.gitignore scripts/data/.gitignore
git commit -m "chore: add data directories with gitignore for generated files"
```

---

### Task 8: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/daily-feed.yml`

- [ ] **Step 1: Create `.github/workflows/daily-feed.yml`**

```yaml
name: Daily Feed Pipeline

on:
  schedule:
    # 7am China Standard Time (CST = UTC+8) = 23:00 UTC previous day
    - cron: "0 23 * * *"
  workflow_dispatch:  # Allow manual trigger

env:
  DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  DEEPSEEK_BASE_URL: https://api.deepseek.com
  DEEPSEEK_MODEL: deepseek-chat

jobs:
  process-feed:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: "pip"
          cache-dependency-path: scripts/requirements.txt

      - name: Install dependencies
        run: pip install -r scripts/requirements.txt

      - name: Run feed pipeline
        working-directory: scripts
        run: python pipeline.py

      # JSON export is already written by the pipeline to ../src/data/feed.json

      - name: Upload feed data as artifact
        uses: actions/upload-artifact@v4
        with:
          name: feed-data
          path: src/data/feed.json
          retention-days: 7
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/daily-feed.yml
git commit -m "feat: add GitHub Actions workflow for daily feed pipeline"
```

---

## Phase 2: Frontend UI

### Task 9: New data types for feed articles

**Files:**
- Modify: `src/components/discovery/data.tsx`

- [ ] **Step 1: Add `FeedArticle` and `AtAGlance` interfaces to `src/components/discovery/data.tsx`**

Add after the existing `FeedPost` interface (around line 45):

```typescript
export interface FeedArticle {
  source_name: string;
  title: string;
  author: string | null;
  url: string;
  published_at: string | null;
  ai_summary: string;
  tags: string;
  raw_content: string;
}

export interface AtAGlance {
  date: string;
  title: string;
  themes: string[];
  top_posts: { name: string; desc: string }[];
  created_at: string;
}
```

- [ ] **Step 2: Update the FeedArticle type export in the index re-export file**

`src/components/discovery/index.ts` — update the export line to include new types:

```typescript
export type { Person, Skill, LibraryItem, FeedPost, FeedArticle, AtAGlance } from "./data";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/discovery/data.tsx src/components/discovery/index.ts
git commit -m "feat: add FeedArticle and AtAGlance data types"
```

---

### Task 10: Rewrite FeedItem for article-style expandable cards

**Files:**
- Modify: `src/components/discovery/FeedItem.tsx`

- [ ] **Step 1: Rewrite `FeedItem.tsx`**

Replace the entire file with the new article-style component:

```tsx
"use client";

import { useState } from "react";
import type { FeedArticle } from "./data";

interface FeedItemProps {
  article: FeedArticle;
}

const TAG_COLORS: Record<string, string> = {
  "Model Release":   "oklch(65% 0.14 30)",
  "Research":        "oklch(60% 0.12 260)",
  "Product Launch":  "oklch(62% 0.13 160)",
  "Policy & Safety": "oklch(60% 0.08 50)",
  "Industry News":   "oklch(55% 0.06 240)",
  "Tooling":         "oklch(62% 0.10 300)",
  "AI & Society":    "oklch(60% 0.08 10)",
  "Coding & Building": "oklch(58% 0.12 200)",
};

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const hours = Math.round(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function FeedItem({ article }: FeedItemProps) {
  const [expanded, setExpanded] = useState(false);
  const tags = parseTags(article.tags);

  return (
    <div className="feed-item">
      <div className="feed-article">
        {/* Source + meta row */}
        <div className="feed-article-meta">
          <span className="feed-article-source">{article.source_name}</span>
          {article.author && (
            <>
              <span className="feed-article-sep">·</span>
              <span className="feed-article-author">{article.author}</span>
            </>
          )}
          <span className="feed-article-sep">·</span>
          <span className="feed-article-time">{formatDate(article.published_at)}</span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="feed-article-tags">
            {tags.map((tag) => (
              <span
                key={tag}
                className="feed-article-tag"
                style={{ background: TAG_COLORS[tag] || "var(--muted)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="feed-article-title">{article.title}</h3>

        {/* AI Summary (always visible) */}
        {article.ai_summary && (
          <p className="feed-article-summary">{article.ai_summary}</p>
        )}

        {/* Expand toggle for full content */}
        {article.raw_content && (
          <>
            <button
              className="btn btn-ghost btn-xs feed-article-toggle"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "▲ Hide full article" : "▼ Read full article"}
            </button>

            {expanded && (
              <div className="feed-article-full">
                <p>{article.raw_content}</p>
              </div>
            )}
          </>
        )}

        {/* Original link */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="feed-article-link"
        >
          Read original →
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add CSS for the new article styles in `src/app/globals.css`**

Find the `.feed-item` CSS block (around line 554) and replace the feed-item section:

Wait — need to be careful. The old `.feed-item` styles are used by the old FeedItem component. Since we're rewriting the component completely, we can replace the CSS. But `.feed-item` is also used as the wrapper class, so we keep that.

Add the new styles after the existing `.feed-item` block (before the feed-summary section):

```css
/* ─── Feed Article (new RSS article style) ────────────────────────────── */
.feed-article {
  flex: 1;
  min-width: 0;
}
.feed-article-meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.feed-article-source {
  font-weight: 600;
  color: var(--fg);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.feed-article-sep {
  color: var(--border);
}
.feed-article-author {
  color: var(--muted);
}
.feed-article-time {
  color: var(--muted);
}
.feed-article-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.feed-article-tag {
  font-size: 10px;
  font-family: var(--font-mono);
  color: #fff;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.feed-article-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
  margin: 8px 0 0;
}
.feed-article-summary {
  font-size: 15px;
  line-height: 1.65;
  color: var(--muted);
  margin: 8px 0 0;
}
.feed-article-toggle {
  margin-top: 10px;
  font-size: 12px !important;
  color: var(--accent) !important;
  cursor: pointer;
  padding: 0 !important;
}
.feed-article-full {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  font-size: 14px;
  line-height: 1.7;
  max-height: 400px;
  overflow-y: auto;
}
.feed-article-full p {
  margin: 0;
}
.feed-article-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;
}
.feed-article-link:hover {
  text-decoration: underline;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/discovery/FeedItem.tsx src/app/globals.css
git commit -m "feat: rewrite FeedItem as article-style expandable card"
```

---

### Task 11: Update FeedSummary for dynamic At a Glance data

**Files:**
- Modify: `src/components/discovery/FeedSummary.tsx`

- [ ] **Step 1: Rewrite `FeedSummary.tsx` to accept both static and dynamic data**

The component currently has a hardcoded shape from `typeof FEED_SUMMARY`. Update it to accept the new `AtAGlance` type:

```tsx
import { Eyebrow } from "../ui/Eyebrow";
import type { AtAGlance } from "./data";

interface FeedSummaryProps {
  data: AtAGlance;
}

export function FeedSummary({ data }: FeedSummaryProps) {
  return (
    <div className="feed-summary">
      <div className="summary-body">
        <Eyebrow>At a Glance</Eyebrow>
        <h3>{data.title}</h3>
        {data.themes.length > 0 && (
          <div className="summary-themes">
            {data.themes.map((theme) => (
              <span key={theme} className="summary-theme">
                {theme}
              </span>
            ))}
          </div>
        )}
        {data.top_posts.length > 0 && (
          <div className="summary-top">
            Top posts:{" "}
            {data.top_posts.map((p, i) => (
              <span key={p.name}>
                {i > 0 && i < data.top_posts.length - 1 && ", "}
                {i === data.top_posts.length - 1 && data.top_posts.length > 1 && ", and "}
                <strong>{p.name}</strong> ({p.desc})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/discovery/FeedSummary.tsx
git commit -m "feat: update FeedSummary to accept dynamic AtAGlance data"
```

---

### Task 12: Update discovery page + API route

**Files:**
- Modify: `src/app/discovery/page.tsx`
- Create: `src/app/api/feed/route.ts` (or read existing one)

- [ ] **Step 1: Read existing API route**

```bash
# Check if /api/feed route exists
ls src/app/api/feed/ 2>/dev/null || echo "No API route yet"
```

- [ ] **Step 2: Create/update the API route to read from `feed.json`**

`src/app/api/feed/route.ts`:

```typescript
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
    // Return empty data if feed.json doesn't exist yet
    return NextResponse.json({
      generated_at: new Date().toISOString(),
      articles: [],
      at_a_glance: null,
    });
  }
}
```

- [ ] **Step 3: Update the discovery page to use new types and components**

In `src/app/discovery/page.tsx`:

Replace the feed-related imports:
```typescript
import {
  FeedItem,
  FeedSummary,
  // ... keep others
  FEED_SUMMARY,   // remove this
} from "@/components/discovery";
import type { FeedPost } from "@/components/discovery/data";
```
→
```typescript
import {
  FeedItem,
  FeedSummary,
  // ... keep others
} from "@/components/discovery";
import type { FeedArticle, AtAGlance } from "@/components/discovery/data";
```

Replace the feed state:
```typescript
const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
```
→
```typescript
const [feedArticles, setFeedArticles] = useState<FeedArticle[]>([]);
const [atAGlance, setAtAGlance] = useState<AtAGlance | null>(null);
```

Update the `loadFeed` function:
```typescript
async function loadFeed() {
  setFeedLoading(true);
  setFeedError(null);
  try {
    const res = await fetch("/api/feed");
    if (!res.ok) throw new Error(`Feed API error: ${res.status}`);
    const data = await res.json();
    if (!cancelled) {
      setFeedArticles(data.articles || []);
      setAtAGlance(data.at_a_glance || null);
    }
  } catch (err) {
    if (!cancelled) {
      setFeedError(err instanceof Error ? err.message : "Failed to load feed");
    }
  } finally {
    if (!cancelled) setFeedLoading(false);
  }
}
```

Remove `fetchFeedStatus` — we no longer need the separate status endpoint. Remove the `lastSync` state, `formatSyncTime`, and `renderSyncBadge`.

Replace the feed rendering section (between `{activeTab === "feed" &&` and the closing `</Section>`):

```tsx
{activeTab === "feed" && (
  <Section>
    <SectionHeader
      title="Live AI Feed"
      description="Posts from top AI voices, filtered and summarized for clarity."
    />

    {feedError && (
      <div className="card" style={{ marginBottom: "var(--gap-lg)", borderColor: "oklch(55% 0.14 20)", background: "color-mix(in oklch, oklch(55% 0.14 20) 8%, transparent)" }}>
        <p style={{ margin: 0, fontSize: 14 }}>
          Could not load live feed: {feedError}.{" "}
          <button onClick={() => setActiveTab("feed")} className="btn btn-ghost btn-xs" style={{ color: "var(--accent)" }}>
            Retry
          </button>
        </p>
      </div>
    )}

    {feedLoading && (
      <>
        <div className="feed-summary">
          <div className="summary-body">
            <div className="shimmer" style={{ width: "30%", height: 16, marginBottom: 12 }} />
            <div className="shimmer" style={{ width: "100%", height: 20, marginBottom: 4 }} />
            <div className="shimmer" style={{ width: "100%", height: 20, marginBottom: 4 }} />
            <div className="shimmer" style={{ width: "70%", height: 20 }} />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="feed-item">
            <div className="shimmer" style={{ width: "100%", height: 80, borderRadius: "var(--radius)" }} />
          </div>
        ))}
      </>
    )}

    {!feedLoading && !feedError && (
      <>
        {atAGlance && <FeedSummary data={atAGlance} />}

        {feedArticles.length === 0 && (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px 0" }}>
            No articles yet. The pipeline runs daily at 7am.
          </p>
        )}

        {feedArticles.map((article, i) => (
          <FeedItem key={article.url} article={article} />
        ))}
      </>
    )}
  </Section>
)}
```

Remove unused imports (`SyncBadge`, `fetchFeed`, `fetchFeedStatus`, `FEED_SUMMARY`).

- [ ] **Step 4: Commit**

```bash
git add src/app/discovery/page.tsx src/app/api/feed/route.ts
git commit -m "feat: update discovery page for RSS article feed"
```

---

### Task 13: Generate mock feed.json for development

- [ ] **Step 1: Create a sample `src/data/feed.json` for dev testing**

Since the Python pipeline won't run until GitHub Actions is set up with a DeepSeek key, create a sample file for frontend development:

```json
{
  "generated_at": "2026-05-25T07:00:00Z",
  "articles": [
    {
      "source_name": "AINews by smol.ai",
      "title": "GPT-5 and Claude 4 Opus Lead a Week of Major Model Releases",
      "author": "smol.ai Team",
      "url": "https://news.smol.ai/articles/gpt-5-claude-4",
      "published_at": "2026-05-25T06:00:00Z",
      "ai_summary": "This week saw three major model releases: OpenAI's GPT-5 with native multimodality, Anthropic's Claude 4 Opus with 40% fewer hallucinations, and DeepSeek's fully open-source V4 model. Each takes a different approach to advancing frontier AI capabilities.",
      "tags": "[\"Model Release\", \"Industry News\"]",
      "raw_content": "The AI industry witnessed a remarkable week of model releases as three major players unveiled significant updates to their flagship systems. OpenAI led with GPT-5, introducing native multimodality across text, images, audio, and video. The model is available through both API and ChatGPT Pro subscriptions.\n\nAnthropic followed closely with Claude 4 Opus, their most capable model to date. Internal evaluations show 40% fewer hallucinations on complex STEM tasks. The model shows particular strength in code generation and long-form reasoning.\n\nDeepSeek took a different approach, releasing V4 as a fully open-source model under MIT license. The model matches proprietary frontier models on reasoning benchmarks while requiring 60% less compute, potentially democratizing access to high-quality AI."
    },
    {
      "source_name": "AINews by smol.ai",
      "title": "AI Coding Tools Reach New Milestones in Developer Adoption",
      "author": "smol.ai Team",
      "url": "https://news.smol.ai/articles/ai-coding-adoption",
      "published_at": "2026-05-24T14:00:00Z",
      "ai_summary": "AI-powered coding tools like Claude Code, Cursor, and GitHub Copilot are seeing record adoption. A new survey shows 68% of professional developers now use AI coding assistants daily, up from 45% six months ago.",
      "tags": "[\"Tooling\", \"Coding & Building\"]",
      "raw_content": "Adoption of AI coding assistants has reached a tipping point according to a new survey of 5,000 professional developers. Claude Code, the agentic coding tool from Anthropic, reported 3x growth in active users this quarter. Cursor, the AI-native IDE, announced他们已经达到100万活跃用户。\n\nGitHub Copilot continues to lead in market share, but newer entrants like Claude Code and Cursor are gaining rapidly due to their agentic capabilities — the ability to autonomously navigate codebases, fix bugs, and implement features without line-by-line prompting.\n\nThe survey also found that developers using AI assistants report 2-3x productivity gains on routine tasks, but cautioned that code review and security verification remain critical human-in-the-loop steps."
    }
  ],
  "at_a_glance": {
    "date": "2026-05-25",
    "title": "Today's feed spans major model releases from OpenAI, Anthropic, and DeepSeek, alongside surging adoption of AI coding tools in developer workflows.",
    "themes": ["Model Releases", "Tooling", "Industry News"],
    "top_posts": [
      {"name": "GPT-5 and Claude 4 Opus Lead a Week of Major Model Releases", "desc": "Three frontier models in one week"},
      {"name": "AI Coding Tools Reach New Milestones", "desc": "68% of devs now use AI daily"}
    ],
    "created_at": "2026-05-25T07:00:00Z"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/feed.json
git commit -m "chore: add sample feed.json for frontend development"
```

---

## Plan Summary

### Key Interfaces

```
FeedArticle {
  source_name: string
  title: string
  author: string | null
  url: string
  published_at: string | null
  ai_summary: string
  tags: string          // JSON array stored as string
  raw_content: string
}

AtAGlance {
  date: string
  title: string
  themes: string[]
  top_posts: { name: string, desc: string }[]
  created_at: string
}
```

### File Manifest

| File | Action | Purpose |
|------|--------|---------|
| `scripts/requirements.txt` | Create | Python dependencies |
| `scripts/.env.example` | Create | Env template |
| `scripts/sources.json` | Create | RSS source config |
| `scripts/db.py` | Create | SQLite operations |
| `scripts/fetcher.py` | Create | RSS fetching |
| `scripts/summarizer.py` | Create | DeepSeek API calls |
| `scripts/pipeline.py` | Create | Orchestrator |
| `.github/workflows/daily-feed.yml` | Create | 7am cron trigger |
| `src/data/.gitignore` | Create | Ignore generated data |
| `scripts/data/.gitignore` | Create | Ignore generated data |
| `src/components/discovery/data.tsx` | Modify | Add FeedArticle, AtAGlance |
| `src/components/discovery/index.ts` | Modify | Export new types |
| `src/components/discovery/FeedItem.tsx` | Rewrite | Article-style expandable card |
| `src/app/globals.css` | Modify | Add article card styles |
| `src/components/discovery/FeedSummary.tsx` | Rewrite | Accept AtAGlance |
| `src/app/api/feed/route.ts` | Create | Read feed.json |
| `src/app/discovery/page.tsx` | Modify | Use new types + components |
| `src/data/feed.json` | Create | Sample dev data |

### Remaining Decisions for Future Iterations

1. **Add more sources** — confirm RSS feeds for the other 5 newsletters and add to sources.json
2. **Cloudflare D1 migration** — replace SQLite + JSON export with D1 HTTP API writes
3. **RSSHub integration** — for sources without native RSS
4. **Source management UI** — add/remove sources from the frontend
5. **Search/filter by source or tag** — extend the API with query params (already partially supported in api.ts)
6. **Sync status indicator** — show last sync time in the UI

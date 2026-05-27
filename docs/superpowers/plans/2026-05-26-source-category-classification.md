# Source Category Classification & Live Feed Filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace DeepSeek tag classification with source category, and add category filter buttons to the Live Feed UI.

**Architecture:** Backend changes to the RSS pipeline (Python) — modify DB schema, summarizer, and export to carry source category instead of DeepSeek-generated tags. Frontend changes (TypeScript/React) — add category field to feed article type, update FeedItem display, add filter bar to discovery page.

**Tech Stack:** Python 3 (SQLite, feedparser, OpenAI SDK), Next.js 16 (App Router), Custom CSS (globals.css)

---

### Task 1: DB schema — add source_category column

**Files:**
- Modify: `scripts/db.py`
- Test: `scripts/tests/test_db.py` (create)

- [ ] **Step 1: Write the failing test for insert_article with source_category**

```python
# scripts/tests/test_db.py
"""Tests for database layer with source_category support."""

import sys
import os
import json
import tempfile
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from db import init_db, get_connection, insert_article, get_recent_articles


@pytest.fixture(autouse=True)
def _in_memory_db(monkeypatch):
    """Use a temporary in-memory database for each test."""
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    monkeypatch.setenv("DB_PATH", tmp.name)
    init_db()
    yield
    tmp.close()


def test_insert_article_with_source_category():
    """insert_article stores source_category and get_recent_articles returns it."""
    article_id = insert_article(
        source_id="test-source",
        source_name="Test Source",
        title="Test Article",
        author="Author",
        url="https://example.com/test",
        published_at="2026-05-26T00:00:00",
        raw_content="This is some test content for the article.",
        source_category="AI & Machine Learning",
    )
    assert article_id is not None

    # Manually mark as processed so get_recent_articles returns it
    conn = get_connection()
    conn.execute("UPDATE articles SET processed = 1, ai_summary = 'Test summary' WHERE id = ?", (article_id,))
    conn.commit()
    conn.close()

    articles = get_recent_articles(limit=10)
    matched = [a for a in articles if a["source_name"] == "Test Source"]
    assert len(matched) == 1
    assert matched[0]["source_category"] == "AI & Machine Learning"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd scripts && python -m pytest tests/test_db.py::test_insert_article_with_source_category -v`
Expected: FAIL — likely `KeyError: 'source_category'` because `get_recent_articles()` SELECT doesn't include it, or the column doesn't exist yet.

- [ ] **Step 3: Add source_category column to schema and update insert/get**

```python
# In db.py — update SCHEMA_SQL, migration for existing DBs
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS articles (
    id          TEXT PRIMARY KEY,
    source_id   TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_category TEXT,                  -- NEW: source category for classification
    title       TEXT NOT NULL,
    author      TEXT,
    url         TEXT NOT NULL UNIQUE,
    published_at TEXT,
    raw_content TEXT,
    ai_summary  TEXT,
    tags        TEXT,
    fetched_at  TEXT NOT NULL,
    processed   INTEGER DEFAULT 0
);
...
"""

# Add migration in init_db():
def init_db() -> None:
    conn = get_connection()
    conn.executescript(SCHEMA_SQL)
    # Migration: add source_category if missing (existing databases)
    try:
        conn.execute("ALTER TABLE articles ADD COLUMN source_category TEXT")
    except sqlite3.OperationalError:
        pass  # column already exists
    conn.commit()
    conn.close()
```

```python
# Update insert_article() — add source_category parameter
def insert_article(
    source_id: str,
    source_name: str,
    title: str,
    author: Optional[str],
    url: str,
    published_at: Optional[str],
    raw_content: str,
    source_category: str = "",             # NEW parameter
) -> str:
    import hashlib
    article_id = hashlib.sha256(url.encode()).hexdigest()[:16]
    now = datetime.utcnow().isoformat()
    conn = get_connection()
    conn.execute(
        """INSERT OR IGNORE INTO articles
           (id, source_id, source_name, source_category, title, author, url,
            published_at, raw_content, fetched_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (article_id, source_id, source_name, source_category, title, author,
         url, published_at, raw_content, now),
    )
    conn.commit()
    conn.close()
    return article_id
```

```python
# Update get_recent_articles() — add source_category to SELECT
def get_recent_articles(limit: int = 50) -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        """SELECT source_name, source_category, title, author, url, published_at,
                  ai_summary, tags, raw_content
           FROM articles
           WHERE processed = 1
           ORDER BY published_at DESC
           LIMIT ?""",
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd scripts && python -m pytest tests/test_db.py::test_insert_article_with_source_category -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/db.py scripts/tests/test_db.py
git commit -m "feat: add source_category column to articles table"
```

---

### Task 2: Summarizer — remove tag generation

**Files:**
- Modify: `scripts/summarizer.py`
- Test: `scripts/tests/test_summarizer.py` (create)

- [ ] **Step 1: Write the failing test for new summarize behavior**

```python
# scripts/tests/test_summarizer.py
"""Tests for summarizer with tag generation removed."""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from summarizer import summarize_article


def test_summarize_article_returns_only_summary(monkeypatch):
    """summarize_article returns a dict with only 'summary' key (no 'tags')."""

    class FakeChoice:
        class FakeMessage:
            content = json.dumps({"summary": "This is a test summary."})
        choices = [FakeMessage()]

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass
        @property
        def chat(self):
            return self
        @property
        def completions(self):
            return self
        def create(self, *args, **kwargs):
            return FakeChoice()

    monkeypatch.setenv("DEEPSEEK_API_KEY", "test-key")
    monkeypatch.setattr("summarizer.OpenAI", lambda **kw: FakeClient())

    result = summarize_article("Test Title", "Some content here.")
    assert result is not None
    assert "summary" in result
    assert "tags" not in result  # tags should no longer be present
    assert result["summary"] == "This is a test summary."
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd scripts && python -m pytest tests/test_summarizer.py::test_summarize_article_returns_only_summary -v`
Expected: FAIL — `"tags" not in result` assertion fails because tags is still returned, or `assert "tags" not in result` fails with `AssertionError`

- [ ] **Step 3: Remove tag logic from summarizer**

```python
# In summarizer.py — remove TAG_POOL, simplify prompt, simplify return value

# Delete the TAG_POOL constant entirely

# Update SUMMARY_PROMPT — remove tags instructions
SUMMARY_PROMPT = """You are an AI assistant that helps summarize AI news articles for a non-technical audience.

For the article below, produce a JSON response with exactly these fields:
{{
  "summary": "1-3 sentence plain-language summary. Assume the reader is curious but not a technical expert. Focus on WHAT happened and WHY it matters."
}}

Article title: {title}
Article text:
{content}
"""
```

```python
# Update summarize_article() — remove tag logic
def summarize_article(title: str, content: str) -> Optional[dict]:
    if not content.strip():
        return None

    truncated = content[:8000]

    try:
        client = _get_client()
        model = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash")
        prompt = SUMMARY_PROMPT.format(
            title=_escape_format(title),
            content=_escape_format(truncated),
        )

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
            "summary": result.get("summary", "").strip(),
        }

    except Exception as e:
        print(f"[summarizer] Error summarizing '{title[:40]}': {e}")
        return None
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd scripts && python -m pytest tests/test_summarizer.py::test_summarize_article_returns_only_summary -v`
Expected: PASS

- [ ] **Step 5: Run existing fetcher tests to ensure no regressions**

Run: `cd scripts && python -m pytest tests/ -v`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add scripts/summarizer.py scripts/tests/test_summarizer.py
git commit -m "refactor: remove tag generation from summarizer, keep only summary"
```

---

### Task 3: Pipeline — pass source_category through

**Files:**
- Modify: `scripts/pipeline.py`
- Modify: `scripts/db.py` (`update_summary` signature)

- [ ] **Step 1: Update `update_summary()` to remove tags parameter**

```python
# In db.py — remove tags parameter
def update_summary(article_id: str, summary: str) -> None:
    conn = get_connection()
    conn.execute(
        "UPDATE articles SET ai_summary = ?, processed = 1 WHERE id = ?",
        (summary, article_id),
    )
    conn.commit()
    conn.close()
```

- [ ] **Step 2: Update pipeline.py — pass source_category in fetch, remove tags in summarize**

In `run_fetch()`, pass the source category when inserting:
```python
def run_fetch(source: dict) -> int:
    print(f"[pipeline] Fetching: {source['name']} ({source['feed_url']})")
    articles = fetch_feed(source["feed_url"], days_threshold=DAYS_THRESHOLD)
    ...
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
            source_category=source.get("category", ""),   # NEW
        )
        new_count += 1
    ...
```

In `run_summarize()`, remove tags from the update call:
```python
def run_summarize(max_articles: int = 50) -> int:
    ...
    for article in articles:
        print(f"[pipeline]  Summarizing: {article['title'][:60]}...")
        result = summarize_article(article["title"], article["raw_content"])
        if result:
            update_summary(article["id"], result["summary"])
            success_count += 1
            print(f"[pipeline]  V Summary generated")
        else:
            update_summary(article["id"], "")
            print(f"[pipeline]  X Failed, marked as processed")
    ...
```

- [ ] **Step 3: Verify pipeline still runs (dry run with --export-only)**

Run: `cd scripts && python pipeline.py --export-only`
Expected: Output `Exported N articles to ...` with no errors. The `feed.json` export now includes `source_category` in each article.

- [ ] **Step 4: Verify feed.json contains source_category**

Run: `python -c "import json; d=json.load(open('../src/data/feed.json')); a=d['articles'][0]; print(a.get('source_category', 'MISSING'))"`
Expected: Prints the source category string (not "MISSING")

- [ ] **Step 5: Commit**

```bash
git add scripts/pipeline.py scripts/db.py
git commit -m "feat: pass source category through pipeline, remove tags from update"
```

---

### Task 4: Frontend — update FeedArticle type and create emoji map

**Files:**
- Modify: `src/components/discovery/data.tsx`

- [ ] **Step 1: Add source_category to FeedArticle and create emoji map**

Add `source_category` to the `FeedArticle` interface:
```typescript
export interface FeedArticle {
  source_name: string;
  source_category: string;  // NEW
  title: string;
  author: string | null;
  url: string;
  published_at: string | null;
  ai_summary: string;
  tags: string;
  raw_content: string;
}
```

Add the emoji mapping constant:
```typescript
export const CATEGORY_EMOJI: Record<string, string> = {
  "AI & Machine Learning": "🧠",
  "AI & Tech": "🤖",
  "Cybersecurity & Privacy": "🔒",
  "Systems Programming & Low-Level": "⚙️",
  "Web Development & Frontend": "🌐",
  "Software Engineering & Career": "💻",
  "DevOps, Infrastructure & SysAdmin": "🚀",
  "Hardware & Electronics": "🔧",
  "Vintage & Retro Computing": "📼",
  "Math, Science & Research": "🔬",
  "Tech Culture & Commentary": "🗣️",
  "Startups, Business & Investing": "💡",
  "Gaming & Interactive Media History": "🎮",
  "Writing, Communication & Personal": "✍️",
  "Ideas, Essays & Big Thinking": "💭",
  "Tech News You Actually Need to Know": "📰",
  "Society, Industry & Economics": "🏛️",
  "Writing & Personal": "📝",
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/discovery/data.tsx
git commit -m "feat: add source_category to FeedArticle and category emoji map"
```

---

### Task 5: Frontend — update FeedItem to show source category

**Files:**
- Modify: `src/components/discovery/FeedItem.tsx`

- [ ] **Step 1: Rewrite tag rendering to use source_category**

Replace the tags section in `FeedItem.tsx`:
```typescript
import { CATEGORY_EMOJI } from "./data";

// Remove TAG_COLORS constant entirely

// Remove parseTags function entirely

export function FeedItem({ article }: FeedItemProps) {
  const [expanded, setExpanded] = useState(false);
  const category = article.source_category;
  const emoji = CATEGORY_EMOJI[category] || "";
  // Remove: const tags = parseTags(article.tags);
  ...
```

Replace the tags JSX block:
```tsx
{/* Replace old tags block */}
{category && (
  <div className="feed-article-tags">
    <span className="feed-article-tag feed-article-tag-category">
      {emoji} {category}
    </span>
  </div>
)}
```

- [ ] **Step 2: Add CSS for the category tag**

In `src/app/globals.css`, add a muted style for category tags:
```css
.feed-article-tag-category {
  background: var(--muted) !important;
  opacity: 0.85;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/discovery/FeedItem.tsx src/app/globals.css
git commit -m "feat: show source category with emoji in feed items"
```

---

### Task 6: Frontend — add category filter bar to discovery page

**Files:**
- Modify: `src/app/discovery/page.tsx`

- [ ] **Step 1: Add category filter state and filter logic**

In `discovery/page.tsx`:
```typescript
// Add new state
const [categoryFilter, setCategoryFilter] = useState("All");

// After feedArticles is loaded, derive unique categories
const categories = React.useMemo(() => {
  const cats = feedArticles
    .map((a) => a.source_category)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)  // unique
    .sort();
  return cats;
}, [feedArticles]);

// Filtered articles
const filteredArticles = categoryFilter === "All"
  ? feedArticles
  : feedArticles.filter((a) => a.source_category === categoryFilter);
```

- [ ] **Step 2: Add filter bar UI between FeedSummary and article list**

```tsx
{atAGlance && <FeedSummary data={atAGlance} />}

{/* Category filter bar — NEW */}
{categories.length > 1 && (
  <div className="filter-bar" style={{ marginBottom: "var(--gap-md)" }}>
    <FilterChip
      active={categoryFilter === "All"}
      onClick={() => setCategoryFilter("All")}
    >
      All
    </FilterChip>
    {categories.map((cat) => (
      <FilterChip
        key={cat}
        active={categoryFilter === cat}
        onClick={() => setCategoryFilter(cat)}
      >
        {CATEGORY_EMOJI[cat] || ""} {cat}
      </FilterChip>
    ))}
  </div>
)}

{/* Use filteredArticles instead of feedArticles */}
{filteredArticles.length === 0 && (
  <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px 0" }}>
    {categoryFilter === "All"
      ? "No articles yet. The pipeline runs daily at 7am."
      : `No articles in this category.`}
  </p>
)}

{filteredArticles.map((article) => (
  <FeedItem key={article.url} article={article} />
))}
```

Update imports in `page.tsx`:
```typescript
import {
  FeedItem,
  FeedSummary,
  PersonCard,
  SkillCard,
  LibraryCard,
  AppCard,
  FEED_SUMMARY,
  PEOPLE,
  SKILLS,
  LIBRARY,
  CATEGORY_EMOJI,       // NEW
} from "@/components/discovery";
```

Also add `CATEGORY_EMOJI` to the barrel export in `src/components/discovery/index.ts`:
```typescript
export { PEOPLE, SKILLS, LIBRARY, FEED_POSTS, FEED_SUMMARY, RAW_POSTS, processedToFeedPost, CATEGORY_EMOJI } from "./data";
```

The filter bar needs some import for `FilterChip` — it's already imported at the top:
```typescript
import { FilterChip } from "@/components/ui/FilterChip";
```

And `React` import for `useMemo`:
```typescript
import { useState, useEffect, useMemo } from "react";
```

- [ ] **Step 3: Run dev server to verify**

Run: `npm run dev`
Expected: App starts, discovery page shows category filter chips below At a Glance, clicking a category filters articles, each feed item shows category emoji + name.

- [ ] **Step 4: Commit**

```bash
git add src/app/discovery/page.tsx
git commit -m "feat: add category filter bar to live feed below At a Glance"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run all backend tests**

Run: `cd scripts && python -m pytest tests/ -v`
Expected: All tests pass

- [ ] **Step 2: Build frontend to check for TypeScript errors**

Run: `cd d:\demystifyAI\web && npx next build 2>&1 | head -50`
Expected: TypeScript compilation succeeds

- [ ] **Step 3: Verify the full pipeline end-to-end**

Run: `cd scripts && python pipeline.py`
Expected: Pipeline fetches, summarizes (with DeepSeek for summary only), and exports. Exported feed.json has `source_category` on each article.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: replace DeepSeek tags with source category and add feed filter UI"
```

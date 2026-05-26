# Source Category Classification & Live Feed Category Filter

## Overview

Two changes to the feed pipeline and frontend:
1. Replace DeepSeek-generated article tags with source-level static categories
2. Add category filter buttons below At a Glance in the Live Feed tab

## Background

Currently the RSS pipeline uses DeepSeek to generate both `ai_summary` and `tags` for each article. The `tags` are selected from an 8-value pool (`TAG_POOL`). Meanwhile, each source in `sources.json` has a static `category` field (18 unique categories) that is never surfaced.

The user wants to stop using DeepSeek for classification and instead use the source's category directly.

## Backend Changes

### `scripts/db.py`
- Add `source_category TEXT` column to the `articles` table schema
- `insert_article()` gets a new `source_category: str` parameter
- `get_recent_articles()` SELECT includes `source_category`

### `scripts/pipeline.py`
- `run_fetch()` passes `source["category"]` to `insert_article()`
- `run_export()` — exported articles automatically include `source_category`

### `scripts/summarizer.py`
- Remove `TAG_POOL` constant
- `SUMMARY_PROMPT` simplified to only request `summary` (no `tags`)
- `summarize_article()` returns only `{"summary": "..."}`

## Frontend Changes

### `data.tsx`
- `FeedArticle` interface gains `source_category: string`
- New `CATEGORY_EMOJI: Record<string, string>` constant mapping each of the 18 source categories to an appropriate emoji for visual distinction
- Existing `TAG_COLORS` and tag-related code will be updated

### `FeedItem.tsx`
- Remove `TAG_COLORS` hardcoded color map (was for the 8 DeepSeek tags)
- Show source category as a single pill with emoji prefix, using unified muted styling
- Parsing logic simplified: source_category is a plain string, not a JSON array

### `discovery/page.tsx`
- Add a category filter bar between `FeedSummary` and the article list
- Reuse `FilterChip` component (same pattern as Library tab)
- First option: "All" (always shown)
- Remaining options: unique sorted list of source categories from loaded articles
- Filter state managed via `useState` with a `categoryFilter` variable
- When a category is selected, articles from other categories are hidden

### `globals.css`
- Minimal additions — `.filter-bar` class already exists for Library tab, can be reused

## Data Flow

```
sources.json (category) → pipeline fetch → insert article (source_category)
                                                    ↓
                                     pipeline summarize (DeepSeek: summary only)
                                                    ↓
                                     pipeline export → feed.json (articles have source_category)
                                                    ↓
                                     /api/feed → discovery page → filter chips + feed items
```

## Emoji Mapping

| Category | Emoji |
|---|---|
| AI & Machine Learning | 🧠 |
| AI & Tech | 🤖 |
| Cybersecurity & Privacy | 🔒 |
| Systems Programming & Low-Level | ⚙️ |
| Web Development & Frontend | 🌐 |
| Software Engineering & Career | 💻 |
| DevOps, Infrastructure & SysAdmin | 🚀 |
| Hardware & Electronics | 🔧 |
| Vintage & Retro Computing | 📼 |
| Math, Science & Research | 🔬 |
| Tech Culture & Commentary | 🗣️ |
| Startups, Business & Investing | 💡 |
| Gaming & Interactive Media History | 🎮 |
| Writing, Communication & Personal | ✍️ |
| Ideas, Essays & Big Thinking | 💭 |
| Tech News You Actually Need to Know | 📰 |
| Society, Industry & Economics | 🏛️ |
| Writing & Personal | 📝 |

## Files Modified

1. `scripts/db.py` — schema, insert, query
2. `scripts/pipeline.py` — pass category through
3. `scripts/summarizer.py` — remove tag logic
4. `src/components/discovery/data.tsx` — type + emoji map
5. `src/components/discovery/FeedItem.tsx` — simplified tag rendering
6. `src/app/discovery/page.tsx` — category filter bar

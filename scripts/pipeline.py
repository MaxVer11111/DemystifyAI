#!/usr/bin/env python3
"""
Feed pipeline orchestrator.
Entry point for the daily feed processing pipeline.

Usage:
    python pipeline.py              # Full run: fetch -> summarize -> export
    python pipeline.py --fetch-only
    python pipeline.py --export-only
"""

import os
import sys
import json
import argparse
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from db import (
    init_db, article_exists, insert_article, update_summary,
    get_unprocessed_articles, get_recent_articles,
    save_at_a_glance, get_at_a_glance, log_fetch,
)
from fetcher import fetch_feed
from summarizer import summarize_article, generate_at_a_glance


def load_sources() -> list[dict]:
    sources_path = os.environ.get(
        "SOURCES_PATH",
        os.path.join(os.path.dirname(__file__), "sources.json"),
    )
    with open(sources_path, encoding="utf-8") as f:
        all_sources = json.load(f)
    return [s for s in all_sources if s.get("enabled", True)]


DAYS_THRESHOLD = int(os.environ.get("DAYS_THRESHOLD", "7"))


def run_fetch(source: dict) -> int:
    print(f"[pipeline] Fetching: {source['name']} ({source['feed_url']})")
    articles = fetch_feed(source["feed_url"], days_threshold=DAYS_THRESHOLD)

    if articles is None:
        print(f"[pipeline]  X Failed to fetch {source['name']}")
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

    print(f"[pipeline]  V {new_count} new articles from {source['name']}")
    log_fetch(source["id"], new_count)
    return new_count


def run_summarize(max_articles: int = 50) -> int:
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
            print(f"[pipeline]  V Tags: {result['tags']}")
        else:
            update_summary(article["id"], "", [])
            print(f"[pipeline]  X Failed, marked as processed")

    print(f"[pipeline] Summarized {success_count}/{len(articles)} articles")
    return success_count


def run_at_a_glance() -> None:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    recent = get_recent_articles(limit=50)

    today_articles = [
        {"title": a["title"], "summary": a.get("ai_summary", "") or "(no summary)"}
        for a in recent
        if a.get("ai_summary")
    ][:20]

    if not today_articles:
        print("[pipeline] No summarized articles to generate At a Glance")
        return

    result = generate_at_a_glance(today_articles)
    if result:
        save_at_a_glance(today, result.get("title", ""), result.get("themes", []), result.get("top_posts", []))
        print(f"[pipeline] At a Glance saved for {today}")
    else:
        print("[pipeline] Failed to generate At a Glance")


def run_export() -> str:
    export_path = os.environ.get(
        "EXPORT_PATH",
        os.path.join(os.path.dirname(__file__), "..", "src", "data", "feed.json"),
    )

    articles = get_recent_articles(limit=50)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    at_a_glance = get_at_a_glance(today)

    if not at_a_glance:
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
    parser.add_argument("--fetch-only", action="store_true")
    parser.add_argument("--summarize-only", action="store_true")
    parser.add_argument("--export-only", action="store_true")
    args = parser.parse_args()

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

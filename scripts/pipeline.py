#!/usr/bin/env python3
"""
Feed pipeline orchestrator for X/Twitter feed experiment.
Entry point for daily X/Twitter feed processing pipeline.

Usage:
    python pipeline.py              # Full run: fetch -> summarize -> export
    python pipeline.py --fetch-only
    python pipeline.py --summarize-only
    python pipeline.py --export-only
"""

import os
import sys
import json
import asyncio
import argparse
from datetime import datetime, timezone
from typing import Optional
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


def load_x_users() -> list[dict]:
    """Load the list of X users to fetch from."""
    users_path = os.environ.get(
        "X_USERS_PATH",
        os.path.join(os.path.dirname(__file__), "x_users.json"),
    )
    with open(users_path, encoding="utf-8") as f:
        return json.load(f)


def load_existing_posts() -> list[dict]:
    """Load posts from the existing feed.json export if available."""
    export_path = os.environ.get(
        "EXPORT_PATH",
        os.path.join(os.path.dirname(__file__), "..", "src", "data", "feed.json"),
    )
    try:
        with open(export_path, encoding="utf-8") as f:
            data = json.load(f)
            return data.get("posts", [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def load_existing_at_a_glance() -> Optional[dict]:
    """Load at_a_glance from the existing feed.json export if available."""
    export_path = os.environ.get(
        "EXPORT_PATH",
        os.path.join(os.path.dirname(__file__), "..", "src", "data", "feed.json"),
    )
    try:
        with open(export_path, encoding="utf-8") as f:
            data = json.load(f)
            return data.get("at_a_glance")
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def run_fetch() -> list[dict]:
    """Fetch tweets from all configured X users, skipping already-seen tweets."""
    from fetcher_x import fetch_all_users

    users = load_x_users()

    # Gather tweet IDs from existing posts so we don't re-fetch them
    existing_posts = load_existing_posts()
    existing_ids = {p["id"] for p in existing_posts if "handle" in p}
    if existing_ids:
        print(f"[pipeline] Skipping {len(existing_ids)} already-fetched tweet IDs")

    print(f"[pipeline] Fetching tweets for {len(users)} X users...")
    try:
        posts = asyncio.run(fetch_all_users(users, limit_per_user=10, days=7, seen_ids=existing_ids))
        print(f"[pipeline]  V Fetched {len(posts)} new tweets total")
        return posts
    except Exception as e:
        print(f"[pipeline]  X Fetch failed: {e}")
        return []


def run_summarize(posts: list[dict]) -> Optional[dict]:
    """Generate At a Glance summary from fetched posts."""
    if not posts:
        print("[pipeline] No posts to summarize")
        return None

    from summarizer import generate_tweet_at_a_glance

    post_inputs = [
        {"author": p.get("author", ""), "text": p.get("text", "")}
        for p in posts
    ]
    print(f"[pipeline] Generating At a Glance from {len(post_inputs)} posts...")
    result = generate_tweet_at_a_glance(post_inputs)
    if result:
        print(f"[pipeline]  V At a Glance generated")
    else:
        print(f"[pipeline]  X Failed to generate At a Glance")
    return result


def run_export(posts: list[dict], at_a_glance: Optional[dict]) -> str:
    """Export posts and at_a_glance to feed.json."""
    export_path = os.environ.get(
        "EXPORT_PATH",
        os.path.join(os.path.dirname(__file__), "..", "src", "data", "feed.json"),
    )

    export = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "posts": posts,
        "at_a_glance": at_a_glance,
    }

    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(export, f, ensure_ascii=False, indent=2)

    print(f"[pipeline] Exported {len(posts)} posts to {export_path}")
    return export_path


def main():
    parser = argparse.ArgumentParser(description="X/Twitter feed pipeline")
    parser.add_argument("--fetch-only", action="store_true")
    parser.add_argument("--summarize-only", action="store_true")
    parser.add_argument("--export-only", action="store_true")
    args = parser.parse_args()

    fetch = not args.summarize_only and not args.export_only
    summarize = not args.fetch_only and not args.export_only
    export_mode = args.export_only or (not args.fetch_only and not args.summarize_only)

    posts: list[dict] = []
    at_a_glance: Optional[dict] = None

    if fetch or args.fetch_only:
        posts = run_fetch()

    if summarize or args.summarize_only:
        if not posts:
            posts = load_existing_posts()
        at_a_glance = run_summarize(posts)

    if export_mode:
        if not posts:
            posts = load_existing_posts()
        if not at_a_glance:
            at_a_glance = load_existing_at_a_glance()
        run_export(posts, at_a_glance)
        print("[pipeline] Export complete")


if __name__ == "__main__":
    main()

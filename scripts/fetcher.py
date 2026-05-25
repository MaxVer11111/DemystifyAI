"""
RSS feed fetcher module.
Handles fetching and parsing RSS feeds using feedparser.
"""

import feedparser
import re
from datetime import datetime
from typing import Optional


def fetch_feed(feed_url: str) -> Optional[list[dict]]:
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
    if hasattr(entry, "content") and entry.content:
        combined = " ".join(c.get("value", "") for c in entry.content)
        if combined.strip():
            return combined

    if hasattr(entry, "summary") and entry.summary:
        return entry.summary

    if hasattr(entry, "description") and entry.description:
        return entry.description

    return ""


def _clean_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

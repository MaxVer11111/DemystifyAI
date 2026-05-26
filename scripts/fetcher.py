"""
RSS feed fetcher module.
Handles fetching and parsing RSS feeds using feedparser.
"""

import feedparser
import re
import requests
from requests.exceptions import RequestException
from datetime import datetime, timezone, timedelta
from typing import Optional

USER_AGENT = "DemystifyAI/1.0 (feed fetcher; +https://demystifyai.com)"


def fetch_feed(feed_url: str, days_threshold: Optional[int] = None, min_content_length: int = 100) -> Optional[list[dict]]:
    try:
        resp = requests.get(feed_url, timeout=30, headers={"User-Agent": USER_AGENT})
        resp.raise_for_status()
        parsed = feedparser.parse(resp.text)
    except RequestException:
        return None

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

        raw_content = _clean_html(content)
        if len(raw_content) < min_content_length:
            continue

        articles.append({
            "title": _clean_html(title),
            "url": url,
            "author": author,
            "published_at": published,
            "raw_content": raw_content,
        })

    if days_threshold is not None:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days_threshold)
        filtered = []
        for a in articles:
            if a["published_at"]:
                try:
                    pub = datetime.fromisoformat(a["published_at"])
                    if pub.replace(tzinfo=pub.tzinfo or timezone.utc) >= cutoff:
                        filtered.append(a)
                except (ValueError, TypeError):
                    filtered.append(a)
        articles = filtered

    def _parse_safe(pub_str: Optional[str]) -> datetime:
        if not pub_str:
            return datetime.min.replace(tzinfo=timezone.utc)
        try:
            return datetime.fromisoformat(pub_str).replace(tzinfo=timezone.utc)
        except (ValueError, TypeError):
            return datetime.min.replace(tzinfo=timezone.utc)

    articles.sort(key=lambda a: _parse_safe(a["published_at"]), reverse=True)

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

"""Tests for the RSS feed fetcher module."""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest

from fetcher import fetch_feed


def make_entry(
    title: str,
    url: str,
    days_ago: int,
    author: str = "Test Author",
) -> object:
    """Create a mock feedparser entry published ``days_ago`` days from now."""
    published = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return type("MockEntry", (), {
        "title": title,
        "link": url,
        "published": published.isoformat(),
        "published_parsed": published.timetuple(),
        "updated": None,
        "updated_parsed": None,
        "summary": f"Content for {title}",
        "author": author,
        "content": [],
    })()


def make_feed(entries: list) -> object:
    return type("MockFeed", (), {"bozo": False, "entries": entries})()


def mock_response(text: str = "") -> object:
    return type("MockResponse", (), {
        "text": text,
        "raise_for_status": lambda self: None,
    })()


@patch("fetcher.requests")
@patch("fetcher.feedparser")
def test_fetch_feed_filters_recent_articles(mock_feedparser, mock_requests):
    """days_threshold=7 returns only articles from the last 7 days."""
    mock_requests.get.return_value = mock_response()

    recent = [
        make_entry("R1", "http://ex.com/1", days_ago=1),
        make_entry("R2", "http://ex.com/2", days_ago=3),
        make_entry("R3", "http://ex.com/3", days_ago=5),
    ]
    old = [
        make_entry("O1", "http://ex.com/4", days_ago=10),
        make_entry("O2", "http://ex.com/5", days_ago=30),
    ]
    mock_feedparser.parse.return_value = make_feed(recent + old)

    result = fetch_feed("http://ex.com/feed", days_threshold=7)

    assert result is not None
    assert len(result) == 3
    urls = {a["url"] for a in result}
    assert "http://ex.com/1" in urls
    assert "http://ex.com/2" in urls
    assert "http://ex.com/3" in urls


@patch("fetcher.requests")
@patch("fetcher.feedparser")
def test_fetch_feed_sorts_by_date_newest_first(mock_feedparser, mock_requests):
    """Articles are returned sorted newest-first by published_at."""
    mock_requests.get.return_value = mock_response()

    entries = [
        make_entry("Oldest", "http://ex.com/1", days_ago=10),
        make_entry("Middle", "http://ex.com/2", days_ago=5),
        make_entry("Newest", "http://ex.com/3", days_ago=1),
    ]
    mock_feedparser.parse.return_value = make_feed(entries)

    result = fetch_feed("http://ex.com/feed")

    assert result is not None
    assert result[0]["title"] == "Newest"
    assert result[1]["title"] == "Middle"
    assert result[2]["title"] == "Oldest"


@patch("fetcher.requests")
@patch("fetcher.feedparser")
def test_fetch_feed_returns_empty_when_all_stale(mock_feedparser, mock_requests):
    """days_threshold returns [] when no articles are recent enough."""
    mock_requests.get.return_value = mock_response()

    entries = [
        make_entry("Old", "http://ex.com/1", days_ago=20),
        make_entry("Older", "http://ex.com/2", days_ago=60),
    ]
    mock_feedparser.parse.return_value = make_feed(entries)

    result = fetch_feed("http://ex.com/feed", days_threshold=7)

    assert result == []


@patch("fetcher.requests")
@patch("fetcher.feedparser")
def test_fetch_feed_handles_bad_date_string(mock_feedparser, mock_requests):
    """Non-ISO date strings don't crash fetch_feed."""
    mock_requests.get.return_value = mock_response()

    entries = [
        make_entry("Good", "http://ex.com/1", days_ago=2),
        type("MockEntry", (), {
            "title": "Bad Date",
            "link": "http://ex.com/2",
            "published": "Mon, 01 Jan 0001 00:00:00 +0000",
            "published_parsed": None,
            "updated": None,
            "updated_parsed": None,
            "summary": "Bad date content",
            "author": "Test",
            "content": [],
        })(),
        make_entry("Also Good", "http://ex.com/3", days_ago=4),
    ]
    mock_feedparser.parse.return_value = make_feed(entries)

    result = fetch_feed("http://ex.com/feed", days_threshold=30)

    assert result is not None
    assert len(result) == 3
    assert result[-1]["title"] == "Bad Date"


@patch("fetcher.requests")
@patch("fetcher.feedparser")
def test_fetch_feed_excludes_dateless_when_threshold_set(mock_feedparser, mock_requests):
    """Articles without published_at are excluded when days_threshold is set."""
    mock_requests.get.return_value = mock_response()

    entries = [
        make_entry("Has Date", "http://ex.com/1", days_ago=2),
        type("MockEntry", (), {
            "title": "No Date",
            "link": "http://ex.com/2",
            "published": "",
            "published_parsed": None,
            "updated": "",
            "updated_parsed": None,
            "summary": "No date content",
            "author": "Unknown",
            "content": [],
        })(),
    ]
    mock_feedparser.parse.return_value = make_feed(entries)

    result = fetch_feed("http://ex.com/feed", days_threshold=7)

    assert result is not None
    assert len(result) == 1
    assert result[0]["title"] == "Has Date"


@patch("fetcher.requests")
@patch("fetcher.feedparser")
def test_fetch_feed_returns_none_on_http_error(mock_feedparser, mock_requests):
    """fetch_feed returns None when HTTP request fails."""
    from requests import RequestException
    mock_requests.get.side_effect = RequestException("Connection error")

    result = fetch_feed("http://ex.com/feed")

    assert result is None

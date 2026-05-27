"""Tests for the X/Twitter feed fetcher (twscrape)."""

import sys
import os
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock, AsyncMock

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fetcher_x import fetch_user_tweets, fetch_all_users


def _make_mock_user(display_name="Test User", username="testuser"):
    user = MagicMock()
    user.displayname = display_name
    user.username = username
    return user


def _make_mock_media(has_photos: bool = False) -> MagicMock:
    """Create a mock Media object matching twscrape's Media dataclass shape."""
    media = MagicMock()
    media.photos = [MagicMock(url="https://x.com/photo.jpg")] if has_photos else []
    media.videos = []
    media.animated = []
    return media


def _make_mock_tweet(
    tweet_id: int,
    created_at: datetime | None = None,
    is_reply: bool = False,
    media: MagicMock | None = None,
    like_count: int = 10,
    retweet_count: int = 5,
    display_name="Test User",
    login="testuser",
):
    tweet = MagicMock()
    tweet.id = tweet_id
    tweet.user = _make_mock_user(display_name, login)
    tweet.rawContent = f"Tweet {tweet_id} content"
    tweet.date = created_at or datetime.now(timezone.utc)
    tweet.likeCount = like_count
    tweet.retweetCount = retweet_count
    tweet.inReplyToTweetId = 99999 if is_reply else None
    tweet.media = media or _make_mock_media()
    return tweet


class _AsyncGen:
    """Helper that wraps a list into an async generator."""

    def __init__(self, items):
        self._items = list(reversed(items))  # twscrape returns newest-first

    def __aiter__(self):
        return self

    async def __anext__(self):
        if not self._items:
            raise StopAsyncIteration
        return self._items.pop()


@pytest.mark.asyncio
async def test_fetch_user_tweets_skips_seen_ids(monkeypatch):
    """Tweets whose IDs are in seen_ids are filtered out."""
    monkeypatch.setenv("auth_token", "test-token")
    monkeypatch.setenv("ct0", "test-ct0")

    now = datetime.now(timezone.utc)
    mock_tweets = [
        _make_mock_tweet(101, now - timedelta(hours=1)),
        _make_mock_tweet(102, now - timedelta(hours=2)),
        _make_mock_tweet(103, now - timedelta(hours=3)),
        _make_mock_tweet(104, now - timedelta(hours=4)),
    ]

    seen_ids = {"102", "104"}

    with patch("twscrape.API") as MockAPI:
        api_instance = MockAPI.return_value
        api_instance.user_by_login = AsyncMock()
        api_instance.user_by_login.return_value = _make_mock_user()

        api_instance.user_tweets = MagicMock()
        api_instance.user_tweets.return_value = _AsyncGen(mock_tweets)

        # Pool operations need to be awaitable to pass the auth setup
        api_instance.pool.add_account = AsyncMock()
        api_instance.pool.login_all = AsyncMock()

        result = await fetch_user_tweets(
            "testuser", limit=10, days=30, seen_ids=seen_ids
        )

    # Should return only tweets 101 and 103 (not in seen_ids)
    result_ids = {int(t["id"]) for t in result}
    assert result_ids == {101, 103}
    assert len(result) == 2

    # Order should be newest-first (101 is newer than 103)
    assert result[0]["id"] == "101"  # newest
    assert result[1]["id"] == "103"


@pytest.mark.asyncio
async def test_fetch_all_users_retries_twice_on_failure(monkeypatch):
    """fetch_all_users retries a failed fetch up to 2 additional times before giving up."""
    monkeypatch.setenv("auth_token", "test-token")
    monkeypatch.setenv("ct0", "test-ct0")
    users = [{"handle": "user1"}]

    with patch("fetcher_x._setup_api") as mock_setup_api:
        mock_api = MagicMock()
        mock_api.pool.reset_locks = AsyncMock()
        mock_setup_api.return_value = mock_api
        with patch("fetcher_x._setup_account", new_callable=AsyncMock):
            with patch("fetcher_x.fetch_user_tweets", new_callable=AsyncMock) as mock_fetch:
                mock_fetch.side_effect = [RuntimeError("boom"), RuntimeError("boom"), RuntimeError("boom")]

                result = await fetch_all_users(users, limit_per_user=5, days=7)

    assert result == []
    assert mock_fetch.call_count == 3  # initial + 2 retries


@pytest.mark.asyncio
async def test_fetch_all_users_succeeds_on_retry(monkeypatch):
    """When the first attempt fails but a retry succeeds, the result is used."""
    monkeypatch.setenv("auth_token", "test-token")
    monkeypatch.setenv("ct0", "test-ct0")
    users = [{"handle": "user1"}]

    with patch("fetcher_x._setup_api") as mock_setup_api:
        mock_api = MagicMock()
        mock_api.pool.reset_locks = AsyncMock()
        mock_setup_api.return_value = mock_api
        with patch("fetcher_x._setup_account", new_callable=AsyncMock):
            with patch("fetcher_x.fetch_user_tweets", new_callable=AsyncMock) as mock_fetch:
                mock_fetch.side_effect = [RuntimeError("boom"), [{"id": "42"}]]

                result = await fetch_all_users(users, limit_per_user=5, days=7)

    assert result == [{"id": "42"}]
    assert mock_fetch.call_count == 2  # initial + 1 retry


@pytest.mark.asyncio
async def test_fetch_all_users_passes_seen_ids(monkeypatch):
    """fetch_all_users passes seen_ids through to fetch_user_tweets."""
    monkeypatch.setenv("auth_token", "test-token")
    monkeypatch.setenv("ct0", "test-ct0")
    users = [{"handle": "user1"}, {"handle": "user2"}]
    seen_ids = {"999", "888"}

    with patch("fetcher_x._setup_api") as mock_setup_api:
        mock_api = MagicMock()
        mock_api.pool.reset_locks = AsyncMock()
        mock_setup_api.return_value = mock_api
        with patch("fetcher_x._setup_account", new_callable=AsyncMock):
            with patch("fetcher_x.fetch_user_tweets", new_callable=AsyncMock) as mock_fetch:
                mock_fetch.side_effect = [[], []]

                result = await fetch_all_users(users, limit_per_user=5, days=7, seen_ids=seen_ids)

    assert result == []
    assert mock_fetch.call_count == 2
    # Each call should receive seen_ids
    for call_args in mock_fetch.call_args_list:
        assert call_args.kwargs.get("seen_ids") == seen_ids
        assert call_args.kwargs.get("limit") == 5
        assert call_args.kwargs.get("days") == 7

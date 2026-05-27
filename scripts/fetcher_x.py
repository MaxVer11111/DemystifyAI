"""
X/Twitter feed fetcher using twscrape.
Fetches recent tweets from a configured list of X users.
"""

from __future__ import annotations

import os
import asyncio
from datetime import datetime, timezone, timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from twscrape import API


_TWS_TIMEOUT = int(os.environ.get("FETCHER_X_TIMEOUT", "30"))  # seconds per twscrape API call
_TWS_PROXY = os.environ.get("FETCHER_X_PROXY") or None  # e.g. "http://127.0.0.1:7897"


def _setup_api():
    """Create a twscrape API instance, optionally with a proxy (imported lazily for test patching)."""
    from twscrape import API
    from twscrape.logger import set_log_level  # noqa: PLC0415

    set_log_level("WARNING")
    return API(proxy=_TWS_PROXY)


async def _setup_account(api: API) -> None:
    """Add one X account to the pool from environment credentials (cookies or login/password)."""
    auth_token = os.environ.get("auth_token")
    ct0 = os.environ.get("ct0")

    if auth_token and ct0:
        cookies = f"auth_token={auth_token}; ct0={ct0}"
        await api.pool.add_account(
            os.environ.get("X_USERNAME", "x_user"),
            os.environ.get("X_PASSWORD", "x_pass"),
            os.environ.get("X_EMAIL", "x@x.com"),
            os.environ.get("X_EMAIL_PASSWORD", "x_pass"),
            cookies=cookies,
        )
    elif os.environ.get("X_USERNAME"):
        await api.pool.add_account(
            os.environ.get("X_USERNAME", ""),
            os.environ.get("X_PASSWORD", ""),
            os.environ.get("X_EMAIL", ""),
            os.environ.get("X_EMAIL_PASSWORD", ""),
        )
        await api.pool.login_all()
    else:
        raise RuntimeError(
            "No X/Twitter auth configured. Set auth_token + ct0 "
            "(or X_USERNAME + X_PASSWORD) in the environment."
        )


async def _fetch_single(
    api: API,
    handle: str,
    limit: int = 20,
    days: int = 7,
    seen_ids: set[str] | None = None,
) -> list[dict]:
    """
    Fetch recent tweets for one X user using an already-configured API instance.

    Pass ``seen_ids`` (a set of tweet ID strings) to skip tweets that
    have already been fetched in a previous run.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    tweets: list[dict] = []

    user = await asyncio.wait_for(api.user_by_login(handle), timeout=_TWS_TIMEOUT)
    if user is None:
        raise RuntimeError(f"User @{handle} not found — check the handle and auth credentials.")

    tweets_gen = api.user_tweets(user.id, limit=limit)
    while True:
        try:
            tweet = await asyncio.wait_for(tweets_gen.__anext__(), timeout=_TWS_TIMEOUT)
        except StopAsyncIteration:
            break

        tweet_date = tweet.date
        if tweet_date.tzinfo is None:
            tweet_date = tweet_date.replace(tzinfo=timezone.utc)
        if tweet_date < cutoff:
            break

        if tweet.inReplyToTweetId is not None and not (
            tweet.media.photos or tweet.media.videos or tweet.media.animated
        ):
            continue

        if seen_ids and str(tweet.id) in seen_ids:
            continue

        images = []
        for photo in tweet.media.photos:
            if photo.url:
                images.append(photo.url)
        for video in tweet.media.videos:
            if video.thumbnailUrl:
                images.append(video.thumbnailUrl)
        for anim in tweet.media.animated:
            if anim.thumbnailUrl:
                images.append(anim.thumbnailUrl)

        tweets.append({
            "id": str(tweet.id),
            "author": tweet.user.displayname or handle,
            "handle": f"@{tweet.user.username}",
            "text": tweet.rawContent,
            "images": images,
            "url": f"https://x.com/{tweet.user.username}/status/{tweet.id}",
            "likes": tweet.likeCount or 0,
            "reposts": tweet.retweetCount or 0,
            "created_at": tweet.date.isoformat() if tweet.date else datetime.now(timezone.utc).isoformat(),
        })

        if len(tweets) >= limit:
            break

    return tweets


async def fetch_user_tweets(
    handle: str,
    limit: int = 20,
    days: int = 7,
    seen_ids: set[str] | None = None,
    api: API | None = None,
) -> list[dict]:
    """
    Fetch recent tweets from a single X user using twscrape.

    If ``api`` is provided, it is used directly (avoids redundant setup).
    Otherwise creates its own API instance and account setup.

    Pass ``seen_ids`` (a set of tweet ID strings) to skip tweets that
    have already been fetched in a previous run.

    Requires X credentials in the environment:
        auth_token + ct0  (cookie-based auth, recommended)
        or X_USERNAME + X_PASSWORD + X_EMAIL + X_EMAIL_PASSWORD
    """
    if api is None:
        api = _setup_api()
        await _setup_account(api)

    return await _fetch_single(api, handle, limit=limit, days=days, seen_ids=seen_ids)


async def fetch_all_users(
    users: list[dict],
    limit_per_user: int = 10,
    days: int = 7,
    seen_ids: set[str] | None = None,
) -> list[dict]:
    """
    Fetch tweets from all configured X users using a single API session.
    Returns a combined list sorted by created_at descending.

    Pass ``seen_ids`` to skip tweets already fetched in a previous run.
    """
    api = _setup_api()
    await _setup_account(api)
    await api.pool.reset_locks()

    all_tweets: list[dict] = []
    for user in users:
        handle = user["handle"]

        for attempt in range(3):  # initial attempt + 2 retries
            if attempt > 0:
                print(f"[fetcher_x]  Retry {attempt}/2 for @{handle}...", flush=True)
            print(f"[fetcher_x] Fetching @{handle}...", flush=True)
            try:
                tweets = await fetch_user_tweets(handle, limit=limit_per_user, days=days, seen_ids=seen_ids, api=api)
                print(f"[fetcher_x]  -> {len(tweets)} tweets from @{handle}", flush=True)
                all_tweets.extend(tweets)
                break
            except asyncio.TimeoutError:
                print(f"[fetcher_x]  -> Timeout fetching @{handle} (>{_TWS_TIMEOUT}s)", flush=True)
            except Exception as e:
                exc_type = type(e).__name__
                print(f"[fetcher_x]  -> {exc_type} fetching @{handle}: {e}", flush=True)
        else:
            print(f"[fetcher_x]  -> Giving up on @{handle} after 3 attempts", flush=True)

    all_tweets.sort(key=lambda t: t.get("created_at", ""), reverse=True)
    return all_tweets

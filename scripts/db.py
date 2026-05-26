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
    id          TEXT PRIMARY KEY,
    source_id   TEXT NOT NULL,
    source_name TEXT NOT NULL,
    title       TEXT NOT NULL,
    author      TEXT,
    url         TEXT NOT NULL UNIQUE,
    published_at TEXT,
    raw_content   TEXT,
    source_category TEXT,
    ai_summary    TEXT,
    tags        TEXT,
    fetched_at  TEXT NOT NULL,
    processed   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS at_a_glance (
    date        TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    themes      TEXT NOT NULL,
    top_posts   TEXT NOT NULL,
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
    conn = get_connection()
    conn.executescript(SCHEMA_SQL)
    # Migration: add source_category column for existing databases
    try:
        conn.execute("ALTER TABLE articles ADD COLUMN source_category TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    conn.commit()
    conn.close()


def article_exists(url: str) -> bool:
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
    source_category: str = "",
) -> str:
    import hashlib
    article_id = hashlib.sha256(url.encode()).hexdigest()[:16]
    now = datetime.utcnow().isoformat()
    conn = get_connection()
    conn.execute(
        """INSERT OR IGNORE INTO articles
           (id, source_id, source_name, title, author, url, published_at, raw_content, source_category, fetched_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (article_id, source_id, source_name, title, author, url, published_at, raw_content, source_category, now),
    )
    conn.commit()
    conn.close()
    return article_id


def update_summary(article_id: str, summary: str, tags: list[str]) -> None:
    import json
    conn = get_connection()
    conn.execute(
        "UPDATE articles SET ai_summary = ?, tags = ?, processed = 1 WHERE id = ?",
        (summary, json.dumps(tags), article_id),
    )
    conn.commit()
    conn.close()


def get_unprocessed_articles() -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, title, raw_content, source_name FROM articles WHERE processed = 0"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


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


def save_at_a_glance(date_str: str, title: str, themes: list[str], top_posts: list[dict]) -> None:
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
    now = datetime.utcnow().isoformat()
    conn = get_connection()
    conn.execute(
        "INSERT INTO fetch_log (source_id, fetched_at, new_count, error) VALUES (?, ?, ?, ?)",
        (source_id, now, new_count, error),
    )
    conn.commit()
    conn.close()

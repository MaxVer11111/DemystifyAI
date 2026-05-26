"""Tests for the SQLite database layer."""

import sys
import os
import tempfile
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from db import init_db, get_connection, insert_article, get_recent_articles


@pytest.fixture(autouse=True)
def _isolated_db(monkeypatch):
    """Use a temporary file-backed database for each test."""
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    monkeypatch.setenv("DB_PATH", tmp.name)
    init_db()
    yield
    tmp.close()
    os.unlink(tmp.name)


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

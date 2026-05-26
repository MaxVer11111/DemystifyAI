"""One-time migration: backfill source_category for existing articles."""
import json
import os
import sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
sys.path.insert(0, os.path.dirname(__file__))

from db import get_connection


def backfill_source_categories():
    sources_path = os.environ.get(
        "SOURCES_PATH",
        os.path.join(os.path.dirname(__file__), "sources.json"),
    )
    with open(sources_path, encoding="utf-8") as f:
        sources = json.load(f)

    src_map = {s["id"]: s.get("category", "") for s in sources}
    print(f"Loaded {len(src_map)} source categories")

    conn = get_connection()
    rows = conn.execute(
        "SELECT id, source_id FROM articles WHERE source_category IS NULL OR source_category = ''"
    ).fetchall()
    print(f"Found {len(rows)} articles missing source_category")

    updated = 0
    for row in rows:
        category = src_map.get(row["source_id"], "")
        if category:
            conn.execute(
                "UPDATE articles SET source_category = ? WHERE id = ?",
                (category, row["id"]),
            )
            updated += 1

    conn.commit()
    conn.close()
    print(f"Updated {updated} articles with source_category")


if __name__ == "__main__":
    backfill_source_categories()

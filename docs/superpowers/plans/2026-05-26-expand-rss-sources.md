# Expand RSS Sources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add The Keyword and 71 missing RSS sources from the OPML gist to sources.json with proper categorization.

**Architecture:** Simple config expansion — update `scripts/sources.json` with new source entries. Add a validation test to ensure data integrity.

**Tech Stack:** Python (pytest for validation), JSON config

---

### Task 1: Write validation test for sources.json

**Files:**
- Modify: `scripts/tests/test_fetcher.py`
- Test: `scripts/tests/test_fetcher.py`

- [ ] **Step 1: Add test to validate sources.json schema and verify new sources exist**

Add these test functions to `scripts/tests/test_fetcher.py`:

```python
import json
import os

SOURCES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sources.json")

REQUIRED_FIELDS = {"id", "name", "site_url", "feed_url", "category", "enabled"}

EXPECTED_NEW_SOURCES = {
    "simonwillison",
    "garymarcus",
    "minimaxir",
    "geohot",
    "lcamtuf",
    "micahflee",
    "brutecat",
    "berthub",
    "mjg59",
    "tedunangst",
    "antirez",
    "mitchellh",
    "oldnewthing",
    "matklad",
    "jyn",
    "eli",
    "fabiensanglard",
    "bernsteinbear",
    "sgtatham",
    "stapelberg",
    "entropicthoughts",
    "xeiaso",
    "susam",
    "overreacted",
    "jimnielsen",
    "lucumr",
    "miguelgrinberg",
    "geoffreylitt",
    "skyfall",
    "pixelmelt",
    "seangoedecke",
    "rachelbythebay",
    "terriblesoftware",
    "hillelwayne",
    "worksonmymachine",
    "evanhahn",
    "rakhim",
    "gilesthomas",
    "hugotunius",
    "chadnauseam",
    "danielchasehooper",
    "grantslatton",
    "nesbitt",
    "timsh",
    "jayd",
    "philiplaine",
    "danieldelaney",
    "martinalderson",
    "tomrenner",
    "utcc",
    "matduggan",
    "dragas",
    "jeffgeerling",
    "righto",
    "downtowndougbrown",
    "oldvcr",
    "abortretry",
    "dfarq",
    "johndcook",
    "bogdanthegeek",
    "computerrip",
    "shkspr",
    "xania",
    "heyparis",
    "ericmigi",
    "keygen",
    "idiallo",
    "maurycyz",
    "borretti",
    "simone",
    "danielwirtz",
    "aresluna",
    "beej",
    "thekeyword",
}


def test_sources_json_structure():
    """All sources have required fields and valid types."""
    with open(SOURCES_PATH, encoding="utf-8") as f:
        sources = json.load(f)

    assert isinstance(sources, list)
    assert len(sources) > 0

    for source in sources:
        missing = REQUIRED_FIELDS - set(source.keys())
        assert not missing, f"Source {source.get('id', '?')} missing fields: {missing}"
        assert isinstance(source["id"], str) and source["id"]
        assert isinstance(source["name"], str) and source["name"]
        assert source["feed_url"].startswith("http"), f"{source['id']}: invalid feed_url"
        assert isinstance(source["enabled"], bool)


def test_new_sources_are_present():
    """All expected new sources from the OPML expansion are present."""
    with open(SOURCES_PATH, encoding="utf-8") as f:
        sources = json.load(f)

    present_ids = {s["id"] for s in sources}
    missing = EXPECTED_NEW_SOURCES - present_ids
    assert not missing, f"Missing expected sources: {missing}"


def test_no_duplicate_ids():
    """No duplicate source IDs exist."""
    with open(SOURCES_PATH, encoding="utf-8") as f:
        sources = json.load(f)

    ids = [s["id"] for s in sources]
    assert len(ids) == len(set(ids)), "Duplicate source IDs found"


def test_no_duplicate_feed_urls():
    """No duplicate feed URLs exist."""
    with open(SOURCES_PATH, encoding="utf-8") as f:
        sources = json.load(f)

    urls = [s["feed_url"] for s in sources]
    assert len(urls) == len(set(urls)), "Duplicate feed URLs found"


def test_enabled_sources_have_valid_ids():
    """Source IDs are alphanumeric with hyphens only."""
    import re
    with open(SOURCES_PATH, encoding="utf-8") as f:
        sources = json.load(f)

    for s in sources:
        assert re.match(r"^[a-z0-9-]+$", s["id"]), f"Invalid id: {s['id']}"
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd scripts && python -m pytest tests/test_fetcher.py::test_new_sources_are_present -v`
Expected: FAIL — the new sources aren't in sources.json yet

---

### Task 2: Add new sources to sources.json

**Files:**
- Modify: `scripts/sources.json`

- [ ] **Step 1: Add The Keyword entry**

Add to `scripts/sources.json`:
```json
  {
    "id": "thekeyword",
    "name": "The Keyword (Google Blog)",
    "site_url": "https://blog.google",
    "feed_url": "https://blog.google/rss/",
    "category": "Tech News You Actually Need to Know",
    "icon_url": null,
    "enabled": true
  }
```

- [ ] **Step 2: Add all 71 missing OPML sources**

Append entries for all 71 missing sources organized by category (see source code for complete list).

- [ ] **Step 3: Run the validation test to verify it passes**

Run: `cd scripts && python -m pytest tests/ -v`
Expected: All tests PASS

---

### Task 3: Run existing tests

**Files:** (none)

- [ ] **Step 1: Run all existing tests**

Run: `cd scripts && python -m pytest tests/ -v`
Expected: All existing fetcher tests still pass

- [ ] **Step 2: Commit**

```bash
git add scripts/sources.json scripts/tests/test_fetcher.py
git commit -m "feat: expand RSS sources to 90+ with The Keyword and OPML sources"
```

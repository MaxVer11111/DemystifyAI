"""Tests for summarizer with tag generation removed."""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from summarizer import summarize_article


def test_summarize_article_returns_only_summary(monkeypatch):
    """summarize_article returns a dict with only 'summary' key (no 'tags')."""

    class FakeMessage:
        content = json.dumps({"summary": "This is a test summary."})

    class FakeChoice:
        def __init__(self):
            self.message = FakeMessage()

    class FakeResponse:
        def __init__(self):
            self.choices = [FakeChoice()]

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        @property
        def chat(self):
            return self

        @property
        def completions(self):
            return self

        def create(self, *args, **kwargs):
            return FakeResponse()

    monkeypatch.setenv("DEEPSEEK_API_KEY", "test-key")
    monkeypatch.setattr("summarizer.OpenAI", lambda **kw: FakeClient())

    result = summarize_article("Test Title", "Some content here.")
    assert result is not None
    assert "summary" in result
    assert "tags" not in result  # tags should no longer be present
    assert result["summary"] == "This is a test summary."

"""Tests for the DeepSeek article summarization module."""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from summarizer import summarize_article


def _mock_summarizer(monkeypatch, summary_text: str):
    """Set up a fake DeepSeek client that returns the given summary text."""
    class FakeMessage:
        content = json.dumps({"summary": summary_text})

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


def test_summarize_article_returns_only_summary(monkeypatch):
    """summarize_article returns a dict with only 'summary' key (no 'tags')."""
    _mock_summarizer(monkeypatch, "This is a test summary.")

    result = summarize_article("Test Title", "Some content here.")
    assert result is not None
    assert "summary" in result
    assert "tags" not in result
    assert result["summary"] == "This is a test summary."


def test_summarize_article_empty_content_returns_none(monkeypatch):
    """Empty content returns None without calling the API."""
    _mock_summarizer(monkeypatch, "This won't be reached.")

    result = summarize_article("Test Title", "")
    assert result is None


def test_summarize_article_empty_summary_returns_none(monkeypatch):
    """If the LLM returns an empty summary, the function returns None."""
    _mock_summarizer(monkeypatch, "")

    result = summarize_article("Test Title", "Some content here.")
    assert result is None


def test_summarize_article_api_exception_returns_none(monkeypatch):
    """If the API call raises an exception, the function returns None."""
    monkeypatch.setenv("DEEPSEEK_API_KEY", "test-key")

    class FailingClient:
        def __init__(self, *args, **kwargs):
            pass
        @property
        def chat(self):
            return self
        @property
        def completions(self):
            return self
        def create(self, *args, **kwargs):
            raise Exception("API error")

    monkeypatch.setattr("summarizer.OpenAI", lambda **kw: FailingClient())

    result = summarize_article("Test Title", "Some content here.")
    assert result is None

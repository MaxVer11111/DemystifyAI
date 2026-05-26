"""
DeepSeek API integration for article summarization and tagging.
Uses OpenAI-compatible SDK to call DeepSeek API.
"""

import os
import json
from openai import OpenAI
from typing import Optional


SUMMARY_PROMPT = """You are an AI assistant that helps summarize AI news articles for a non-technical audience.

For the article below, produce a JSON response with exactly these fields:
{{
  "summary": "1-3 sentence plain-language summary. Assume the reader is curious but not a technical expert. Focus on WHAT happened and WHY it matters."
}}

Article title: {title}
Article text:
{content}
"""

AT_A_GLANCE_PROMPT = """You are an AI assistant that summarizes a daily collection of AI news articles.

Given the list of today's articles (with titles and summaries), produce a JSON response with exactly these fields:
{{
  "title": "A single sentence summarizing today's feed overall. Start with 'Today's feed...'. Example: 'Today's feed spans frontier model releases, open-source breakthroughs, and product launches.'",
  "themes": ["Theme1", "Theme2", "Theme3"],
  "top_posts": [
    {{"name": "Article Title 1", "desc": "Very brief reason it's important"}},
    {{"name": "Article Title 2", "desc": "Very brief reason it's important"}}
  ]
}}

Rules:
- themes: 2-5 broad themes that capture what today's articles are about
- top_posts: 2-4 most important articles, sorted by importance. Keep desc under 10 words.
- Be honest — if nothing stands out, just list the top articles without hyperbole.

Today's articles ({article_count} total):
{articles}
"""


def _get_client() -> OpenAI:
    return OpenAI(
        api_key=os.environ["DEEPSEEK_API_KEY"],
        base_url=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )


def _escape_format(text: str) -> str:
    """Escape curly braces so str.format() doesn't interpret them."""
    return text.replace("{", "{{").replace("}", "}}")

def summarize_article(title: str, content: str) -> Optional[dict]:
    if not content.strip():
        return None

    truncated = content[:8000]

    try:
        client = _get_client()
        model = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash")
        prompt = SUMMARY_PROMPT.format(
            title=_escape_format(title),
            content=_escape_format(truncated),
        )

        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        text = resp.choices[0].message.content.strip()
        result = json.loads(text)

        return {
            "summary": result.get("summary", "").strip(),
        }

    except Exception as e:
        print(f"[summarizer] Error summarizing '{title[:40]}': {e}")
        return None


def generate_at_a_glance(articles: list[dict]) -> Optional[dict]:
    if not articles:
        return None

    try:
        client = _get_client()
        model = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash")

        summaries = []
        for a in articles:
            summaries.append(f"- {a['title']}: {a['summary']}")

        articles_text = _escape_format("\n".join(summaries))
        prompt = AT_A_GLANCE_PROMPT.format(article_count=len(articles), articles=articles_text)

        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        text = resp.choices[0].message.content.strip()
        result = json.loads(text)

        return {
            "title": result.get("title", "").strip(),
            "themes": result.get("themes", []),
            "top_posts": result.get("top_posts", []),
        }

    except Exception as e:
        print(f"[summarizer] Error generating At a Glance: {e}")
        return None

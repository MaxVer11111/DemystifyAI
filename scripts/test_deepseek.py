"""Quick test to check DeepSeek API response format."""
import os, json
from dotenv import load_dotenv

load_dotenv(".env")
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["DEEPSEEK_API_KEY"],
    base_url=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
)
model = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")

print(f"Model: {model}")
print(f"Base URL: {os.environ.get('DEEPSEEK_BASE_URL', 'default')}")

try:
    resp = client.chat.completions.create(
        model=model,
        messages=[{
            "role": "user",
            "content": 'Say hello in JSON format: {"greeting": "hello", "language": "English"}',
        }],
        response_format={"type": "json_object"},
        max_tokens=200,
    )
    content = resp.choices[0].message.content.strip()
    print(f"Raw response:\n{content}\n")
    parsed = json.loads(content)
    print(f"Parsed OK: {parsed}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

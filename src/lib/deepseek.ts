export interface AnalysisResult {
  relevant: boolean;
  score: number;
  plain_summary: string;
  tags: string[];
  keep_original: boolean;
}

export interface ChatClient {
  chat: {
    completions: {
      create(params: Record<string, unknown>): Promise<{
        choices: Array<{ message: { content: string | null } }>;
      }>;
    };
  };
}

const ANALYSIS_PROMPT = `You are a content filter for a website that helps non-technical people understand AI.

Analyze this social media post and respond with JSON only:

POST:
"""
{text}
"""

AUTHOR: {author}

Respond with this exact JSON structure:
{
  "relevant": true,
  "score": 7,
  "plain_summary": "One sentence summary here",
  "tags": ["AI Basics"],
  "keep_original": true
}

Rules:
- relevant: Is this genuinely about AI, tech, or its societal impact? Skip memes, personal life, off-topic rants.
- score: 10 = essential reading, 1 = noise
- plain_summary: 1-sentence plain English summary. Escape any double quotes inside the string with backslash.
- tags: 1-3 from [AI Basics, Research, Ethics, Tools, News, Business, Education, Product, Coding]
- keep_original: should we show the original text, or just your summary?

Return ONLY the JSON object. No markdown fences, no explanation, no preamble.`;

/** Create the production OpenAI client. Uses dynamic import to avoid loading the SDK in tests. */
export async function createClient(): Promise<ChatClient> {
  const { default: OpenAI } = await import("openai");
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    timeout: 15000,
    maxRetries: 1,
  }) as unknown as ChatClient;
}

/**
 * Extract a JSON object from a string that may contain markdown fences,
 * preamble text, or be truncated mid-string.
 */
function extractJSON(raw: string): Record<string, unknown> | null {
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through to repair attempts
  }

  try {
    return JSON.parse(repairTruncated(cleaned));
  } catch {
    return null;
  }
}

function repairTruncated(json: string): string {
  let repaired = json;

  const inString =
    (repaired.match(/(?<!\\)"/g) || []).length % 2 === 1;
  if (inString) {
    repaired += '"';
  }

  const openArrays = (repaired.match(/\[/g) || []).length;
  const closeArrays = (repaired.match(/\]/g) || []).length;
  for (let i = 0; i < openArrays - closeArrays; i++) {
    repaired += "]";
  }

  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += "}";
  }

  return repaired;
}

export async function analyzePost(
  text: string,
  author: string,
  client?: ChatClient
): Promise<AnalysisResult | null> {
  if (!process.env.DEEPSEEK_API_KEY) return null;

  const c = client || (await createClient());

  try {
    const response = await c.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "user" as const,
          content: ANALYSIS_PROMPT.replace("{text}", text).replace("{author}", author),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = extractJSON(raw);
    if (!parsed) {
      console.error("[deepseek] failed to parse JSON from:", raw.slice(0, 200));
      return null;
    }

    const p = parsed as Record<string, unknown>;

    if (
      typeof p.relevant !== "boolean" ||
      typeof p.score !== "number" ||
      typeof p.plain_summary !== "string" ||
      !Array.isArray(p.tags)
    ) {
      return null;
    }

    return {
      relevant: p.relevant,
      score: p.score,
      plain_summary: p.plain_summary,
      tags: p.tags as string[],
      keep_original: (p.keep_original as boolean) ?? false,
    };
  } catch (err) {
    console.error("[deepseek] analyzePost failed:", (err as Error).message);
    return null;
  }
}

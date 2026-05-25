import { describe, test, expect, beforeEach, vi } from "vitest";
import { analyzePost, type AnalysisResult, type ChatClient } from "../deepseek";

const MOCK_API_KEY = "sk-test-deepseek-key";

function mockClient() {
  const mockCreate = vi.fn();
  return {
    chat: { completions: { create: mockCreate } },
    _mockCreate: mockCreate,
  };
}

function mockResponse(client: ReturnType<typeof mockClient>, json: AnalysisResult) {
  client._mockCreate.mockResolvedValue({
    choices: [{ message: { content: JSON.stringify(json) } }],
  });
}

function mockRejection(client: ReturnType<typeof mockClient>, error: Error) {
  client._mockCreate.mockRejectedValue(error);
}

describe("analyzePost", () => {
  beforeEach(() => {
    process.env.DEEPSEEK_API_KEY = MOCK_API_KEY;
  });

  test("returns structured analysis when DeepSeek responds with valid JSON", async () => {
    const expected: AnalysisResult = {
      relevant: true,
      score: 9,
      plain_summary: "A major AI model release with open-source implications.",
      tags: ["Research", "Tools"],
      keep_original: true,
    };

    const client = mockClient();
    mockResponse(client, expected);

    const result = await analyzePost(
      "DeepSeek-V4 released under MIT license with state-of-the-art benchmarks.",
      "Tech Reporter",
      client as unknown as ChatClient
    );

    expect(result).toEqual(expected);
  });

  test("includes the post text and author in the prompt sent to DeepSeek", async () => {
    const client = mockClient();
    mockResponse(client, {
      relevant: true, score: 7, plain_summary: "Test.", tags: ["News"], keep_original: false,
    });

    await analyzePost("AI advances rapidly in 2026.", "Jane Doe", client as unknown as ChatClient);

    const callArgs = client._mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe("deepseek-v4-flash");
    expect(callArgs.messages[0].content).toContain("AI advances rapidly in 2026.");
    expect(callArgs.messages[0].content).toContain("Jane Doe");
    expect(callArgs.response_format).toEqual({ type: "json_object" });
    expect(callArgs.temperature).toBe(0.1);
  });

  test("returns null when DeepSeek API call fails", async () => {
    const client = mockClient();
    mockRejection(client, new Error("Network timeout"));

    const result = await analyzePost("Some post.", "Author", client as unknown as ChatClient);
    expect(result).toBeNull();
  });

  test("returns null when DeepSeek response is not valid JSON", async () => {
    const client = mockClient();
    client._mockCreate.mockResolvedValue({
      choices: [{ message: { content: "not valid json {{{" } }],
    });

    const result = await analyzePost("Some post.", "Author", client as unknown as ChatClient);
    expect(result).toBeNull();
  });

  test("returns null when DeepSeek response is missing required fields", async () => {
    const client = mockClient();
    client._mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ irrelevant_field: true }) } }],
    });

    const result = await analyzePost("Some post.", "Author", client as unknown as ChatClient);
    expect(result).toBeNull();
  });

  test("returns null when DEEPSEEK_API_KEY is not set", async () => {
    delete (process.env as Record<string, string>).DEEPSEEK_API_KEY;
    const client = mockClient();

    const result = await analyzePost("Some post.", "Author", client as unknown as ChatClient);
    expect(result).toBeNull();
    // Client should not have been called
    expect(client._mockCreate).not.toHaveBeenCalled();
  });
});

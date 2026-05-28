// src/lib/feishu.ts

const FEISHU_APP_ID = "cli_aa9da34d01381bd8";
const FEISHU_APP_SECRET = "roSnsazGMlqeirJ0WaGQ9fPfw8POgcvz";
const FEISHU_BASE = "https://open.feishu.cn/open-apis";

interface FeishuToken {
  access_token: string;
  expire: number; // absolute timestamp ms
}

let tokenCache: FeishuToken | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (tokenCache && Date.now() < tokenCache.expire - 300_000) {
    return tokenCache.access_token;
  }

  const res = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Feishu auth failed: ${res.status} ${res.statusText}`);
  }

  const data: unknown = await res.json();
  const json = data as { tenant_access_token: string; expire: number };
  tokenCache = {
    access_token: json.tenant_access_token,
    expire: Date.now() + json.expire * 1000,
  };
  return tokenCache.access_token;
}

export interface FeishuDocContent {
  title: string;
  markdown: string;
}

/** Fetch a Feishu document's content as markdown */
export async function fetchFeishuDoc(docId: string): Promise<FeishuDocContent> {
  const token = await getAccessToken();

  // Fetch raw content (markdown format)
  const res = await fetch(
    `${FEISHU_BASE}/docx/v1/documents/${docId}/raw_content`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Feishu doc fetch failed: ${res.status} ${res.statusText}`);
  }

  const json: unknown = await res.json();
  const d = json as { data?: { title?: string; content?: string } };
  return {
    title: d.data?.title ?? "",
    markdown: d.data?.content ?? "",
  };
}

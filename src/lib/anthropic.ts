import "server-only";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicMessageContent =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      source: {
        type: "base64";
        media_type: string;
        data: string;
      };
    };

function toBase64(arrayBuffer: ArrayBuffer) {
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function callAnthropicVisionJson(params: {
  prompt: string;
  images: File[];
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";
  const content: AnthropicMessageContent[] = [{ type: "text", text: params.prompt }];

  for (const image of params.images) {
    const arrayBuffer = await image.arrayBuffer();
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.type || "image/jpeg",
        data: toBase64(arrayBuffer),
      },
    });
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 3500,
      temperature: 0,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const textBlocks = (data.content ?? []).filter((entry: any) => entry.type === "text");
  const text = textBlocks.map((entry: any) => entry.text).join("\n").trim();

  if (!text) {
    throw new Error("Anthropic returned empty response text.");
  }

  return text;
}

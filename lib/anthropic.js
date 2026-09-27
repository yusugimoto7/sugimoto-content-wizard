import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

let client = null;
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  }
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

function extractText(content) {
  return (content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

export async function generateText(prompt, maxTokens = 3000) {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return extractText(response.content);
}

import OpenAI from "openai";

const MODEL = "gpt-4o";

let client = null;
function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

export async function generateText(prompt, maxTokens = 3000) {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return (response.choices[0]?.message?.content || "").trim();
}

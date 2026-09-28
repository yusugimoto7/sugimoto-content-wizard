import OpenAI from "openai";

export const runtime = "nodejs";

let client = null;
function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

function parseSuggestions(text) {
  let t = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    const v = JSON.parse(t);
    if (Array.isArray(v?.topics)) return v.topics;
    if (Array.isArray(v)) return v;
  } catch {
    // fall through
  }
  const m = t.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const v = JSON.parse(m[0]);
      if (Array.isArray(v?.topics)) return v.topics;
      if (Array.isArray(v)) return v;
    } catch {
      // give up
    }
  }
  return [];
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { countries = [], category = "", tone = "" } = body || {};
  const countriesStr = countries.join(", ") || "Canada, Europe";

  let openai;
  try {
    openai = getClient();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }],
      input: [
        {
          role: "system",
          content: `You are a content strategist for a Persian-language immigration brand (@sugimotovisa) specializing in Canada and Europe immigration. Find trending and newsworthy immigration topics this week. Return JSON ONLY with no extra text: { "topics": [{ "title": "string in Persian", "why_trending": "string in Persian, 1-2 sentences explaining why it matters now", "country": "string" }] }`,
        },
        {
          role: "user",
          content: `Search for trending ${category || "immigration"} topics for ${countriesStr} this week in 2026. Tone context: ${tone || "educational"}. Return 5-7 topics. Each topic title must be in Persian (Farsi). The why_trending must also be in Persian.`,
        },
      ],
    });

    const topics = parseSuggestions(response.output_text);
    return Response.json({ topics });
  } catch (err) {
    console.error("suggest-topics error:", err);
    return Response.json({ error: err.message || "Failed to fetch topic suggestions" }, { status: 500 });
  }
}

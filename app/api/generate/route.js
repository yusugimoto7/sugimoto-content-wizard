import { generateText } from "@/lib/anthropic";
import {
  carouselPrompt,
  infographicPrompt,
  reelPrompt,
  articlePrompt,
  telegramPrompt,
  parseCarousel,
  parseInfographic,
  parseReel,
  parseArticle,
  parseTelegramPost,
} from "@/lib/prompts";

export const runtime = "nodejs";

const FORMATS = {
  carousel: { build: carouselPrompt, parse: parseCarousel, maxTokens: 4000 },
  infographic: { build: infographicPrompt, parse: parseInfographic, maxTokens: 2500 },
  reel: { build: reelPrompt, parse: parseReel, maxTokens: 2000 },
  article: { build: articlePrompt, parse: parseArticle, maxTokens: 3000 },
  telegram: { build: telegramPrompt, parse: parseTelegramPost, maxTokens: 1200 },
};

// Merge the picked news items / custom-topic fields into a single `topic`
// object plus a `sourceText` string, the shared input shape every prompt
// function in lib/prompts.js expects.
function buildContext(source, tone) {
  const items = Array.isArray(source?.items) ? source.items : [];
  const countries = Array.isArray(source?.countries) ? source.countries : [];

  if (source?.type === "news" && items.length) {
    const title = items.map((it) => it.title).filter(Boolean).join(" / ");
    const sourceText = items
      .map((it) => `${it.title}\n${it.snippet || ""}`)
      .join("\n\n");
    return {
      topic: {
        title,
        field: source.contentType || "",
        audience: source.audience || "",
        country: countries.join(", "),
        tone,
      },
      sourceText,
    };
  }

  return {
    topic: {
      title: source?.subject || "",
      field: source?.contentType || "",
      audience: source?.audience || "",
      country: countries.join(", "),
      tone,
    },
    sourceText: source?.subject || "",
  };
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { source, tone, format } = body || {};
  const spec = FORMATS[format];
  if (!spec) {
    return Response.json(
      { error: `Unknown format "${format}". Expected one of: ${Object.keys(FORMATS).join(", ")}` },
      { status: 400 }
    );
  }
  if (!source || typeof source !== "object") {
    return Response.json({ error: "Missing source" }, { status: 400 });
  }

  const { topic, sourceText } = buildContext(source, tone);
  const prompt = spec.build(topic, sourceText);

  let raw;
  try {
    raw = await generateText(prompt, spec.maxTokens);
  } catch (err) {
    return Response.json({ error: err.message || "Generation failed" }, { status: 500 });
  }

  const output = spec.parse(raw);
  return Response.json({ format, topic, output });
}

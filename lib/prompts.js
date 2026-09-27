import { BRAND_CONTEXT } from "./brandContext.js";

function sourceBlock(sourceText) {
  const s = String(sourceText || "").trim();
  return s.length > 60 ? s : "(منبع کامل در دسترس نیست — فقط بر اساس عنوان و خلاصه کوتاه بنویس و چیزی از خودت اضافه نکن)";
}

function topicLine(topic) {
  const lines = [
    `موضوع: ${topic.title || topic.title_fa || topic.subject || ""}`,
    `حوزه: ${topic.field || topic.country || ""}`,
  ];
  if (topic.audience) lines.push(`مخاطب: ${topic.audience}`);
  if (topic.tone) lines.push(`لحن: ${topic.tone}`);
  return lines.join("\n");
}

// 10-12 slide Instagram carousel. Returns instructions for a structured
// {slides: [{num, content}], caption} response the caller parses out of the
// delimiter-marked output below.
export function carouselPrompt(topic, sourceText) {
  return `${BRAND_CONTEXT}

تو استراتژیست محتوای اینستاگرام برند «سوگیموتو ویزا» هستی. یک کاروسل ۱۰ تا ۱۲ اسلایدی فارسی بساز، کاملاً بر اساس «متن منبع» زیر — هیچ فکت، عدد یا ادعایی که در منبع نیست اضافه نکن.

${topicLine(topic)}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

ساختار اجباری:
- اسلاید ۱ (هوک): یک جمله قلاب قوی + ایموجی پرچم کشورهای مرتبط + در انتها «📌 ذخیره کن»
- اسلایدهای ۲ تا ۸: هرکدام یک تیتر کوتاه + چند بولت، با ایموجی‌های مناسب از این ست: ✅ ❌ ⚠️ 💶 🏦 🗓 ⏳ 🎓
- اسلاید ۹: یک جدول مقایسه‌ای (بین دو یا چند گزینه/مسیر مرتبط با موضوع)
- اسلاید ۱۰: نقشه راه گام‌به‌گام (Roadmap)
- آخرین اسلاید: فقط و فقط CTA، دقیقاً همین متن: «برای ارتباط با مشاورین سوگیموتو ویزا، کلمه [مشاوره] رو کامنت کنید» — هیچ محتوای دیگری در این اسلاید نباشد.
- بعد از همه اسلایدها: یک کپشن اینستاگرام (۳ تا ۵ پاراگراف کوتاه با هشتگ‌های مرتبط در انتها)

خروجی را دقیقاً با این دلیمیترها بده، هیچ متن اضافه‌ای قبل یا بعد از آن‌ها ننویس:
===SLIDE 1===
(محتوای اسلاید ۱)
===SLIDE 2===
(محتوای اسلاید ۲)
... همین‌طور تا آخرین اسلاید (شماره‌گذاری پیوسته، حداکثر ۱۲ اسلاید)
===CAPTION===
(متن کپشن اینستاگرام)`;
}

// Infographic: title, key stats, comparison table, roadmap, source citation.
export function infographicPrompt(topic, sourceText) {
  return `${BRAND_CONTEXT}

تو طراح محتوای اینفوگرافیک برند «سوگیموتو ویزا» هستی. بر اساس «متن منبع» زیر، محتوای یک اینفوگرافیک فارسی بساز. فقط از فکت‌های داخل منبع استفاده کن؛ همیشه منبع را ذکر کن.

${topicLine(topic)}
منبع: ${topic.source_url || topic.source || "-"}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

خروجی را دقیقاً با این دلیمیترها بده:
===TITLE===
(عنوان کوتاه اینفوگرافیک)
===STATS===
(۵ تا ۷ آمار/عدد کلیدی، هرکدام در یک خط، با فرمت «عدد — توضیح کوتاه»)
===COMPARISON===
(یک جدول مقایسه‌ای متنی بین ۲ یا ۳ گزینه مرتبط با موضوع)
===ROADMAP===
(نقشه راه گام‌به‌گام، هر گام در یک خط شماره‌گذاری‌شده)
===SOURCE===
(ارجاع کوتاه به منبع خبر/اطلاعات)`;
}

// Reel script: 3s hook, 45-60s body, on-screen text markers, 5s CTA.
// Farsi narration with English on-screen text markers.
export function reelPrompt(topic, sourceText) {
  return `${BRAND_CONTEXT}

تو سناریونویس ریلز اینستاگرام برای برند «سوگیموتو ویزا» هستی. روایت به فارسی، ولی متن‌های روی صفحه (on-screen text) به انگلیسی باشند. فقط بر اساس «متن منبع» زیر بنویس، چیزی از خودت اضافه نکن.

${topicLine(topic)}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

ساختار اجباری:
- هوک (۳ ثانیه اول): یک جمله بسیار جذاب و توجه‌برانگیز
- بدنه (۴۵ تا ۶۰ ثانیه): توضیح اصلی خبر/موضوع، مستقیم و صمیمی
- CTA (۵ ثانیه پایانی): دعوت نرم به مشاوره
- در سراسر متن، هر جا لازم است متن روی صفحه بگذار با فرمت [روی صفحه: TEXT] — این متن‌ها باید به انگلیسی باشند.

خروجی را دقیقاً با این دلیمیترها بده:
===HOOK===
(متن هوک ۳ ثانیه‌ای)
===BODY===
(متن بدنه، شامل مارکرهای [روی صفحه: ...] در جای مناسب)
===CTA===
(متن CTA پایانی)
===ONSCREEN===
(فهرست همه متن‌های روی صفحه که در بدنه استفاده شد، هرکدام در یک خط، به انگلیسی)`;
}

// Website blog article (Farsi). Not in the original prompt set, but the
// "article" format is part of the generate/UI contract, so it follows the
// same brand-context + delimiter pattern as the other formats here.
export function articlePrompt(topic, sourceText) {
  return `${BRAND_CONTEXT}

تو نویسنده مقالات وبلاگ برند «سوگیموتو ویزا» هستی. یک مقاله فارسی اصیل (نه ترجمه) بر اساس «متن منبع» زیر بنویس. فقط از فکت‌های داخل منبع استفاده کن.

${topicLine(topic)}
منبع: ${topic.source_url || topic.source || "-"}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

مقاله باید ۴۰۰ تا ۷۰۰ کلمه باشد، با زیرتیترها (H2) ساختاردهی شده باشد و در پایان یک جمع‌بندی کوتاه داشته باشد.

خروجی را دقیقاً با این دلیمیترها بده:
===TITLE===
(عنوان مقاله)
===CONTENT===
(متن کامل مقاله با زیرتیترها)`;
}

// Clean Telegram post: short intro, key points, one golden tip, <=300 words.
export function telegramPrompt(topic, sourceText) {
  return `${BRAND_CONTEXT}

تو ویراستار کانال تلگرام «سوگیموتو ویزا» هستی. یک پست خبری/اطلاع‌رسانی کوتاه فارسی بساز، حداکثر ۳۰۰ کلمه، فقط بر اساس «متن منبع» زیر.

${topicLine(topic)}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

ساختار اجباری:
- مقدمه کوتاه (۲ جمله)
- ۵ تا ۷ نکته کلیدی، هرکدام با یک ایموجی مناسب در ابتدا
- یک نکته طلایی در انتها، شروع‌شونده با ⚠️

خروجی را دقیقاً با این دلیمیتر بده، بدون هیچ متن اضافه قبل یا بعدش:
===TEXT===
(متن کامل پست، حداکثر ۳۰۰ کلمه)`;
}

// Parse `===NAME===` delimited output into a { name: value } object. Mirrors
// the delimiter contract each prompt above asks the model to follow.
export function parseDelimited(text, order) {
  const t = String(text || "");
  const out = {};
  for (const name of order) {
    const marker = "===" + name + "===";
    const start = t.indexOf(marker);
    if (start === -1) {
      out[name] = "";
      continue;
    }
    const from = start + marker.length;
    let end = t.length;
    for (const other of order) {
      if (other === name) continue;
      const i = t.indexOf("===" + other + "===", from);
      if (i !== -1 && i < end) end = i;
    }
    out[name] = t.slice(from, end).trim();
  }
  return out;
}

// carouselPrompt() output -> {slides: [{num, content}], caption}
export function parseCarousel(text) {
  const t = String(text || "");
  const slides = [];
  const re = /===SLIDE (\d+)===/g;
  const marks = [];
  let m;
  while ((m = re.exec(t)) !== null) {
    marks.push({ num: Number(m[1]), start: m.index, contentStart: m.index + m[0].length });
  }
  const captionMarkerIdx = t.indexOf("===CAPTION===");
  for (let i = 0; i < marks.length; i++) {
    const end = i + 1 < marks.length ? marks[i + 1].start : captionMarkerIdx !== -1 ? captionMarkerIdx : t.length;
    slides.push({ num: marks[i].num, content: t.slice(marks[i].contentStart, end).trim() });
  }
  const caption = captionMarkerIdx !== -1 ? t.slice(captionMarkerIdx + "===CAPTION===".length).trim() : "";
  return { slides, caption };
}

// infographicPrompt() output -> {title, stats, comparison, roadmap, source}
export function parseInfographic(text) {
  const d = parseDelimited(text, ["TITLE", "STATS", "COMPARISON", "ROADMAP", "SOURCE"]);
  return {
    title: d.TITLE,
    stats: d.STATS.split("\n").map((s) => s.trim()).filter(Boolean),
    comparison: d.COMPARISON,
    roadmap: d.ROADMAP,
    source: d.SOURCE,
  };
}

// reelPrompt() output -> {hook, body, cta, onscreen}
export function parseReel(text) {
  const d = parseDelimited(text, ["HOOK", "BODY", "CTA", "ONSCREEN"]);
  return {
    hook: d.HOOK,
    body: d.BODY,
    cta: d.CTA,
    onscreen: d.ONSCREEN.split("\n").map((s) => s.trim()).filter(Boolean),
  };
}

// telegramPrompt() output -> {text}
export function parseTelegramPost(text) {
  const d = parseDelimited(text, ["TEXT"]);
  return { text: d.TEXT };
}

// articlePrompt() output -> {title, content}
export function parseArticle(text) {
  const d = parseDelimited(text, ["TITLE", "CONTENT"]);
  return { title: d.TITLE, content: d.CONTENT };
}

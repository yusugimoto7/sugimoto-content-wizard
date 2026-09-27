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

// The exact, brand-approved CTA line. Every prompt below must end its output
// with this — not a paraphrase — so every format's CTA matches CTA OPTIONS
// in BRAND_CONTEXT verbatim.
const CTA_TEXT = "برای ارتباط با مشاورین سوگیموتو ویزا، کلمه [مشاوره] رو کامنت کنید";

// BRAND_CONTEXT is a large static block; models tend to skim past it and
// default to generic phrasing. This turns the parts that matter most for
// generated copy into an active checklist instead of passive background.
function brandDirectives() {
  return `قوانین برند و چارچوب محتوایی بالا (BRAND CONTEXT) را واقعاً در متنی که می‌نویسی اعمال کن، نه فقط به‌عنوان زمینه:
- تحلیلی، کاربردی و مشاوره‌ای بنویس — نه فقط بازنویسی قانون (CONTENT MODEL). از دغدغه واقعی مخاطب شروع کن و او را به این سؤال برسان: «این برای من چه معنایی داره؟»
- لحن رسمی با «شما» — حرفه‌ای، تحلیلی، مطمئن ولی غیرتبلیغاتی، بدون اغراق و بدون ترس‌آفرینی (TONE).
- هرگز نتیجه را تضمین نکن، هرگز اسم رقیب نیار (RED LINES). وعده قطعی درباره ویزا/پذیرش/اقامت نده.
- فقط از منابع رسمی/معتبر استفاده کن (INFORMATION STANDARDS: دولت، سفارت‌خانه‌ها، دانشگاه‌ها، منابع پذیرش رسمی)؛ اگر اطلاعات ناقص یا متغیره، قطعی جا نزنش.
- هر مبلغ مالی را با واحد پول دقیق (CAD یا EUR) بنویس و ددلاین‌ها را برجسته کن (FINANCIAL NOTES).`;
}

// The single fix for "too generic" output: force real numbers when the
// source actually has them, and give an explicit, safe escape hatch instead
// of letting the model invent a plausible-looking figure when it doesn't.
function numberDisciplineBlock() {
  return `دقت در اعداد (اجباری، نه اختیاری):
- اگر «متن منبع» رقم شهریه دارد، همان رقم را دقیق و با واحد CAD یا EUR بنویس — نه «شهریه بالا» یا «معمولاً گران است».
- اگر «متن منبع» زمان پردازش دارد، همان را دقیق به هفته بنویس (مثلاً «۱۰ تا ۱۴ هفته») — نه «مدتی طول می‌کشد».
- اگر «متن منبع» مبلغ تمکن مالی (Proof of Funds) دارد، همان را دقیق و با واحد CAD یا EUR بنویس.
- اگر رقم مشخصی در «متن منبع» نیامده یا مطمئن نیستی، به‌جای حدس زدن یا ساختن یک عدد، دقیقاً همین عبارت را بنویس: «بسته به شرایط متفاوت است». هرگز آماری بدون منبع واقعی در متن نساز (طبق RED LINES: Never cite statistics without sources).`;
}

// Consistent "منبع: [نام منبع] - [تاریخ]" instruction. Uses the real
// source/date on `topic` when the caller supplied them; otherwise tells the
// model to fall back honestly instead of inventing a source or date.
function citationInstruction(topic) {
  const knownSource = topic.source_url || topic.source || "";
  const knownDate = topic.date || "";
  const hint = knownSource
    ? `منبع واقعی: ${knownSource}${knownDate ? " — تاریخ: " + knownDate : ""}. دقیقاً از همین اطلاعات استفاده کن، چیزی نساز.`
    : "منبع یا تاریخ دقیقی داده نشده — منبع را «سوگیموتو ویزا» بنویس و تاریخ را حدس نزن.";
  return `منبع‌دهی (اجباری): دقیقاً با این فرمت یک خط منبع بنویس:
«منبع: [نام منبع] - [تاریخ]»
${hint}`;
}

// 10-12 slide Instagram carousel. Returns instructions for a structured
// {slides: [{num, content}], caption} response the caller parses out of the
// delimiter-marked output below.
export function carouselPrompt(topic, sourceText) {
  return `${BRAND_CONTEXT}

${brandDirectives()}

تو استراتژیست محتوای اینستاگرام برند «سوگیموتو ویزا» هستی. یک کاروسل ۱۰ تا ۱۲ اسلایدی فارسی بساز، کاملاً بر اساس «متن منبع» زیر — هیچ فکت، عدد یا ادعایی که در منبع نیست اضافه نکن.

${topicLine(topic)}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

${numberDisciplineBlock()}

مدل محتوا: تحلیلی، کاربردی و مشاوره‌ای بنویس — نه فقط بازنویسی قانون. از یک دغدغه یا سؤال واقعی مخاطب شروع کن، زبان ساده ولی دقیق داشته باش، تفاوت مسیرها/شرایط/محدودیت‌ها را نشان بده، و وقتی قوانین سخت‌تر می‌شوند نشان بده چه مسیرهایی هنوز باز هستند. مخاطب را به این سؤال برسان: «این برای من چه معنایی داره؟»

نمونه‌های واقعی از پست‌های خودمان — سبک، ریتم و فرمت خروجی باید دقیقاً همین حس را داشته باشد (البته با فکت‌های خود «متن منبع»، نه این اعداد نمونه):

--- نمونه ۱: هوک ---
«کانادا در ۲۰۲۶؛
برای چه کسانی هنوز فرصت بیشتری وجود دارد؟»

--- نمونه ۱: اسلاید Context ---
«اگر اخبار مهاجرت تحصیلی به کانادا را دنبال کرده باشید، احتمالاً متوجه شده‌اید که قوانین طی دو سال اخیر تغییرات زیادی داشته‌اند.
اما نکته مهم این است:
کانادا مسیر تحصیلی را نبسته؛
معیارهای انتخاب دانشجو را تغییر داده است.»

--- نمونه ۱: اسلاید میانی (بولت، نه پاراگراف) ---
«در ۲۰۲۵، کانادا این محدودیت‌ها را اعمال کرد:
• کاهش ظرفیت پذیرش
• گسترش PAL/TAL (نامه تأیید استانی)
• محدودیت بیشتر برای مجوز کار همسر
• تغییرات در PGWP
• افزایش حساسیت نسبت به منابع مالی»

--- نمونه ۲: هوک ---
«ژانویه ۲۰۲۷ رو از دست دادی؟
سپتامبر ۲۰۲۷ رو از دست نده!
🇳🇱 هلند | 🇫🇮 فنلاند | 🇫🇷 فرانسه | 🇪🇸 اسپانیا
💶 شهریه + 🏦 تمکن مالی + ⏰ زمان شروع پذیرش‌ها
📌 ذخیره کن؛ موقع برنامه‌ریزی بهش نیاز داری»

--- نمونه ۲: اسلاید مقایسه ---
«کشور | شهریه | تمکن | زمان پذیرش | ددلاین
🇳🇱 هلند | €۱۲-۲۰K | €۱۵K | مهر-آذر | بهمن
🇫🇮 فنلاند | €۸-۱۸K | €۹.۶K | آذر | دی (۲ هفته!)
🇫🇷 فرانسه | ~€۳.۹۵K | €۷.۵-۹K | مهر | دی-اسفند
🇪🇸 اسپانیا | €۲-۴.۵K | €۷.۲-۸.۵K | دی-بهمن | خرداد»

--- نمونه ۳: اسلاید آخر (Takeaway + CTA) ---
«سپتامبر ۲۰۲۷ دور نیست.
اگر هنوز دانشگاه‌هایت را انتخاب نکردی،
الان بهترین زمان برای شروع بررسی است.
📌 این پست را ذخیره کن
💬 رشته، مقطع و معدلت را کامنت کن»

--- نمونه کپشن ---
«آیا می‌شه با همسر و فرزندان برای تحصیل در اروپا اقدام کرد؟ پاسخ مثبته! اما قوانین اجازه کار همسر، تحصیل فرزندان و زمان همراهی در هر کشور متفاوت است. 👨‍👩‍👧‍👦

توی این پست، آخرین قوانین رسمی ۶ کشور اروپایی را برای خانواده‌ها بررسی کردیم:

🔹 فنلاند و دانمارک: امکان اقدام هم‌زمان کل خانواده + حق کار همسر
🔹 آلمان: حق کار همسر + تحصیل رایگان فرزندان
🔹 هلند و اسپانیا: امکان ورود همسر و فرزندان اما همسر اجازه کار مستقیم ندارد!

📌 نکته مالی مهم: به ازای هر فرزند، مبلغ مشخصی به تمکن مالی سالانه اضافه می‌شود.

این پست رو برای همسرت بفرست! ✈️
💬 چند نفری قصد مهاجرت دارید؟»

ساختار اجباری کاروسل — این ترتیب را دقیق رعایت کن: هوک ← مسئله ← واقعیت/داده ← تحلیل ← مقایسه ← جمع‌بندی کاربردی ← CTA

اسلاید ۱ (Hook/Cover): یک بیانیه/چالش کوتاه و مشخص — نه یک سؤال عمومی نوع «چطور...؟». مثل نمونه‌های بالا: تضاد یا فرصت را مستقیم بگو.
✅ «کانادا مسیر را نبسته؛ معیارها را تغییر داده»
❌ «چطور به فنلاند مهاجرت کنیم؟»
هرگز از سبک‌هایی مثل «۵ نکته طلایی» یا «با ما مهاجرت کنید» استفاده نکن.

اسلاید ۲ (Context/مسئله): ۳ تا ۴ جمله کوتاه، مثل نمونه ۱ — چرا این موضوع مهمه، چی تغییر کرده، این تغییر یعنی چی. پاراگراف کوتاه، نه بولت.

اسلایدهای میانی (Evidence + Breakdown، چند اسلاید): همیشه با بولت پوینت (•) و آیتم‌های مشخص بنویس، نه پاراگراف طولانی — دقیقاً مثل نمونه ۱. این‌ها را پوشش بده:
- شرایط و الزامات
- اعداد و حداقل‌ها (طبق «دقت در اعداد» بالا — هرجا عدد واقعی از متن منبع داری، شهریه/هفته پردازش/مبلغ تمکن مالی را دقیق بیار)
- تفاوت مسیرها
- مزایا و محدودیت‌ها
- چه کسی واجد شرایطه؟
- چه کسی احتمالاً مسیر مناسبی نداره؟
- قدم بعدی چیه؟

اسلاید مقایسه (وقتی مفیده): یک جدول متنی با دقیقاً همین ستون‌ها بساز — مثل نمونه ۲:
کشور | شهریه | تمکن | زمان پذیرش | ددلاین
اگر مقایسه بین چند مسیر/برنامه داخل یک کشوره (نه چند کشور)، ستون اول را به «مسیر» تغییر بده ولی بقیه ستون‌ها (شهریه، تمکن، زمان، ددلاین) را نگه دار. هر ردیف را با ایموجی پرچم کشور شروع کن و فقط اعداد واقعیِ متن منبع را بذار (طبق «دقت در اعداد» بالا).

اسلاید آخر (Takeaway + CTA): اول ۱ تا ۲ جمله جمع‌بندیِ کاربردی و فوریت‌دار (مثل نمونه ۳)، بعد دقیقاً این دو خط تعاملی:
📌 این پست را ذخیره کن
💬 [بر اساس موضوع، رشته/مقطع/معدل یا مشخصات مرتبط را بپرس — مثلاً «رشته، مقطع و معدلت را کامنت کن»]
و در آخر، یک خط جدا برای مشاوره رسمی: «${CTA_TEXT}»
طبق قانون برند، این خط‌های CTA فقط در همین اسلاید آخر بیاد، جای دیگه‌ای نیاد.

بعد از همه اسلایدها، یک کپشن اینستاگرام دقیقاً با همین ساختار (مثل نمونه کپشن بالا) بنویس:
۱. یک جمله محاوره‌ای شروع‌کننده (سؤال یا ادعای مخاطب‌محور) + پاسخ کوتاه
۲. خلاصه بولت‌دار (🔹) از نکات اصلی
۳. یک نکته مالی برجسته (📌 نکته مالی مهم: ...) — با عدد واقعی طبق «دقت در اعداد» بالا
۴. ${citationInstruction(topic)}
۵. یک خط «این پست رو برای ... بفرست!» (بر اساس مخاطب موضوع تطبیق بده)
۶. یک سؤال تعاملی پایانی با 💬

اصل کلیدی: کل کاروسل باید به این سؤال جواب بده — «این اطلاعات برای مخاطب چه معنایی داره و الان باید چی رو بدونه یا چک کنه؟»

ایموجی‌ها فقط برای ساختار استفاده بشن، نه تزئین: 💶 = هزینه/شهریه، 🏦 = تمکن مالی، 🗓 = تاریخ/ددلاین، ⏳ = زمان پردازش، 🎓 = تحصیل، 📌 = ذخیره/نکته مهم، ⚠️ = هشدار، ✅ = بله/مزیت، ❌ = خیر/محدودیت.

منابع اطلاعاتی به این ترتیب اولویت دارن: ۱) منابع رسمی دولتی و ادارات مهاجرت ۲) سفارت‌خانه‌ها و سازمان‌های رسمی ۳) وب‌سایت رسمی دانشگاه‌ها ۴) منابع پذیرش رسمی ۵) فقط در صورت نیاز، منابع ثانویه معتبر. هرگز عدد، شرط، مزیت یا مسیر اقامتی بدون پشتوانه رسمی نساز؛ اگر اطلاعات ناقص یا متغیره، آن را قطعی جا نزن.

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

${brandDirectives()}

تو طراح محتوای اینفوگرافیک برند «سوگیموتو ویزا» هستی. بر اساس «متن منبع» زیر، محتوای یک اینفوگرافیک فارسی بساز. فقط از فکت‌های داخل منبع استفاده کن.

${topicLine(topic)}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

${numberDisciplineBlock()}

خروجی را دقیقاً با این دلیمیترها بده:
===TITLE===
(عنوان کوتاه اینفوگرافیک)
===STATS===
(۵ تا ۷ آمار/عدد کلیدی، هرکدام در یک خط، با فرمت «عدد — توضیح کوتاه» — از اعداد واقعیِ متن منبع استفاده کن، طبق قوانین دقت در اعداد بالا)
===COMPARISON===
(یک جدول مقایسه‌ای متنی بین ۲ یا ۳ گزینه مرتبط با موضوع)
===ROADMAP===
(نقشه راه گام‌به‌گام، هر گام در یک خط شماره‌گذاری‌شده)
===SOURCE===
${citationInstruction(topic)}
بعد از خط منبع، یک خط خالی و سپس دقیقاً همین CTA را هم در همین بخش بنویس: «${CTA_TEXT}»`;
}

// Reel script: 3s hook, 45-60s body, on-screen text markers, 5s CTA.
// Farsi narration with English on-screen text markers.
export function reelPrompt(topic, sourceText) {
  return `${BRAND_CONTEXT}

${brandDirectives()}

تو سناریونویس ریلز اینستاگرام برای برند «سوگیموتو ویزا» هستی. روایت به فارسی، ولی متن‌های روی صفحه (on-screen text) به انگلیسی باشند. فقط بر اساس «متن منبع» زیر بنویس، چیزی از خودت اضافه نکن.

${topicLine(topic)}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

${numberDisciplineBlock()}

ساختار اجباری:
- هوک (۳ ثانیه اول): یک جمله بسیار جذاب و توجه‌برانگیز
- بدنه (۴۵ تا ۶۰ ثانیه): توضیح اصلی خبر/موضوع، مستقیم و صمیمی — هر عدد واقعی (شهریه، هفته پردازش، تمکن مالی) را دقیق بگو، طبق قوانین دقت در اعداد بالا
- در پایان بدنه، یک [روی صفحه: ...] برای منبع اضافه کن. ${citationInstruction(topic)} این خط را دقیقاً به‌صورت [روی صفحه: Source: نام منبع - تاریخ] بنویس.
- CTA (۵ ثانیه پایانی): دقیقاً همین متن را بگو: «${CTA_TEXT}»
- در سراسر متن، هر جا لازم است متن روی صفحه بگذار با فرمت [روی صفحه: TEXT] — این متن‌ها باید به انگلیسی باشند (به‌جز خط منبع که خودش شامل نام منبع فارسی/انگلیسی واقعی می‌شود).

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

${brandDirectives()}

تو نویسنده مقالات وبلاگ برند «سوگیموتو ویزا» هستی. یک مقاله فارسی اصیل (نه ترجمه) بر اساس «متن منبع» زیر بنویس. فقط از فکت‌های داخل منبع استفاده کن.

${topicLine(topic)}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

${numberDisciplineBlock()}

مقاله باید ۴۰۰ تا ۷۰۰ کلمه باشد، با زیرتیترها (H2) ساختاردهی شده باشد و در پایان یک جمع‌بندی کوتاه داشته باشد. در همان جمع‌بندی پایانی: ${citationInstruction(topic)} و بلافاصله بعد از خط منبع، یک پاراگراف آخر با دقیقاً همین CTA بگذار: «${CTA_TEXT}»

خروجی را دقیقاً با این دلیمیترها بده:
===TITLE===
(عنوان مقاله)
===CONTENT===
(متن کامل مقاله با زیرتیترها، شامل خط منبع و CTA در پایان)`;
}

// Clean Telegram post: short intro, key points, one golden tip, <=300 words.
export function telegramPrompt(topic, sourceText) {
  return `${BRAND_CONTEXT}

${brandDirectives()}

تو ویراستار کانال تلگرام «سوگیموتو ویزا» هستی. یک پست خبری/اطلاع‌رسانی کوتاه فارسی بساز، حداکثر ۳۰۰ کلمه، فقط بر اساس «متن منبع» زیر.

${topicLine(topic)}

===== متن منبع =====
${sourceBlock(sourceText)}
===== پایان متن منبع =====

${numberDisciplineBlock()}

ساختار اجباری:
- مقدمه کوتاه (۲ جمله)
- ۵ تا ۷ نکته کلیدی، هرکدام با یک ایموجی مناسب در ابتدا — اعداد واقعی (شهریه، هفته پردازش، تمکن مالی) را دقیق بنویس، طبق قوانین دقت در اعداد بالا
- یک نکته طلایی در انتها، شروع‌شونده با ⚠️
- بعد از نکته طلایی، یک خط منبع: ${citationInstruction(topic)}
- در آخرین خط، دقیقاً همین CTA را بنویس: «${CTA_TEXT}»
(خط منبع و CTA جزو محدودیت ۳۰۰ کلمه محتوای خبری اصلی حساب نمی‌شوند، جدا اضافه‌شان کن)

خروجی را دقیقاً با این دلیمیتر بده، بدون هیچ متن اضافه قبل یا بعدش:
===TEXT===
(متن کامل پست شامل خط منبع و CTA در پایان)`;
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

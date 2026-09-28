"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const COUNTRIES = [
  { code: "CA", label: "🇨🇦 کانادا" },
  { code: "NL", label: "🇳🇱 هلند" },
  { code: "DE", label: "🇩🇪 آلمان" },
  { code: "FI", label: "🇫🇮 فنلاند" },
  { code: "FR", label: "🇫🇷 فرانسه" },
  { code: "ES", label: "🇪🇸 اسپانیا" },
];

const CONTENT_TYPES = ["آموزشی", "خبری", "مقایسه‌ای", "راهنمای گام‌به‌گام", "تحلیلی"];
const AUDIENCES = ["دانشجو", "خانواده", "کارآفرین", "متخصص", "عمومی"];
const TONES = ["آموزشی و رسمی", "صمیمی و ساده", "فوری و خبری", "تحلیلی و عمیق", "انگیزشی"];
const FORMATS = [
  { value: "carousel", icon: "🎠", label: "کاروسل اینستاگرام" },
  { value: "infographic", icon: "📊", label: "اینفوگرافیک" },
  { value: "reel", icon: "🎬", label: "اسکریپت ریلز" },
  { value: "article", icon: "📝", label: "مقاله وبسایت" },
  { value: "telegram", icon: "✈️", label: "پست تلگرام" },
];

const SLIDE_COUNTS = [5, 7, 10, 12];

const ARCHIVE_KEY = "sugimoto_wizard_archive";

// localStorage can throw (private mode, quota, disabled) - archive is a
// convenience, never let it crash the wizard.
function loadArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveArchive(list) {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
  } catch {
    // ignore - nothing we can do if storage is unavailable
  }
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso || "";
  }
}

// Shared with the archive detail view - {format, output} -> one copy-able
// plain-text block, same shape buildFullText() used to build inline.
function fullTextFor(format, output) {
  if (!output) return "";
  if (format === "carousel") {
    return (
      output.slides.map((s) => `اسلاید ${s.num}:\n${s.content}`).join("\n\n") +
      "\n\n--- کپشن ---\n" +
      output.caption
    );
  }
  if (format === "infographic") {
    return `${output.title}\n\nآمار کلیدی:\n${output.stats.join("\n")}\n\nمقایسه:\n${output.comparison}\n\nنقشه راه:\n${output.roadmap}\n\nمنبع: ${output.source}`;
  }
  if (format === "reel") {
    return `هوک:\n${output.hook}\n\nبدنه:\n${output.body}\n\nCTA:\n${output.cta}\n\nمتن‌های روی صفحه:\n${output.onscreen.join("\n")}`;
  }
  if (format === "article") {
    return `${output.title}\n\n${output.content}`;
  }
  if (format === "telegram") {
    return output.text;
  }
  return "";
}

function initialState() {
  return {
    pathType: null,
    countries: [],
    contentType: "",
    audience: "",
    subject: "",
    tone: "",
    format: "",
    language: "persian",
    slideCount: 7,
    selectedNewsIds: new Set(),
  };
}

export default function Home() {
  const [view, setView] = useState("home");
  const [wizard, setWizard] = useState(initialState);

  const [newsData, setNewsData] = useState({ canada: [], europe: [] });
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");

  const [genError, setGenError] = useState("");
  const [result, setResult] = useState(null);
  const [reelTab, setReelTab] = useState("hook");
  const [copiedKey, setCopiedKey] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [saveConfirm, setSaveConfirm] = useState(false);

  const [archive, setArchive] = useState([]);
  const [archiveItem, setArchiveItem] = useState(null);

  useEffect(() => {
    if (copiedKey) {
      const t = setTimeout(() => setCopiedKey(""), 1500);
      return () => clearTimeout(t);
    }
  }, [copiedKey]);

  useEffect(() => {
    setArchive(loadArchive());
  }, []);

  function resetAll() {
    setWizard(initialState());
    setResult(null);
    setGenError("");
    setEditMode(false);
    setFeedbackText("");
    setSaveConfirm(false);
    setView("home");
  }

  async function loadNews() {
    if (newsData.canada.length || newsData.europe.length || newsLoading) return;
    setNewsLoading(true);
    setNewsError("");
    try {
      const res = await fetch("/api/news-today");
      if (!res.ok) throw new Error("خطا در دریافت اخبار");
      const data = await res.json();
      setNewsData({ canada: data.canada || [], europe: data.europe || [] });
    } catch (err) {
      setNewsError(err.message || "خطا در دریافت اخبار");
    } finally {
      setNewsLoading(false);
    }
  }

  function goPathA() {
    setWizard((w) => ({ ...w, pathType: "news" }));
    setView("path-a");
    loadNews();
  }

  function goPathB() {
    setWizard((w) => ({ ...w, pathType: "custom" }));
    setView("path-b");
  }

  function toggleNews(id) {
    setWizard((w) => {
      const next = new Set(w.selectedNewsIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...w, selectedNewsIds: next };
    });
  }

  function toggleCountry(code) {
    setWizard((w) => {
      const has = w.countries.includes(code);
      return {
        ...w,
        countries: has ? w.countries.filter((c) => c !== code) : [...w.countries, code],
      };
    });
  }

  const allNews = [...newsData.canada, ...newsData.europe];
  const selectedNewsCount = wizard.selectedNewsIds.size;
  const pathBReady =
    wizard.countries.length > 0 &&
    wizard.contentType &&
    wizard.audience &&
    wizard.subject.trim().length > 0;

  // Shared by the first generation and every regenerate-with-feedback call -
  // both must send the exact same `source` for a given wizard selection.
  function buildSourcePayload() {
    if (wizard.pathType === "news") {
      const items = allNews
        .filter((n) => wizard.selectedNewsIds.has(n.id))
        .map((n) => ({ title: n.title, snippet: n.snippet }));
      const countries = [
        ...new Set(
          allNews
            .filter((n) => wizard.selectedNewsIds.has(n.id))
            .map((n) => (n.country === "canada" ? "CA" : "EU"))
        ),
      ];
      return { type: "news", items, countries, contentType: "", audience: "" };
    }
    return {
      type: "custom",
      items: [],
      countries: wizard.countries,
      contentType: wizard.contentType,
      audience: wizard.audience,
      subject: wizard.subject,
    };
  }

  async function handleGenerate() {
    setGenError("");
    setView("generating");

    const source = buildSourcePayload();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          tone: wizard.tone,
          format: wizard.format,
          language: wizard.language,
          slideCount: wizard.slideCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تولید محتوا با خطا مواجه شد");
      setResult(data);
      setReelTab("hook");
      setView("output");
    } catch (err) {
      setGenError(err.message || "تولید محتوا با خطا مواجه شد");
      setView("tone-format");
    }
  }

  function copy(key, text) {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => setCopiedKey(key));
  }

  function addToArchive(entry) {
    setArchive((prev) => {
      const next = [entry, ...prev];
      saveArchive(next);
      return next;
    });
  }

  function deleteFromArchive(id) {
    setArchive((prev) => {
      const next = prev.filter((it) => it.id !== id);
      saveArchive(next);
      return next;
    });
    setArchiveItem((cur) => (cur && cur.id === id ? null : cur));
  }

  function handleApprove() {
    if (!result) return;
    addToArchive({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      topicTitle: result.topic?.title || "",
      format: result.format,
      output: result.output,
      raw: result.raw || "",
    });
    setSaveConfirm(true);
    setTimeout(() => {
      setSaveConfirm(false);
      resetAll();
    }, 700);
  }

  // Re-sends the same generation request plus the previous raw output and
  // the user's feedback; app/api/generate/route.js folds those into the
  // prompt and asks the model to revise. Loops: the result replaces
  // `result` and the same approve/edit buttons show again.
  async function handleRegenerate() {
    if (!feedbackText.trim() || !result) return;
    setGenError("");
    setView("generating");

    const source = buildSourcePayload();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          tone: wizard.tone,
          format: wizard.format,
          language: wizard.language,
          slideCount: wizard.slideCount,
          feedback: feedbackText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "بازتولید محتوا با خطا مواجه شد");
      setResult(data);
      setReelTab("hook");
      setEditMode(false);
      setFeedbackText("");
      setView("output");
    } catch (err) {
      setGenError(err.message || "بازتولید محتوا با خطا مواجه شد");
      setEditMode(false);
      setView("output");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>دستیار تولید محتوا</div>
        <div className={styles.headerSubtitle}>سوگیموتو ویزا</div>
      </header>

      {view === "home" && (
        <div className={styles.homeGrid}>
          <button className={styles.card} onClick={goPathA}>
            <span className={styles.cardIcon}>📰</span>
            <span className={styles.cardTitle}>اخبار امروز</span>
            <span className={styles.cardDesc}>از میان اخبار تازه مهاجرتی موضوع انتخاب کن</span>
          </button>
          <button className={styles.card} onClick={goPathB}>
            <span className={styles.cardIcon}>✏️</span>
            <span className={styles.cardTitle}>موضوع دلخواه</span>
            <span className={styles.cardDesc}>موضوع خودت را تعریف کن</span>
          </button>
          <button className={styles.card} onClick={() => setView("archive")}>
            <span className={styles.cardIcon}>📁</span>
            <span className={styles.cardTitle}>آرشیو محتوا</span>
            <span className={styles.cardDesc}>محتوای ذخیره‌شده را ببین، کپی یا حذف کن</span>
          </button>
        </div>
      )}

      {view === "path-a" && (
        <div className={styles.section}>
          <div className={styles.topBar}>
            <button className={styles.backBtn} onClick={resetAll}>
              → بازگشت
            </button>
          </div>

          {newsLoading && <p className={styles.muted}>در حال دریافت اخبار...</p>}
          {newsError && <p className={styles.errorBox}>{newsError}</p>}

          {!newsLoading && !newsError && (
            <>
              <NewsGroup
                title="🇨🇦 کانادا"
                items={newsData.canada}
                selected={wizard.selectedNewsIds}
                onToggle={toggleNews}
              />
              <NewsGroup
                title="🇪🇺 اروپا"
                items={newsData.europe}
                selected={wizard.selectedNewsIds}
                onToggle={toggleNews}
              />
            </>
          )}

          <div className={styles.footerBar}>
            <button
              className={styles.primaryBtn}
              disabled={selectedNewsCount < 1}
              onClick={() => setView("tone-format")}
            >
              ادامه ({selectedNewsCount})
            </button>
          </div>
        </div>
      )}

      {view === "path-b" && (
        <div className={styles.section}>
          <div className={styles.topBar}>
            <button className={styles.backBtn} onClick={resetAll}>
              → بازگشت
            </button>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionLabel}>۱. کشورها را انتخاب کن</div>
            <div className={styles.chipGroup}>
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className={`${styles.chip} ${wizard.countries.includes(c.code) ? styles.chipSelected : ""}`}
                  onClick={() => toggleCountry(c.code)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionLabel}>۲. نوع محتوا</div>
            <div className={styles.chipGroup}>
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.chip} ${wizard.contentType === t ? styles.chipSelected : ""}`}
                  onClick={() => setWizard((w) => ({ ...w, contentType: t }))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionLabel}>۳. مخاطب هدف</div>
            <div className={styles.chipGroup}>
              {AUDIENCES.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`${styles.chip} ${wizard.audience === a ? styles.chipSelected : ""}`}
                  onClick={() => setWizard((w) => ({ ...w, audience: a }))}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionLabel}>۴. موضوع</div>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="خلاصه موضوع را بنویسید..."
              value={wizard.subject}
              onChange={(e) => setWizard((w) => ({ ...w, subject: e.target.value }))}
            />
          </div>

          <div className={styles.footerBar}>
            <button
              className={styles.primaryBtn}
              disabled={!pathBReady}
              onClick={() => setView("tone-format")}
            >
              ادامه
            </button>
          </div>
        </div>
      )}

      {view === "tone-format" && (
        <div className={styles.section}>
          <div className={styles.topBar}>
            <button
              className={styles.backBtn}
              onClick={() => setView(wizard.pathType === "news" ? "path-a" : "path-b")}
            >
              → بازگشت
            </button>
          </div>

          {genError && <p className={styles.errorBox}>{genError}</p>}

          <div className={styles.formSection}>
            <div className={styles.sectionLabel}>زبان خروجی</div>
            <div className={styles.chipGroup}>
              <button
                type="button"
                className={`${styles.chip} ${wizard.language === "persian" ? styles.chipSelected : ""}`}
                onClick={() => setWizard((w) => ({ ...w, language: "persian" }))}
              >
                🇮🇷 فارسی
              </button>
              <button
                type="button"
                className={`${styles.chip} ${wizard.language === "english" ? styles.chipSelected : ""}`}
                onClick={() => setWizard((w) => ({ ...w, language: "english" }))}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionLabel}>لحن محتوا</div>
            <div className={styles.chipGroup}>
              {TONES.map((t) => (
                <button
                  key={t}
                  className={`${styles.chip} ${wizard.tone === t ? styles.chipSelected : ""}`}
                  onClick={() => setWizard((w) => ({ ...w, tone: t }))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionLabel}>فرمت خروجی</div>
            <div className={styles.formatGrid}>
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  className={`${styles.formatCard} ${wizard.format === f.value ? styles.formatCardSelected : ""}`}
                  onClick={() => setWizard((w) => ({ ...w, format: f.value }))}
                >
                  <span className={styles.formatIcon}>{f.icon}</span>
                  <span className={styles.formatLabel}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {wizard.format === "carousel" && (
            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>تعداد اسلاید</div>
              <div className={styles.chipGroup}>
                {SLIDE_COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.chip} ${wizard.slideCount === n ? styles.chipSelected : ""}`}
                    onClick={() => setWizard((w) => ({ ...w, slideCount: n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.footerBar}>
            <button
              className={styles.primaryBtn}
              disabled={!wizard.tone || !wizard.format}
              onClick={handleGenerate}
            >
              تولید محتوا
            </button>
          </div>
        </div>
      )}

      {view === "generating" && (
        <div className={styles.generatingWrap}>
          <div className={styles.spinner} />
          <p className={styles.generatingText}>در حال تولید محتوا...</p>
        </div>
      )}

      {view === "output" && result && (
        <div className={styles.section}>
          <div className={styles.outputHeader}>
            <span className={styles.formatBadge}>
              {FORMATS.find((f) => f.value === result.format)?.icon}{" "}
              {FORMATS.find((f) => f.value === result.format)?.label}
            </span>
            <h2 className={styles.outputTitle}>{result.topic?.title}</h2>
          </div>

          {genError && <p className={styles.errorBox}>{genError}</p>}

          <div className={styles.outputActions}>
            <button
              className={styles.copyAllBtn}
              onClick={() => copy("all", fullTextFor(result.format, result.output))}
            >
              {copiedKey === "all" ? "کپی شد ✅" : "کپی همه"}
            </button>
          </div>

          <OutputContent
            format={result.format}
            output={result.output}
            copiedKey={copiedKey}
            onCopy={copy}
            reelTab={reelTab}
            setReelTab={setReelTab}
          />

          {!editMode && (
            <div className={styles.actionStack}>
              <button className={styles.primaryBtn} onClick={handleApprove}>
                {saveConfirm ? "ذخیره شد ✅" : "✅ تأیید و ذخیره"}
              </button>
              <button className={styles.secondaryBtn} onClick={() => setEditMode(true)}>
                ✏️ ویرایش و بازتولید
              </button>
            </div>
          )}

          {editMode && (
            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>چه چیزی باید اصلاح بشه؟</div>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="مثلاً: لحن رسمی‌تر باشه، عدد شهریه رو دقیق‌تر کن، کپشن کوتاه‌تر بشه..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className={styles.actionStack}>
                <button
                  className={styles.primaryBtn}
                  disabled={!feedbackText.trim()}
                  onClick={handleRegenerate}
                >
                  بازتولید با بازخورد
                </button>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setEditMode(false);
                    setFeedbackText("");
                  }}
                >
                  انصراف
                </button>
              </div>
            </div>
          )}

          <div className={styles.footerBar}>
            <button className={styles.secondaryBtn} onClick={resetAll}>
              محتوای جدید
            </button>
          </div>
        </div>
      )}

      {view === "archive" && !archiveItem && (
        <div className={styles.section}>
          <div className={styles.topBar}>
            <button className={styles.backBtn} onClick={() => setView("home")}>
              → بازگشت
            </button>
          </div>
          <h2 className={styles.outputTitle}>آرشیو محتوا</h2>
          {archive.length === 0 && <p className={styles.muted}>هنوز محتوایی ذخیره نشده.</p>}
          <div className={styles.archiveList}>
            {archive.map((item) => (
              <div key={item.id} className={styles.archiveRow}>
                <button
                  type="button"
                  className={styles.archiveRowMain}
                  onClick={() => setArchiveItem(item)}
                >
                  <span className={styles.archiveRowTitle}>{item.topicTitle || "بدون عنوان"}</span>
                  <span className={styles.archiveRowMeta}>
                    {formatDate(item.date)} ·{" "}
                    {FORMATS.find((f) => f.value === item.format)?.label || item.format}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.archiveDeleteBtn}
                  onClick={() => {
                    if (confirm("این محتوا از آرشیو حذف بشه؟")) deleteFromArchive(item.id);
                  }}
                  aria-label="حذف"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "archive" && archiveItem && (
        <div className={styles.section}>
          <div className={styles.topBar}>
            <button className={styles.backBtn} onClick={() => setArchiveItem(null)}>
              → بازگشت به آرشیو
            </button>
          </div>

          <div className={styles.outputHeader}>
            <span className={styles.formatBadge}>
              {FORMATS.find((f) => f.value === archiveItem.format)?.icon}{" "}
              {FORMATS.find((f) => f.value === archiveItem.format)?.label}
            </span>
            <h2 className={styles.outputTitle}>{archiveItem.topicTitle || "بدون عنوان"}</h2>
            <p className={styles.muted}>{formatDate(archiveItem.date)}</p>
          </div>

          <div className={styles.outputActions}>
            <button
              className={styles.copyAllBtn}
              onClick={() => copy("all", fullTextFor(archiveItem.format, archiveItem.output))}
            >
              {copiedKey === "all" ? "کپی شد ✅" : "کپی همه"}
            </button>
          </div>

          <OutputContent
            format={archiveItem.format}
            output={archiveItem.output}
            copiedKey={copiedKey}
            onCopy={copy}
            reelTab={reelTab}
            setReelTab={setReelTab}
          />

          <div className={styles.footerBar}>
            <button
              className={styles.secondaryBtn}
              onClick={() => {
                if (confirm("این محتوا از آرشیو حذف بشه؟")) deleteFromArchive(archiveItem.id);
              }}
            >
              حذف از آرشیو
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// Shared by the live output view and the archive detail view - renders the
// format-specific content blocks for a given {format, output}.
function OutputContent({ format, output, copiedKey, onCopy, reelTab, setReelTab }) {
  return (
    <>
      {format === "carousel" && (
        <>
          {output.slides.map((s) => (
            <div key={s.num} className={styles.card2}>
              <div className={styles.cardHead}>
                <span className={styles.slideNum}>اسلاید {s.num}</span>
                <button className={styles.sectionCopyBtn} onClick={() => onCopy(`slide-${s.num}`, s.content)}>
                  {copiedKey === `slide-${s.num}` ? "کپی شد ✅" : "کپی"}
                </button>
              </div>
              <p className={styles.cardBody}>{s.content}</p>
            </div>
          ))}
          <div className={styles.card2}>
            <div className={styles.cardHead}>
              <span className={styles.slideNum}>کپشن</span>
              <button className={styles.sectionCopyBtn} onClick={() => onCopy("caption", output.caption)}>
                {copiedKey === "caption" ? "کپی شد ✅" : "کپی"}
              </button>
            </div>
            <p className={styles.cardBody}>{output.caption}</p>
          </div>
        </>
      )}

      {format === "infographic" && (
        <>
          <OutputSection title="آمار کلیدی" text={output.stats.join("\n")} copyKey="stats" copiedKey={copiedKey} onCopy={onCopy} />
          <OutputSection title="جدول مقایسه" text={output.comparison} copyKey="comparison" copiedKey={copiedKey} onCopy={onCopy} />
          <OutputSection title="نقشه راه" text={output.roadmap} copyKey="roadmap" copiedKey={copiedKey} onCopy={onCopy} />
          <OutputSection title="منبع" text={output.source} copyKey="source" copiedKey={copiedKey} onCopy={onCopy} />
        </>
      )}

      {format === "reel" && (
        <>
          <div className={styles.tabBar}>
            {["hook", "body", "cta"].map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${reelTab === t ? styles.tabActive : ""}`}
                onClick={() => setReelTab(t)}
              >
                {t === "hook" ? "هوک" : t === "body" ? "بدنه" : "CTA"}
              </button>
            ))}
          </div>
          <div className={styles.card2}>
            <div className={styles.cardHead}>
              <button className={styles.sectionCopyBtn} onClick={() => onCopy(reelTab, output[reelTab])}>
                {copiedKey === reelTab ? "کپی شد ✅" : "کپی"}
              </button>
            </div>
            <p className={styles.cardBody}>{output[reelTab]}</p>
          </div>
          <OutputSection title="متن‌های روی صفحه" text={output.onscreen.join("\n")} copyKey="onscreen" copiedKey={copiedKey} onCopy={onCopy} />
        </>
      )}

      {format === "article" && (
        <OutputSection title={output.title} text={output.content} copyKey="content" copiedKey={copiedKey} onCopy={onCopy} />
      )}

      {format === "telegram" && (
        <div className={styles.telegramPreview}>
          <div className={styles.cardHead}>
            <span className={styles.slideNum}>پیش‌نمایش پست</span>
            <button className={styles.sectionCopyBtn} onClick={() => onCopy("text", output.text)}>
              {copiedKey === "text" ? "کپی شد ✅" : "کپی"}
            </button>
          </div>
          <p className={styles.cardBody}>{output.text}</p>
        </div>
      )}
    </>
  );
}

function NewsGroup({ title, items, selected, onToggle }) {
  if (!items.length) return null;
  return (
    <div className={styles.newsGroup}>
      <div className={styles.groupTitle}>{title}</div>
      <div className={styles.newsList}>
        {items.map((item) => (
          <label
            key={item.id}
            className={`${styles.newsItem} ${selected.has(item.id) ? styles.newsItemSelected : ""}`}
          >
            <input
              type="checkbox"
              className={styles.newsCheckbox}
              checked={selected.has(item.id)}
              onChange={() => onToggle(item.id)}
            />
            <span>
              <span className={styles.newsItemTitle}>{item.title}</span>
              <span className={styles.newsItemMeta}>
                {item.source} · {item.date}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function OutputSection({ title, text, copyKey, copiedKey, onCopy }) {
  return (
    <div className={styles.card2}>
      <div className={styles.cardHead}>
        <span className={styles.slideNum}>{title}</span>
        <button className={styles.sectionCopyBtn} onClick={() => onCopy(copyKey, text)}>
          {copiedKey === copyKey ? "کپی شد ✅" : "کپی"}
        </button>
      </div>
      <p className={styles.cardBody}>{text}</p>
    </div>
  );
}

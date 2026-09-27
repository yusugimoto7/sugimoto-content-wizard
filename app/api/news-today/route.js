export const runtime = "nodejs";

// Mock news items until real RSS ingestion replaces this. Shape matches what
// lib/prompts.js expects as `topic`/`sourceText` input once a user picks one.
const MOCK_NEWS = [
  {
    id: "ca-1",
    title: "IRCC به‌روزرسانی الزامات مدرک زبان برای پرمیت تحصیلی اعلام کرد",
    source: "IRCC",
    date: "2026-09-25",
    snippet:
      "اداره مهاجرت کانادا (IRCC) تغییراتی در الزامات نمره زبان برای متقاضیان پرمیت تحصیلی از برخی کشورها اعلام کرد که از ماه آینده اجرایی می‌شود.",
    country: "canada",
    field: "Study",
  },
  {
    id: "ca-2",
    title: "استان بریتیش کلمبیا سهمیه جدید BC PNP برای مشاغل فنی اعلام کرد",
    source: "BC PNP",
    date: "2026-09-24",
    snippet:
      "برنامه نامزدی استانی بریتیش کلمبیا یک دور جدید دعوت‌نامه ویژه مشاغل فناوری اطلاعات و مهندسی منتشر کرد.",
    country: "canada",
    field: "PNP",
  },
  {
    id: "ca-3",
    title: "تغییر در شرایط LMIA برای کارفرمایان بخش مراقبت‌های بهداشتی",
    source: "ESDC",
    date: "2026-09-23",
    snippet:
      "وزارت اشتغال کانادا فرآیند ارزیابی تأثیر بازار کار (LMIA) برای مشاغل حوزه سلامت را ساده‌تر کرد تا کمبود نیرو در این بخش جبران شود.",
    country: "canada",
    field: "LMIA",
  },
  {
    id: "ca-4",
    title: "دادگاه فدرال کانادا یک رأی مهم درباره رد پرونده‌های PGWP صادر کرد",
    source: "Federal Court",
    date: "2026-09-22",
    snippet:
      "دادگاه فدرال در یک رأی تازه، رویه اداره مهاجرت در رد درخواست‌های تمدید پرمیت کار پس از تحصیل را زیر سؤال برد.",
    country: "canada",
    field: "Court",
  },
  {
    id: "eu-1",
    title: "هلند شرایط استارتاپ ویزا را برای بنیان‌گذاران بین‌المللی تسهیل کرد",
    source: "IND Netherlands",
    date: "2026-09-25",
    snippet:
      "اداره مهاجرت هلند فرآیند تأیید فسیلیتیتور (facilitator) در برنامه استارتاپ ویزا را ساده‌تر کرد تا زمان پردازش کاهش یابد.",
    country: "europe",
    field: "Europe",
  },
  {
    id: "eu-2",
    title: "آلمان کارت فرصت (Opportunity Card) را به کشورهای بیشتری گسترش داد",
    source: "German Federal Foreign Office",
    date: "2026-09-21",
    snippet:
      "دولت آلمان دامنه شمول برنامه کارت فرصت برای جویندگان کار متخصص را افزایش داد.",
    country: "europe",
    field: "Europe",
  },
  {
    id: "eu-3",
    title: "فنلاند سقف سنی برنامه تحصیلی را برای برخی رشته‌ها بازنگری کرد",
    source: "Finnish Immigration Service",
    date: "2026-09-20",
    snippet:
      "اداره مهاجرت فنلاند اعلام کرد در حال بازنگری شرایط سنی پذیرش برای برخی برنامه‌های کارشناسی ارشد است.",
    country: "europe",
    field: "Study",
  },
  {
    id: "eu-4",
    title: "فرانسه فرآیند ویزای زبان‌آموزی را برای متقاضیان جوان ساده کرد",
    source: "Campus France",
    date: "2026-09-19",
    snippet:
      "کمپوس فرانس اعلام کرد فرآیند درخواست ویزای برنامه‌های زبان فرانسه برای گروه سنی ۱۸ تا ۳۶ سال ساده‌تر شده است.",
    country: "europe",
    field: "Europe",
  },
];

export async function GET() {
  const canada = MOCK_NEWS.filter((n) => n.country === "canada");
  const europe = MOCK_NEWS.filter((n) => n.country === "europe");
  return Response.json({ items: MOCK_NEWS, canada, europe });
}

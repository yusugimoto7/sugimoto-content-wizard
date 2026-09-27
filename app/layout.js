import "./globals.css";

export const metadata = {
  title: "دستیار تولید محتوا | سوگیموتو ویزا",
  description: "دستیار تولید محتوای فارسی برند سوگیموتو ویزا",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

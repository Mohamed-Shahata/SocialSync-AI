import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-jakarta",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = plexArabic;
const inter = plexArabic;

export const metadata: Metadata = {
  title: "PostAI — بوستاتك الجاهزة في ثواني",
  description:
    "PostAI بيحول فكرتك لبوستات احترافية على السوشيال ميديا في ثواني، بالذكاء الاصطناعي، وبأسلوبك انت.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-neutral">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

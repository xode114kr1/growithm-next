import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://growithm.net"),
  title: {
    default: "Growithm",
    template: "%s | Growithm",
  },
  description: "알고리즘 문제 풀이와 스터디 성장을 기록하는 플랫폼입니다.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Growithm",
    description: "알고리즘 문제 풀이와 스터디 성장을 기록하는 플랫폼입니다.",
    url: "/",
    siteName: "Growithm",
    locale: "ko_KR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${newsreader.variable} ${jetBrainsMono.variable}`}
    >
      <body suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}

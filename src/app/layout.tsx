import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growithm",
  description: "Growithm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

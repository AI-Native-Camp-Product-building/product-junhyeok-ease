import type { Metadata } from "next";
import { Agentation } from "agentation";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ease — 90초, 뇌를 깨우다",
  description:
    "도파민 과잉 자극 시대, 90초 Brain Reset으로 도파민 민감도를 측정하고 회복하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;500;600&family=Gowun+Batang&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-text antialiased">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}

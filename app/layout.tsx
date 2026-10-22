import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Both are free on Vercel's Hobby plan and ship nothing until deployed there.
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Absolute base for OG tags. Falls back to the URL Vercel injects at build
 * time, so a shared link shows its preview card even if NEXT_PUBLIC_SITE_URL
 * was never set — without it the card pointed at localhost and showed nothing.
 */
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Sponsor my trisuit",
  description:
    "Pick a place on the suit I will race an Ironman in, put your logo on it, and come with me for the whole thing — including all seven documentary episodes.",
  openGraph: {
    title: "Sponsor my trisuit",
    description:
      "Put your logo on the suit I will race an Ironman in — plus a seven-part documentary your brand is part of.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "A blank trisuit with fourteen sponsor slots marked on it" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" id="top">
      {/*
        Extensions such as Grammarly stamp their own attributes onto <body>
        before React hydrates. This only silences attribute differences on
        this one element; mismatches anywhere inside still get reported.
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

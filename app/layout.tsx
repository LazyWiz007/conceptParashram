import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

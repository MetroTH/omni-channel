import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "InboxPro – Omnichannel Customer Platform",
  description: "Unified inbox for LINE, Facebook, WhatsApp, and Voice calls",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}

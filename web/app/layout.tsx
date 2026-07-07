import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Hammer } from "lucide-react";
import { NavBarDemo } from "@/components/navbar-demo";
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
  title: "Hurfa — Marketplace",
  description: "Freelance services marketplace built with Next.js and shadcn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Hammer className="size-5" aria-hidden />
              Hurfa
            </Link>
            <NavBarDemo />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STATIVA — Pusat Dokumentasi & Arsip Statistik BPS",
  description: "Sistem Monitoring Survei Terintegrasi dan Arsip Statistik BPS Kabupaten Kepulauan Sula",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen font-sans">
        <CommandPalette />
        <Sidebar />
        <main className="ml-64 min-h-screen bg-slate-950">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Layers, BookOpen, Calendar, Archive,
  FileCheck, Users, Search
} from "lucide-react";

const navSections = [
  {
    title: "Utama",
    items: [
      { label: "Beranda", href: "/", icon: Home },
      { label: "Katalog Seluruh Kegiatan", href: "/kegiatan", icon: BookOpen },
    ],
  },
  {
    title: "Direktori Tim Statistik",
    items: [
      { label: "Statistik Sosial", href: "/tim/sosial", icon: Layers },
      { label: "Statistik Produksi", href: "/tim/produksi", icon: Layers },
      { label: "Statistik Distribusi", href: "/tim/distribusi", icon: Layers },
      { label: "Neraca & Analisis (NWAS)", href: "/tim/nwas", icon: Layers },
    ],
  },
  {
    title: "Operasional & Arsip",
    items: [
      { label: "Timeline & Kalender 2026", href: "/timeline", icon: Calendar },
      { label: "Pusat Arsip Lintas Tahun", href: "/arsip", icon: Archive },
      { label: "Standar Metadata", href: "/metadata", icon: FileCheck },
      { label: "Direktori Petugas", href: "/petugas", icon: Users },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col z-40">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-sky-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
            BPS
          </div>
          <div>
            <p className="text-white font-semibold text-sm tracking-tight group-hover:text-sky-400 transition-colors">
              STATIVA
            </p>
            <p className="text-slate-400 text-[11px] leading-tight">
              Kab. Kepulauan Sula
            </p>
          </div>
        </Link>
      </div>

      {/* Global Quick Search Button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              metaKey: true,
              bubbles: true,
            });
            window.dispatchEvent(event);
          }}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            Cari survei/dokumen...
          </span>
          <kbd className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                      active
                        ? "bg-slate-800 text-sky-400 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${active ? "text-sky-400" : "text-slate-500"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-[11px] text-slate-500">
        <p className="font-medium text-slate-400">Portal Operasional Statistik</p>
        <p className="text-[10px] mt-0.5">Standar Satu Data Indonesia</p>
      </div>
    </aside>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Layers, FileText, Calendar, ArrowRight, X } from "lucide-react";
import { kegiatanApi, metaApi } from "@/lib/api";
import type { KegiatanRingkas, Tim } from "@/lib/types";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [kegiatanList, setKegiatanList] = useState<KegiatanRingkas[]>([]);
  const [timList, setTimList] = useState<Tim[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (kegiatanList.length === 0) {
        kegiatanApi.list({ per_page: 60 }).then((res) => setKegiatanList(res.items)).catch(() => {});
        metaApi.tim().then(setTimList).catch(() => {});
      }
    }
  }, [isOpen, kegiatanList.length]);

  const filteredKegiatan = kegiatanList.filter((k) =>
    k.nama_kegiatan.toLowerCase().includes(query.toLowerCase()) ||
    k.kode_kegiatan.toLowerCase().includes(query.toLowerCase()) ||
    (k.tim?.nama && k.tim.nama.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 8);

  const filteredTim = timList.filter((t) =>
    t.nama.toLowerCase().includes(query.toLowerCase()) ||
    t.kode.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kegiatan, dokumen, standar metadata, atau tim BPS... (Esc untuk keluar)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-500 hover:text-slate-300 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {/* Section: Tim */}
          {filteredTim.length > 0 && (
            <div className="py-2">
              <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pilar Tim Statistik
              </p>
              {filteredTim.map((tim) => (
                <div
                  key={tim.id}
                  onClick={() => navigateTo(`/tim/${tim.kode}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/70 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                      Tim {tim.nama}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1 group-hover:text-sky-400">
                    Buka Direktori <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Section: Kegiatan Statistik */}
          {filteredKegiatan.length > 0 ? (
            <div className="py-2">
              <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Kegiatan Statistik ({filteredKegiatan.length})
              </p>
              {filteredKegiatan.map((k) => (
                <div
                  key={k.id}
                  onClick={() => navigateTo(`/kegiatan/${k.id}`)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800/70 cursor-pointer group transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {k.kode_kegiatan}
                      </span>
                      {k.tim && (
                        <span className="text-[11px] text-slate-400">
                          {k.tim.nama}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-100 truncate group-hover:text-sky-400">
                      {k.nama_kegiatan}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0 group-hover:text-slate-300">
                    Dokumentasi & Metadata →
                  </span>
                </div>
              ))}
            </div>
          ) : query && filteredTim.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Tidak ditemukan hasil untuk &quot;{query}&quot;
            </div>
          ) : null}

          {/* Navigasi Cepat */}
          {!query && (
            <div className="py-2">
              <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Navigasi Cepat
              </p>
              <div
                onClick={() => navigateTo("/timeline")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/70 cursor-pointer text-sm text-slate-300 hover:text-white"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                Kalender & Roadmap Operasional Statistik 2026
              </div>
              <div
                onClick={() => navigateTo("/arsip")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/70 cursor-pointer text-sm text-slate-300 hover:text-white"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Pusat Arsip Lintas Tahun (2022 - 2026)
              </div>
              <div
                onClick={() => navigateTo("/metadata")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/70 cursor-pointer text-sm text-slate-300 hover:text-white"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                Standar Metadata Statistik & Kamus Indikator
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Gunakan panah & enter untuk navigasi</span>
          <span>STATIVA Institutional Portal</span>
        </div>
      </div>
    </div>
  );
}

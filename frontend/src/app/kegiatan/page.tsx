"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, FolderOpen, Loader2, ArrowRight, Layers, FileText } from "lucide-react";
import Link from "next/link";
import type { KegiatanRingkas, Tim, Tahun } from "@/lib/types";
import { kegiatanApi, metaApi } from "@/lib/api";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "perencanaan", label: "Perencanaan" },
  { value: "berjalan", label: "Sedang Berjalan" },
  { value: "selesai", label: "Telah Selesai" },
  { value: "diarsipkan", label: "Diarsipkan" },
];

const JENIS_OPTIONS = [
  { value: "", label: "Semua Jenis" },
  { value: "survei", label: "Survei" },
  { value: "sensus", label: "Sensus" },
  { value: "updating", label: "Pemutakhiran Direktori" },
  { value: "pendataan", label: "Pendataan Lengkap" },
];

function KegiatanListContent() {
  const searchParams = useSearchParams();

  const [items, setItems] = useState<KegiatanRingkas[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [timList, setTimList] = useState<Tim[]>([]);
  const [tahunList, setTahunList] = useState<Tahun[]>([]);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") ?? "");
  const [filterTim, setFilterTim] = useState(searchParams.get("tim_id") ?? "");
  const [filterTahun, setFilterTahun] = useState(searchParams.get("tahun") ?? "");
  const [filterJenis, setFilterJenis] = useState(searchParams.get("jenis") ?? "");

  const PER_PAGE = 15;

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await kegiatanApi.list({
        page: pg,
        per_page: PER_PAGE,
        q: q || undefined,
        status: filterStatus || undefined,
        tim_id: filterTim || undefined,
        tahun: filterTahun ? Number(filterTahun) : undefined,
        jenis: filterJenis || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
      setPage(pg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [q, filterStatus, filterTim, filterTahun, filterJenis]);

  useEffect(() => {
    metaApi.tim().then(setTimList).catch(() => {});
    metaApi.tahun().then(setTahunList).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchData(1), 250);
    return () => clearTimeout(t);
  }, [fetchData]);

  const clearFilters = () => {
    setQ("");
    setFilterStatus("");
    setFilterTim("");
    setFilterTahun("");
    setFilterJenis("");
  };

  const hasFilters = Boolean(q || filterStatus || filterTim || filterTahun || filterJenis);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1.5">
            <span>KATALOG DATA RESMI</span>
            <span>•</span>
            <span>BPS KABUPATEN KEPULAUAN SULA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Katalog Seluruh Kegiatan Statistik
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {total > 0 ? `Menampilkan ${total} kegiatan statistik yang terdaftar di sistem STATIVA` : "Mencari data..."}
          </p>
        </div>

        <Link
          href="/admin/kegiatan/baru"
          className="text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Tambah Kegiatan Baru
        </Link>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama kegiatan, singkatan (contoh: SUSENAS, SAKERNAS, UBINAN)..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Tim Select */}
          <select
            value={filterTim}
            onChange={(e) => setFilterTim(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="">Semua Pilar Tim</option>
            {timList.map((t) => (
              <option key={t.id} value={t.id}>{t.nama}</option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Jenis Select */}
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            {JENIS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Tahun Select */}
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="">Semua Tahun</option>
            {tahunList.map((t) => (
              <option key={t.id} value={String(t.tahun)}>{t.tahun}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1 inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ── STRUCTURED DOCUMENT LEDGER (NOT CARDS!) ── */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-900/40 border border-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-400">Tidak ada kegiatan statistik yang sesuai filter.</p>
          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau reset filter di atas.</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800/60 overflow-hidden">
          {items.map((k) => (
            <div
              key={k.id}
              className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                    {k.kode_kegiatan}
                  </span>
                  {k.tim && (
                    <span className="text-[11px] text-slate-400">
                      Tim {k.tim.nama}
                    </span>
                  )}
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-400 uppercase">
                    {k.jenis}
                  </span>
                </div>

                <Link
                  href={`/kegiatan/${k.id}`}
                  className="font-medium text-sm text-white hover:text-sky-400 transition-colors block truncate"
                >
                  {k.nama_kegiatan}
                </Link>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right text-[11px] text-slate-400 hidden md:block">
                  {k.target_sampel > 0 ? (
                    <span>{k.target_sampel.toLocaleString("id-ID")} Sampel</span>
                  ) : (
                    <span>Pendataan Lengkap</span>
                  )}
                  <span className="block text-slate-500 font-mono">Platform: {k.platform.toUpperCase()}</span>
                </div>

                <Link
                  href={`/kegiatan/${k.id}`}
                  className="text-xs font-medium text-sky-400 hover:text-white bg-slate-800/90 hover:bg-sky-600 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-sky-500 transition-all inline-flex items-center gap-1"
                >
                  Dokumentasi & Dokumen <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 text-xs text-slate-400">
          <button
            onClick={() => fetchData(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-30 hover:border-slate-700 transition-colors"
          >
            ← Sebelumnya
          </button>
          <span>Halaman {page} dari {totalPages}</span>
          <button
            onClick={() => fetchData(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-30 hover:border-slate-700 transition-colors"
          >
            Berikutnya →
          </button>
        </div>
      )}
    </div>
  );
}

export default function KegiatanListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
        </div>
      }
    >
      <KegiatanListContent />
    </Suspense>
  );
}

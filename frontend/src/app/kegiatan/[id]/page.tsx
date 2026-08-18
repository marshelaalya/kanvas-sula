"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, FileText, Download, CheckCircle2, Clock, Users,
  Target, Layers, Calendar, ChevronRight, BookOpen, AlertCircle,
  ExternalLink, Upload, Loader2, ShieldCheck, MapPin
} from "lucide-react";
import type { KegiatanDetail, Dokumen } from "@/lib/types";
import { kegiatanApi, dokumenApi, formatBytes } from "@/lib/api";
import DokumenUpload from "@/components/DokumenUpload";

function formatTanggal(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function KegiatanDocsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [kegiatan, setKegiatan] = useState<KegiatanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("ikhtisar");

  const fetchKegiatan = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await kegiatanApi.get(id);
      setKegiatan(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat dokumen kegiatan.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKegiatan();
  }, [fetchKegiatan]);

  const handleDokumenUploaded = (dok: Dokumen) => {
    setKegiatan((prev) => prev ? { ...prev, dokumen: [dok, ...prev.dokumen] } : prev);
  };

  const handleDokumenDeleted = (dokId: string) => {
    setKegiatan((prev) => prev ? { ...prev, dokumen: prev.dokumen.filter((d) => d.id !== dokId) } : prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (error || !kegiatan) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-red-400 text-sm">{error || "Dokumentasi kegiatan tidak ditemukan."}</p>
        <Link href="/kegiatan" className="text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Katalog Kegiatan
        </Link>
      </div>
    );
  }

  const tocItems = [
    { id: "ikhtisar", label: "1. Ikhtisar & Latar Belakang" },
    { id: "dasar-hukum", label: "2. Dasar Hukum & Legalitas" },
    { id: "metodologi", label: "3. Ruang Lingkup & Metodologi" },
    { id: "instrumen", label: "4. Dokumen & Kuesioner Resmi", count: kegiatan.dokumen.length },
    { id: "timeline", label: "5. Tahapan & Timeline Fase", count: kegiatan.fase.length },
    { id: "monitoring", label: "6. Pemantauan Lapangan" },
    { id: "riwayat", label: "7. Catatan Perubahan & Arsip" },
  ];

  return (
    <div className="space-y-8">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link href="/" className="hover:text-slate-200">STATIVA</Link>
          <span>/</span>
          {kegiatan.tim && (
            <>
              <Link href={`/tim/${kegiatan.tim.kode}`} className="hover:text-slate-200">
                {kegiatan.tim.nama}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-300 font-mono">{kegiatan.kode_kegiatan}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                {kegiatan.kode_kegiatan}
              </span>
              <span className="text-[11px] font-medium text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded uppercase">
                {kegiatan.jenis}
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Platform: {kegiatan.platform.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-400">
                Tahun Anggaran {kegiatan.tahun_rel?.tahun ?? 2026}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {kegiatan.nama_kegiatan}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="#dokumen-section"
              className="text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Lihat Kuesioner & Dokumen ({kegiatan.dokumen.length})
            </a>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN DOCUMENTATION LAYOUT (STRIPE DOCS / WIKIPEDIA STYLE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Table of Contents (Left Column - 3 cols) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-6 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            Daftar Isi Dokumentasi
          </p>
          <nav className="space-y-0.5">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-md transition-colors ${
                  activeSection === item.id
                    ? "bg-slate-800 text-sky-400 font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.2 rounded">
                    {item.count}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Document Reading Body (Right Column - 9 cols) */}
        <div className="lg:col-span-9 space-y-10 text-slate-300 leading-relaxed text-xs sm:text-sm">
          {/* Section 1: Ikhtisar */}
          <section id="ikhtisar" className="space-y-4 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              1. Ikhtisar & Latar Belakang
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {kegiatan.deskripsi || "Survei resmi Badan Pusat Statistik yang diselenggarakan secara terstandar untuk menghasilkan indikator pembangunan daerah."}
            </p>
            {kegiatan.tujuan && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-1.5">
                <p className="font-semibold text-white text-xs">Tujuan Pokok Kegiatan:</p>
                <p className="text-slate-400 text-xs leading-relaxed">{kegiatan.tujuan}</p>
              </div>
            )}
          </section>

          {/* Section 2: Dasar Hukum */}
          <section id="dasar-hukum" className="space-y-4 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              2. Dasar Hukum & Legalitas Penyelenggaraan
            </h2>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>Undang-Undang Republik Indonesia Nomor 16 Tahun 1997 tentang Statistik.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>Peraturan Presiden Nomor 39 Tahun 2019 tentang Satu Data Indonesia.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>Keputusan Kepala BPS Kabupaten Kepulauan Sula tentang Penetapan Petugas Pencacah dan Pengawas Lapangan Tahun 2026.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Ruang Lingkup & Metodologi */}
          <section id="metodologi" className="space-y-4 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              3. Ruang Lingkup & Metodologi Pelaksanaan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5">
                <span className="text-slate-500 block mb-1">Cakupan Wilayah:</span>
                <span className="text-slate-200 font-medium">{kegiatan.cakupan_wilayah || "Seluruh Kecamatan di Kab. Kepulauan Sula"}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5">
                <span className="text-slate-500 block mb-1">Platform Pengumpulan Data:</span>
                <span className="text-slate-200 font-medium font-mono">{kegiatan.platform.toUpperCase()} (FASIH / CAPI Mobile)</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5">
                <span className="text-slate-500 block mb-1">Target Sampel:</span>
                <span className="text-slate-200 font-mono font-medium">{kegiatan.target_sampel > 0 ? `${kegiatan.target_sampel.toLocaleString("id-ID")} Sampel` : "Pendataan Lengkap"}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5">
                <span className="text-slate-500 block mb-1">Jadwal Pelaksanaan Lapangan:</span>
                <span className="text-slate-200 font-medium">{formatTanggal(kegiatan.tanggal_mulai)} s.d. {formatTanggal(kegiatan.tanggal_selesai)}</span>
              </div>
            </div>
            {kegiatan.metodologi && (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                <strong className="text-slate-300">Metode Sampling:</strong> {kegiatan.metodologi}
              </p>
            )}
          </section>

          {/* Section 4: Repositori Dokumen */}
          <section id="instrumen" className="space-y-4 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                4. Dokumen & Kuesioner Resmi
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Kuesioner cetak, buku pedoman teknis pencacah (Buku 1/2), Kerangka Acuan Kerja (KAK), dan SK Tim yang sah.
            </p>

            <DokumenUpload
              kegiatanId={kegiatan.id}
              existingDokumen={kegiatan.dokumen}
              onUploaded={handleDokumenUploaded}
              onDeleted={handleDokumenDeleted}
            />
          </section>

          {/* Section 5: Timeline Fase */}
          <section id="timeline" className="space-y-4 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              5. Tahapan & Timeline Pelaksanaan
            </h2>
            {kegiatan.fase && kegiatan.fase.length > 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800/60">
                {kegiatan.fase.map((f, i) => (
                  <div key={f.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[11px] text-slate-400">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{f.nama_fase}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatTanggal(f.tanggal_mulai)} s.d. {formatTanggal(f.tanggal_selesai)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] capitalize text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {f.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Belum ada rincian tahapan fase yang dikonfigurasi.</p>
            )}
          </section>

          {/* Section 6: Pemantauan Lapangan */}
          <section id="monitoring" className="space-y-4 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              6. Pemantauan Operasional Lapangan
            </h2>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status Operasi Saat Ini:</span>
                <span className="font-medium text-white capitalize">{kegiatan.status}</span>
              </div>
              {kegiatan.target_sampel > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Progres Realisasi Masuk:</span>
                    <span className="font-mono font-medium text-white">
                      {kegiatan.realisasi_akhir.toLocaleString("id-ID")} / {kegiatan.target_sampel.toLocaleString("id-ID")} ({Math.round(kegiatan.realisasi_akhir / kegiatan.target_sampel * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round(kegiatan.realisasi_akhir / kegiatan.target_sampel * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 7: Arsip & Catatan Perubahan */}
          <section id="riwayat" className="space-y-4 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              7. Catatan Perubahan & Arsip Lintas Tahun
            </h2>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-xs text-slate-400 space-y-2">
              <p>• <strong>Tahun 2026:</strong> Penyelenggaraan rutin tahun berjalan dengan instrumen CAPI berbasis portal FASIH.</p>
              <p>• <strong>Tahun 2025:</strong> Integrasi kuesioner modul terstandar Satu Data Indonesia.</p>
              <p>• <strong>Tahun 2024:</strong> Rekonsiliasi kerangka sampel blok sensus Wilkerstat terbaru.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Archive, Calendar, BookOpen, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { metaApi, kegiatanApi } from "@/lib/api";
import type { KegiatanRingkas, Tahun } from "@/lib/types";

export const dynamic = "force-dynamic";

const ARCHIVE_YEARS_META: Record<number, {
  tema: string;
  tonggakSejarah: string;
  publikasiUtama: string[];
}> = {
  2026: {
    tema: "Penyelenggaraan Sensus Ekonomi 2026 & Digitalisasi Portal FASIH",
    tonggakSejarah: "Pelaksanaan Sensus Ekonomi (SE2026) sepuluh tahunan seluruh usaha non-pertanian dan integrasi penuh kuesioner digital CAPI FASIH.",
    publikasiUtama: ["Kabupaten Kepulauan Sula Dalam Angka 2026", "Laporan Pendaftaran Usaha SE2026", "Indikator Kesejahteraan Rakyat 2026"],
  },
  2025: {
    tema: "Integrasi Metadata Standar Satu Data Indonesia (SDI)",
    tonggakSejarah: "Standardisasi seluruh variabel survei sosial ekonomi ke dalam skema MS-Keg/MS-Ind dan penguatan program Desa Cinta Statistik (Desa Cantik).",
    publikasiUtama: ["Kabupaten Kepulauan Sula Dalam Angka 2025", "Statistik Kesejahteraan Rakyat 2025", "Produk Domestik Regional Bruto 2021-2025"],
  },
  2024: {
    tema: "Pendataan Lengkap Potensi Desa (PODES) 2024 & Diseminasi Sensus Pertanian",
    tonggakSejarah: "Penyelenggaraan Sensus PODES 2024 di 167 desa/kelurahan untuk pembaruan Indeks Kesulitan Geografis (IKG) dan rilis data Tahap II Sensus Pertanian 2023.",
    publikasiUtama: ["Hasil Pendataan Potensi Desa 2024", "Statistik Keadaan Ketenagakerjaan 2024", "Indeks Kemahalan Konstruksi 2024"],
  },
  2023: {
    tema: "Sensus Pertanian 2023 (ST2023)",
    tonggakSejarah: "Pelaksanaan Sensus Pertanian sepuluh tahunan mencakup unit usaha pertanian perorangan (UTP), korporasi pertanian (UPB), dan usaha pertanian lainnya (UTL).",
    publikasiUtama: ["Hasil Sensus Pertanian 2023 Tahap I", "Profil Petani Milenial & Urban Farming", "Kabupaten Kepulauan Sula Dalam Angka 2023"],
  },
  2022: {
    tema: "Survei Biaya Hidup (SBH) 2022 & Long Form Sensus Penduduk (SP2020 LF)",
    tonggakSejarah: "Pembaruan tahun dasar diagram timbang inflasi IHK dan pendataan sampel mendalam parameter demografi/fertilitas/mortalitas nasional.",
    publikasiUtama: ["Hasil Long Form Sensus Penduduk 2020", "Pola Pengeluaran Rumah Tangga Hasil SBH", "Kabupaten Kepulauan Sula Dalam Angka 2022"],
  },
};

export default async function ArchiveCenterPage() {
  let tahunList: Tahun[] = [];
  let kegiatanList: KegiatanRingkas[] = [];

  try {
    const [resTahun, resKegiatan] = await Promise.all([
      metaApi.tahun(),
      kegiatanApi.list({ per_page: 60 }),
    ]);
    tahunList = resTahun.sort((a, b) => b.tahun - a.tahun);
    kegiatanList = resKegiatan.items;
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="space-y-10">
      {/* ── HEADER ── */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2">
          <span>MEMORI INSTITUSI STATISTIK</span>
          <span>•</span>
          <span>BPS KABUPATEN KEPULAUAN SULA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Pusat Arsip Digital Lintas Tahun (2022 - 2026)
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Repositori abadi dokumentasi kegiatan statistik, riwayat metodologi kuesioner, keputusan penugasan petugas,
          dan publikasi resmi yang diselenggarakan dari tahun ke tahun.
        </p>
      </div>

      {/* ── YEAR TIMELINE CHRONOLOGY ── */}
      <div className="space-y-6">
        {tahunList.map((th) => {
          const meta = ARCHIVE_YEARS_META[th.tahun] || {
            tema: `Penyelenggaraan Kegiatan Statistik Tahun ${th.tahun}`,
            tonggakSejarah: `Pelaksanaan survei rutin dan kompilasi data tahun anggaran ${th.tahun}.`,
            publikasiUtama: [`Kabupaten Kepulauan Sula Dalam Angka ${th.tahun}`],
          };

          const isCurrent = th.tahun === 2026;

          return (
            <div
              key={th.id}
              className={`bg-slate-900/60 border rounded-xl p-6 transition-colors ${
                isCurrent ? "border-sky-800/80 bg-slate-900/90" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold font-mono px-3 py-1 rounded-lg border ${
                      isCurrent
                        ? "bg-sky-600 text-white border-sky-500"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}>
                      {th.tahun}
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-white">
                        {meta.tema}
                      </h2>
                      <span className="text-[11px] text-slate-400">
                        {isCurrent ? "Tahun Anggaran Berjalan (Aktif)" : "Arsip Tersimpan & Terverifikasi"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {meta.tonggakSejarah}
                  </p>

                  {/* Publications */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Publikasi & Hasil Statistik Kunci:
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                      {meta.publikasiUtama.map((pub) => (
                        <span
                          key={pub}
                          className="bg-slate-800/70 border border-slate-700/60 text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3 h-3 text-sky-400" />
                          {pub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="lg:w-64 flex-shrink-0 flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-slate-800/80 pt-4 lg:pt-0">
                  <div className="text-xs text-slate-400 mb-3">
                    {isCurrent ? (
                      <span className="font-mono text-emerald-400 font-bold">54 Kegiatan Aktif</span>
                    ) : (
                      <span className="font-mono text-slate-400">Arsip Lengkap</span>
                    )}
                  </div>
                  <Link
                    href={`/kegiatan?tahun=${th.tahun}`}
                    className="text-xs font-medium text-white bg-slate-800 hover:bg-sky-600 px-4 py-2 rounded-lg border border-slate-700 hover:border-sky-500 transition-all inline-flex items-center gap-1.5"
                  >
                    Buka Dokumen Tahun {th.tahun} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

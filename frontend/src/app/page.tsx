import Link from "next/link";
import { ArrowRight, Calendar, Layers, FileText, ChevronRight } from "lucide-react";
import { metaApi, kegiatanApi } from "@/lib/api";
import type { DashboardStats, KegiatanRingkas } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getStats(): Promise<DashboardStats | null> {
  try {
    return await metaApi.dashboardStats();
  } catch {
    return null;
  }
}

async function getKegiatanBerjalan(): Promise<KegiatanRingkas[]> {
  try {
    const res = await kegiatanApi.list({ status: "berjalan", per_page: 10 });
    return res.items;
  } catch {
    return [];
  }
}

const TIM_DESCRIPTIONS: Record<string, { label: string; desc: string; sample: string }> = {
  sosial: {
    label: "Statistik Sosial",
    desc: "Mengelola survei kependudukan, ketenagakerjaan, kemiskinan makro, kesehatan, pendidikan, dan potensi perdesaan.",
    sample: "SUSENAS, SAKERNAS, SERUTI, PODES, Desa Cantik, Polkam",
  },
  produksi: {
    label: "Statistik Produksi",
    desc: "Mengelola data pertanian, tanaman pangan, hortikultura, perkebunan, peternakan, perikanan, industri manufaktur, pertambangan, energi, dan konstruksi.",
    sample: "Ubinan, KSA Padi, IMK, IBS, SITASI, LPTB, Perkebunan, SKTR, Minerba, SBR",
  },
  distribusi: {
    label: "Statistik Distribusi",
    desc: "Mengelola Sensus Ekonomi, statistik harga konsumen/produsen, inflasi, pariwisata, perhotelan, logistik maritim, dan lembaga keuangan.",
    sample: "Sensus Ekonomi 2026, SHKK (IKK), Harga Perdesaan, VHTS Hotel, VRES, Simulan",
  },
  nwas: {
    label: "Neraca Wilayah & Analisis Statistik",
    desc: "Mengelola penghitungan Produk Domestik Regional Bruto (PDRB) lapangan usaha, neraca pengeluaran, transaksi input-output, dan analisis indikator makro daerah.",
    sample: "SKLNPT, SKTNP, Survei Perguruan Tinggi, SKNP",
  },
};

export default async function HomePage() {
  const [stats, kegiatanAktif] = await Promise.all([getStats(), getKegiatanBerjalan()]);

  return (
    <div className="space-y-12">
      {/* ── 1. INSTITUTIONAL HEADER BRIEFING ── */}
      <section className="border-b border-slate-800/80 pb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2">
          <span>PORTAL RESMI SATU DATA BPS</span>
          <span>•</span>
          <span>TAHUN ANGGARAN 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Badan Pusat Statistik Kabupaten Kepulauan Sula
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Pusat dokumentasi terpadu seluruh kegiatan statistik, standar metadata sektoral, instrumen kuesioner,
          jadwal operasional lapangan, dan repositori arsip data lintas tahun.
        </p>

        {/* Text-based Executive Status Line */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3">
          <div>
            <span className="text-slate-500">Total Kegiatan:</span>{" "}
            <span className="font-semibold text-white">{stats?.total_kegiatan ?? 54} Survei/Sensus</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div>
            <span className="text-slate-500">Sedang Berjalan di Lapangan:</span>{" "}
            <span className="font-semibold text-emerald-400">{stats?.kegiatan_aktif ?? 4} Kegiatan</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div>
            <span className="text-slate-500">Telah Selesai:</span>{" "}
            <span className="font-semibold text-sky-400">{stats?.kegiatan_selesai ?? 18} Kegiatan</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div>
            <span className="text-slate-500">Petugas Terdaftar:</span>{" "}
            <span className="font-semibold text-slate-200">{stats?.total_petugas_aktif ?? 9} Koordinator/Pengawas</span>
          </div>
        </div>
      </section>

      {/* ── 2. FOKUS OPERASIONAL BULAN INI (STRUCTURED LEDGER) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Fokus Operasional Bulan Ini
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kegiatan statistik yang sedang dalam tahap pencacahan lapangan atau pengolahan data
            </p>
          </div>
          <Link
            href="/kegiatan?status=berjalan"
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
          >
            Lihat semua kegiatan aktif <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {kegiatanAktif.length > 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Nama Kegiatan</th>
                    <th className="px-4 py-3">Tim Penanggung Jawab</th>
                    <th className="px-4 py-3">Target Sampel</th>
                    <th className="px-4 py-3">Realisasi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {kegiatanAktif.map((k) => {
                    const persen = k.target_sampel > 0 ? Math.round((k.realisasi_akhir / k.target_sampel) * 100) : 0;
                    return (
                      <tr key={k.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                          {k.kode_kegiatan}
                        </td>
                        <td className="px-4 py-3 font-medium text-white max-w-xs truncate">
                          {k.nama_kegiatan}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-300">{k.tim?.nama ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {k.target_sampel > 0 ? k.target_sampel.toLocaleString("id-ID") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {k.target_sampel > 0 ? (
                            <span className="font-mono text-slate-200">
                              {k.realisasi_akhir.toLocaleString("id-ID")} ({persen}%)
                            </span>
                          ) : (
                            <span className="text-slate-500">Tahap Persiapan</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/kegiatan/${k.id}`}
                            className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
                          >
                            Buka Dokumentasi <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
            Tidak ada survei lapangan yang sedang aktif saat ini.
          </div>
        )}
      </section>

      {/* ── 3. EMPAT PILAR TIM STATISTIK (INSTITUTIONAL DIRECTORY) ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Empat Pilar Tim Statistik BPS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Struktur pengorganisasian kegiatan statistik berdasarkan tugas dan fungsi teknis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(TIM_DESCRIPTIONS).map(([kode, info]) => {
            const count = stats?.per_tim.find((t) => t.kode === kode)?.jumlah_kegiatan ?? 0;
            return (
              <div
                key={kode}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      {info.label}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {count} Kegiatan
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {info.desc}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    <span className="text-slate-400 font-medium">Survei Utama:</span> {info.sample}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <Link
                    href={`/tim/${kode}`}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1 group"
                  >
                    Buka Direktori & Katalog Tim {info.label}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. AGENDA & TENGGAT WAKTU OPERASIONAL (30 HARI KE DEPAN) ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Agenda & Kalender Operasional 30 Hari Mendatang
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tenggat waktu batas akhir pencacahan lapangan, upload data, dan jadwal rilis publikasi
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 divide-y divide-slate-800/60">
          <div className="py-2.5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Batas Akhir Pencacahan Lapangan SAKERNAS Agustus 2026
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tim Statistik Sosial • Seluruh Petugas PCL/PML wajib menyelesaikan entri CAPI
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 flex-shrink-0">20 Agu 2026</span>
          </div>

          <div className="py-2.5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Batas Akhir Approval Dokumen FASIH Sensus Ekonomi 2026
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tim Statistik Distribusi • Validasi dan verifikasi dokumen UMB & UMK
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 flex-shrink-0">25 Agu 2026</span>
          </div>

          <div className="py-2.5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Rilis Berita Resmi Statistik (BRS) Inflasi, Pariwisata, dan Nilai Tukar Petani
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Diseminasi Resmi BPS • Konferensi pers rilis data bulanan
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 flex-shrink-0">01 Sep 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
}

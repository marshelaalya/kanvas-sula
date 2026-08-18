import Link from "next/link";
import { FileCheck, BookOpen, Layers, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";

export default function MetadataStandardsPage() {
  const metadataPillars = [
    {
      code: "MS-KEG",
      title: "Metadata Kegiatan Statistik",
      desc: "Mendokumentasikan latar belakang, dasar hukum, tujuan, unit sampel, metode sampling, cakupan wilayah, dan jadwal pelaksanaan seluruh survei/sensus.",
      standar: "Perka BPS No. 4 Tahun 2019 / Satu Data Indonesia",
    },
    {
      code: "MS-VAR",
      title: "Metadata Variabel Statistik",
      desc: "Kamus baku seluruh variabel pengamatan (nama variabel, alias teknis, tipe data, aturan validasi logika, dan batasan nilai kewajaran).",
      standar: "Standar Data Statistik Nasional (SDSN)",
    },
    {
      code: "MS-IND",
      title: "Metadata Indikator Statistik",
      desc: "Spesifikasi metodologis rumus matematis, sumber data pembilang/penyebut, interpretasi, dan satuan ukuran indikator makro pembangunan.",
      standar: "Target SDGs & Indikator RPJMN / RPJMD",
    },
  ];

  const classifications = [
    {
      code: "KBLI 2020",
      title: "Klasifikasi Baku Lapangan Usaha Indonesia",
      desc: "Standardisasi 21 kategori dan 1.700+ sub-golongan lapangan usaha ekonomi untuk survei industri, perdagangan, dan sensus ekonomi.",
    },
    {
      code: "KBJI 2014",
      title: "Klasifikasi Baku Jabatan Indonesia",
      desc: "Standardisasi profesi dan jenis pekerjaan tenaga kerja untuk Survei Angkatan Kerja Nasional (SAKERNAS).",
    },
    {
      code: "COICOP 2018",
      title: "Classification of Individual Consumption According to Purpose",
      desc: "Standardisasi kelompok pengeluaran konsumsi rumah tangga untuk SUSENAS, SERUTI, dan penghitungan inflasi IHK.",
    },
    {
      code: "WILKERSTAT",
      title: "Master Wilayah Kerja Statistik",
      desc: "Standardisasi kode spasial provinsi, kabupaten/kota, kecamatan, desa/kelurahan, dan blok sensus se-Indonesia.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* ── HEADER ── */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2">
          <span>STANDAR DATA STATISTIK NASIONAL</span>
          <span>•</span>
          <span>SATU DATA INDONESIA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Standar Metadata & Klasifikasi Statistik
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Rujukan tunggal prinsip interoperabilitas data, format metadata kegiatan (MS-Keg),
          kamus variabel, dan buku klasifikasi baku yang digunakan di seluruh unit BPS.
        </p>
      </div>

      {/* ── METADATA PILLARS ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Tiga Dimensi Metadata Statistik BPS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Struktur dokumentasi standar sesuai Perpres No. 39 Tahun 2019 tentang Satu Data Indonesia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metadataPillars.map((p) => (
            <div key={p.code} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 border border-sky-800/80 px-2 py-0.5 rounded">
                  {p.code}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">
                {p.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {p.desc}
              </p>
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <strong className="text-slate-400">Dasar Standar:</strong> {p.standar}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLASSIFICATIONS ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Klasifikasi Baku Statistik Nasional
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buku pedoman standardisasi pengkodean lapangan usaha, jabatan, komoditas, dan wilayah
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800/60">
          {classifications.map((c) => (
            <div key={c.code} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <h3 className="text-sm font-semibold text-white">
                    {c.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {c.desc}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/kegiatan"
                  className="text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 font-medium"
                >
                  Lihat Survei Terkait <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

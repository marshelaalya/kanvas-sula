import Link from "next/link";
import { ArrowRight, Layers, BookOpen, Users, TrendingUp } from "lucide-react";
import { metaApi } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getStats(): Promise<DashboardStats | null> {
  try {
    return await metaApi.dashboardStats();
  } catch {
    return null;
  }
}

const TIM_DETAILS = [
  {
    kode: "sosial",
    nama: "Statistik Sosial",
    fokus: "Kesejahteraan Rakyat, Ketenagakerjaan, Kemiskinan, Pendidikan & Kesehatan",
    tupoksi: "Bertanggung jawab atas pengumpulan, pengolahan, analisis, dan diseminasi data statistik demografi, ketenagakerjaan, kemiskinan makro, ketimpangan (Gini Ratio), dan ketahanan sosial perdesaan.",
    indikatorUtama: ["Kemiskinan Makro (P0/P1/P2)", "Tingkat Pengangguran Terbuka (TPT)", "Gini Ratio", "Indeks Pembangunan Manusia (IPM)", "Potensi Desa (IKG)"],
  },
  {
    kode: "produksi",
    nama: "Statistik Produksi",
    fokus: "Pertanian, Industri Manufaktur, Pertambangan, Energi, Kehutanan & Konstruksi",
    tupoksi: "Menyelenggarakan pendataan sektor riil produksi primer dan sekunder: tanaman pangan (Ubinan, KSA), hortikultura, perkebunan, peternakan, perikanan, industri mikro kecil (IMK), industri besar sedang (IBS), minerba, dan jasa konstruksi.",
    indikatorUtama: ["Produksi Padi & Beras Nasional", "Indeks Produksi Manufaktur (IBS/IMK)", "Nilai Tukar Petani (NTP)", "Produksi Kelapa Sawit/CPO", "Populasi Ternak"],
  },
  {
    kode: "distribusi",
    nama: "Statistik Distribusi",
    fokus: "Sensus Ekonomi, Statistik Harga & Inflasi, Pariwisata, Transportasi & Keuangan",
    tupoksi: "Mengelola pendataan sektor tersier dan peredaran barang/jasa: Sensus Ekonomi sepuluh tahunan, pemantauan Indeks Harga Konsumen (IHK/Inflasi), Indeks Kemahalan Konstruksi (IKK), pariwisata perhotelan (TPK), logistik pelabuhan, dan lembaga keuangan.",
    indikatorUtama: ["Laju Inflasi Bulanan (IHK)", "Indeks Kemahalan Konstruksi (IKK)", "Tingkat Penghunian Kamar Hotel (TPK)", "Kunjungan Wisatawan (Wisnus/Wisman)", "Arus Logistik Pelabuhan"],
  },
  {
    kode: "nwas",
    nama: "Neraca Wilayah & Analisis Statistik",
    fokus: "PDRB Lapangan Usaha, PDRB Pengeluaran, Input-Output & Analisis Makro",
    tupoksi: "Mengintegrasikan seluruh data statistik sektoral menjadi neraca ekonomi makro daerah (PDRB Lapangan Usaha dan PDRB Pengeluaran), Tabel Input-Output regional, serta analisis komparatif indikator strategis daerah.",
    indikatorUtama: ["Pertumbuhan Ekonomi Daerah (PDRB)", "PDRB Per Kapita", "Struktur Pembentukan Modal (PMTB)", "Konsumsi Rumah Tangga (PK-RT)", "Konsumsi Lembaga Nirlaba (PK-LNPRT)"],
  },
];

export default async function TimDirectoryPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2">
          <span>STRUKTUR ORGANISASI TEKNIS</span>
          <span>•</span>
          <span>BPS KABUPATEN KEPULAUAN SULA</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Direktori Empat Pilar Tim Statistik
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Seluruh kegiatan statistik BPS diorganisasikan ke dalam empat tim fungsi teknis utama.
          Pilih salah satu tim untuk meninjau tugas pokok, indikator strategis, dan katalog lengkap survei yang dinaungi.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="space-y-4">
        {TIM_DETAILS.map((tim) => {
          const count = stats?.per_tim.find((t) => t.kode === tim.kode)?.jumlah_kegiatan ?? 0;
          return (
            <div
              key={tim.kode}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-sky-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">
                        Tim {tim.nama}
                      </h2>
                      <p className="text-xs text-sky-400 font-medium">{tim.fokus}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-3 mb-4">
                    {tim.tupoksi}
                  </p>

                  {/* Strategic Indicators Tags */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Indikator Strategis Utama yang Dihasilkan:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tim.indikatorUtama.map((ind) => (
                        <span
                          key={ind}
                          className="text-[11px] bg-slate-800/90 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="lg:text-right flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-slate-800/80 pt-3 lg:pt-0">
                  <div className="text-xs text-slate-400 mb-3">
                    <span className="font-mono font-bold text-white text-base">{count}</span> Kegiatan Terdaftar
                  </div>
                  <Link
                    href={`/tim/${tim.kode}`}
                    className="text-xs font-medium text-white bg-slate-800 hover:bg-sky-600 px-4 py-2 rounded-lg border border-slate-700 hover:border-sky-500 transition-all inline-flex items-center gap-1.5"
                  >
                    Buka Direktori Tim <ArrowRight className="w-3.5 h-3.5" />
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

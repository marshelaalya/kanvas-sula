import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Layers, FileText, CheckCircle2, Clock, Calendar } from "lucide-react";
import { metaApi, kegiatanApi } from "@/lib/api";
import type { KegiatanRingkas, Tim } from "@/lib/types";

export const dynamic = "force-dynamic";

const TEAM_PROFILES: Record<string, {
  nama: string;
  unit: string;
  fokus: string;
  deskripsi: string;
  tugasPokok: string[];
  indikatorKunci: string[];
}> = {
  sosial: {
    nama: "Statistik Sosial",
    unit: "Tim Kerja Statistik Kesejahteraan Rakyat dan Ketahanan Sosial",
    fokus: "Kependudukan, Ketenagakerjaan, Kemiskinan, Pendidikan & Kesehatan",
    deskripsi: "Tim Statistik Sosial bertugas mengumpulkan, mengolah, dan menyajikan data statistik yang berkaitan langsung dengan taraf hidup dan kesejahteraan manusia. Data dari tim ini menjadi rujukan tunggal pemerintah dalam penetapan garis kemiskinan makro, penyaluran perlindungan sosial, dan evaluasi pembangunan manusia (IPM).",
    tugasPokok: [
      "Penyelenggaraan Survei Sosial Ekonomi Nasional (Susenas) semesteran",
      "Penyelenggaraan Survei Angkatan Kerja Nasional (Sakernas) untuk indikator pengangguran dan upah",
      "Pencatatan statistik potensi infrastruktur desa melalui Pendataan Potensi Desa (Podes)",
      "Pembinaan penyelenggaraan statistik sektoral melalui Program Desa Cinta Statistik (Desa Cantik)",
    ],
    indikatorKunci: [
      "Persentase Penduduk Miskin (P0)",
      "Garis Kemiskinan (GK Makanan & Non-Makanan)",
      "Tingkat Pengangguran Terbuka (TPT)",
      "Tingkat Partisipasi Angkatan Kerja (TPAK)",
      "Indeks Pembangunan Manusia (IPM)",
      "Rasio Gini (Gini Ratio)",
    ],
  },
  produksi: {
    nama: "Statistik Produksi",
    unit: "Tim Kerja Statistik Produksi (Pertanian, Industri, Tambang & Konstruksi)",
    fokus: "Pertanian, Industri Manufaktur, Pertambangan, Energi & Konstruksi",
    deskripsi: "Tim Statistik Produksi bertanggung jawab atas pendataan seluruh sektor riil penghasil komoditas fisik di daerah. Ruang lingkup mencakup tanaman pangan strategis, perkebunan, peternakan, perikanan laut/budidaya, kehutanan, pabrik manufaktur besar/sedang/kecil, pertambangan minerba, dan jasa konstruksi.",
    tugasPokok: [
      "Pengukuran produktivitas panen padi dan palawija secara objektif (Survei Ubinan)",
      "Estimasi luas panen dan potensi panen padi berbasis satelit (Kerangka Sampel Area / KSA)",
      "Pemantauan indeks produksi industri manufaktur mikro, kecil, sedang, dan besar (IMK/IBS)",
      "Pendataan populasi ternak, pemotongan hewan (LTP RPH), dan produksi perikanan (SITASI)",
      "Survei profil perusahaan pertambangan mineral batubara, penggalian kuari, dan konstruksi",
    ],
    indikatorKunci: [
      "Produktivitas Padi (Kuintal/Ha)",
      "Estimasi Luas Panen & Produksi Beras",
      "Pertumbuhan Indeks Produksi Manufaktur",
      "Nilai Tukar Petani (NTP)",
      "Volume Produksi Perikanan Tangkap & Budidaya",
      "Nilai Tambah Sektor Konstruksi & Minerba",
    ],
  },
  distribusi: {
    nama: "Statistik Distribusi",
    unit: "Tim Kerja Statistik Distribusi dan Jasa (Harga, Pariwisata, Logistik)",
    fokus: "Sensus Ekonomi, Harga & Inflasi, Pariwisata, Transportasi & Keuangan",
    deskripsi: "Tim Statistik Distribusi mengelola statistik sektor peredaran barang, jasa, dan keuangan. Mencakup pemantauan harga konsumen untuk angka inflasi resmi (IHK), harga produsen perdesaan/perkotaan, Indeks Kemahalan Konstruksi (IKK), industri pariwisata perhotelan, logistik pelabuhan, serta pelaksanaan Sensus Ekonomi sepuluh tahunan.",
    tugasPokok: [
      "Pelaksanaan Sensus Ekonomi (SE) sepuluh tahunan seluruh usaha non-pertanian",
      "Pencatatan harga bahan pokok harian/mingguan dan harga konsumen perdesaan (HD/HKD)",
      "Penyusunan Indeks Kemahalan Konstruksi (IKK) untuk formula alokasi Dana Alokasi Umum (DAU)",
      "Pemantauan Tingkat Penghunian Kamar (TPK) hotel dan profil wisatawan nusantara (Wisnus)",
      "Pencatatan arus logistik kapal, penumpang, dan kargo pelabuhan (Simulan)",
    ],
    indikatorKunci: [
      "Laju Inflasi Bulanan (m-to-m dan y-on-y)",
      "Indeks Kemahalan Konstruksi (IKK)",
      "Tingkat Penghunian Kamar Hotel (TPK)",
      "Rata-rata Lama Menginap Tamu Hotel (RLMT)",
      "Indeks Harga Perdagangan Besar (IHPB)",
      "Arus Bongkar Muat Barang Pelabuhan",
    ],
  },
  nwas: {
    nama: "Neraca Wilayah & Analisis Statistik",
    unit: "Tim Kerja Neraca Wilayah dan Analisis Statistik (NWAS)",
    fokus: "PDRB Lapangan Usaha, PDRB Pengeluaran, Input-Output & Analisis Makro",
    deskripsi: "Tim NWAS bertindak sebagai integrator seluruh statistik sektoral ke dalam kerangka Neraca Nasional terstandar. Menghitung Produk Domestik Regional Bruto (PDRB) atas dasar harga berlaku dan konstan, Tabel Input-Output, struktur pembentukan modal (investasi), dan neraca pengeluaran konsumsi.",
    tugasPokok: [
      "Penghitungan PDRB Lapangan Usaha (17 Sektor) Triwulanan dan Sananan",
      "Penghitungan PDRB Pengeluaran (Konsumsi Rumah Tangga, PMTB, Pemerintah, Ekspor-Impor)",
      "Survei Khusus Lembaga Non-Profit yang Melayani Rumah Tangga (SKLNPT)",
      "Survei Khusus Transaksi Neraca Produksi (SKTNP) untuk pembaharuan koefisien input-output",
      "Penyusunan analisis indikator makro dan publikasi Analisis Statistik Terpadu",
    ],
    indikatorKunci: [
      "Laju Pertumbuhan Ekonomi Daerah (PDRB Riil)",
      "PDRB Per Kapita",
      "Struktur Pembentukan Modal Tetap Bruto (PMTB)",
      "Rasio Konsumsi Rumah Tangga terhadap PDRB",
      "Tabel Input-Output Regional",
    ],
  },
};

export default async function SingleTeamPage({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  const profile = TEAM_PROFILES[kode.toLowerCase()];

  if (!profile) {
    notFound();
  }

  // Fetch activities under this team
  let items: KegiatanRingkas[] = [];
  try {
    const timList = await metaApi.tim();
    const matchedTim = timList.find((t) => t.kode.toLowerCase() === kode.toLowerCase());
    if (matchedTim) {
      const res = await kegiatanApi.list({ tim_id: matchedTim.id, per_page: 60 });
      items = res.items;
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="space-y-10">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="border-b border-slate-800/80 pb-6">
        <Link
          href="/tim"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Direktori Empat Pilar Tim
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1.5">
          <span>PILAR TIM TEKNIS</span>
          <span>•</span>
          <span>BPS KABUPATEN KEPULAUAN SULA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Tim {profile.nama}
        </h1>
        <p className="text-xs text-sky-400 font-medium mt-1">
          {profile.unit}
        </p>
        <p className="text-xs text-slate-300 mt-3 max-w-4xl leading-relaxed">
          {profile.deskripsi}
        </p>
      </div>

      {/* ── TUGAS POKOK & INDIKATOR KUNCI ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tugas Pokok */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            Tugas Pokok & Ruang Lingkup:
          </h2>
          <ul className="space-y-2 text-xs text-slate-400">
            {profile.tugasPokok.map((tugas, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-sky-500 font-mono mt-0.5">•</span>
                <span className="leading-relaxed">{tugas}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Indikator Kunci */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Indikator Strategis yang Dihasilkan:
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.indikatorKunci.map((ind) => (
              <span
                key={ind}
                className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700/60 px-2.5 py-1 rounded-md"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── KATALOG KEGIATAN DALAM TIM ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Katalog Kegiatan Statistik ({items.length} Kegiatan Terdaftar)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh survei, sensus, dan pendataan administratif yang dinaungi oleh Tim {profile.nama}
            </p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800/60 overflow-hidden">
            {items.map((k) => (
              <div
                key={k.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {k.kode_kegiatan}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                      {k.jenis}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400">
                      Platform: {k.platform.toUpperCase()}
                    </span>
                  </div>

                  <Link
                    href={`/kegiatan/${k.id}`}
                    className="text-sm font-semibold text-white hover:text-sky-400 transition-colors block"
                  >
                    {k.nama_kegiatan}
                  </Link>

                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                    {k.target_sampel > 0 && (
                      <span>Target: {k.target_sampel.toLocaleString("id-ID")} Sampel</span>
                    )}
                    {k.total_petugas > 0 && (
                      <span>Petugas: {k.total_petugas} Orang</span>
                    )}
                    <span className="capitalize">Status: {k.status}</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Link
                    href={`/kegiatan/${k.id}`}
                    className="text-xs font-medium text-sky-400 hover:text-white bg-slate-800/80 hover:bg-sky-600 px-3.5 py-2 rounded-lg border border-slate-700 hover:border-sky-500 transition-all inline-flex items-center gap-1"
                  >
                    Dokumentasi & Metadata <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
            Belum ada kegiatan statistik terdaftar untuk tim ini.
          </div>
        )}
      </section>
    </div>
  );
}

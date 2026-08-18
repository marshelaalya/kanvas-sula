"""
STATIVA — Master Seed Data (54 Kegiatan Statistik BPS Lengkap)
Mengisi database dengan:
1. 4 Tim Utama BPS (Sosial, Produksi, Distribusi, NWAS)
2. Master Tahun (2022 - 2026)
3. Pegawai & Penanggung Jawab Tim
4. 54 Master Kegiatan Statistik BPS Lengkap beserta metadata, tujuan, metodologi, dan timeline fase.
"""
import os
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.models import (
    Tim, Tahun, Pegawai, KegiatanStatistik, PeriodeKegiatan,
    JenisKegiatan, StatusKegiatan, PlatformKegiatan,
    JabatanPetugas, StatusFase, StatusTahun
)


def seed_master():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("🌱 [STATIVA] Memulai pengisian Master Metadata Statistik BPS...")

        # ─── 1. TIM TEKNIS BPS ────────────────────────────────────────────────
        tim_data = [
            {"kode": "sosial",    "nama": "Statistik Sosial",                     "kepala_tim": "Koordinator Tim Statistik Sosial", "warna": "#3b82f6"},
            {"kode": "produksi",  "nama": "Statistik Produksi",                   "kepala_tim": "Koordinator Tim Statistik Produksi", "warna": "#16a34a"},
            {"kode": "distribusi","nama": "Statistik Distribusi",                 "kepala_tim": "Koordinator Tim Statistik Distribusi", "warna": "#ea580c"},
            {"kode": "nwas",      "nama": "Neraca Wilayah & Analisis Statistik",   "kepala_tim": "Koordinator Tim NWAS", "warna": "#8b5cf6"},
        ]
        tim_map = {}
        for td in tim_data:
            existing = db.query(Tim).filter(Tim.kode == td["kode"]).first()
            if not existing:
                t = Tim(**td)
                db.add(t)
                db.flush()
                tim_map[td["kode"]] = t
            else:
                existing.nama = td["nama"]
                existing.warna = td["warna"]
                tim_map[td["kode"]] = existing

        # ─── 2. TAHUN ANGGARAN ────────────────────────────────────────────────
        tahun_data = [2022, 2023, 2024, 2025, 2026]
        tahun_map = {}
        for y in tahun_data:
            existing = db.query(Tahun).filter(Tahun.tahun == y).first()
            if not existing:
                status = StatusTahun.aktif if y >= 2026 else StatusTahun.arsip
                t = Tahun(tahun=y, status=status)
                db.add(t)
                db.flush()
                tahun_map[y] = t
            else:
                tahun_map[y] = existing

        db.commit()
        for k in list(tim_map):
            db.refresh(tim_map[k])
        for k in list(tahun_map):
            db.refresh(tahun_map[k])

        # ─── 3. PEGAWAI CONTOH ────────────────────────────────────────────────
        pegawai_data = [
            {"nama": "Kepala BPS Kabupaten",        "email": "kepala.kepulauansula@bps.go.id",      "jabatan": JabatanPetugas.kepala,      "is_mitra": False},
            {"nama": "Koordinator Statistik Sosial", "email": "koor.sosial@bps.go.id",         "jabatan": JabatanPetugas.koordinator, "is_mitra": False},
            {"nama": "Koordinator Statistik Produksi","email": "koor.produksi@bps.go.id",       "jabatan": JabatanPetugas.koordinator, "is_mitra": False},
            {"nama": "Koordinator Statistik Distribusi","email": "koor.distribusi@bps.go.id",   "jabatan": JabatanPetugas.koordinator, "is_mitra": False},
            {"nama": "Koordinator NWAS",            "email": "koor.nwas@bps.go.id",            "jabatan": JabatanPetugas.koordinator, "is_mitra": False},
        ]
        pegawai_map = {}
        for pd_data in pegawai_data:
            existing = db.query(Pegawai).filter(Pegawai.email == pd_data["email"]).first()
            if not existing:
                p = Pegawai(**pd_data)
                db.add(p)
                db.flush()
                pegawai_map[pd_data["email"]] = p
            else:
                pegawai_map[pd_data["email"]] = existing

        db.commit()

        # ─── 4. MASTER 54 KEGIATAN STATISTIK BPS ──────────────────────────────
        all_kegiatan = [
            # ── 1. STATISTIK SOSIAL ──
            {
                "kode": "SOS-SUSENAS",
                "nama": "Survei Sosial Ekonomi Nasional (SUSENAS)",
                "tim": "sosial",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 480, "realisasi": 480, "petugas": 24,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 3, 1), "tgl_selesai": date(2026, 3, 31),
                "deskripsi": "Survei rumah tangga representatif untuk mengukur indikator kemiskinan makro, rasio gini, pola konsumsi kalori, dan akses fasilitas dasar.",
                "tujuan": "Menyediakan data pokok kondisi sosial ekonomi masyarakat, angka kemiskinan makro, dan indikator SDGs.",
                "metodologi": "Two-Stage Stratified Sampling blok sensus dengan wawancara langsung CAPI FASIH.",
                "cakupan": "Seluruh Kecamatan di Kabupaten/Kota"
            },
            {
                "kode": "SOS-SAKERNAS",
                "nama": "Survei Angkatan Kerja Nasional (SAKERNAS)",
                "tim": "sosial",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 325, "realisasi": 234, "petugas": 18,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 20),
                "deskripsi": "Survei ketenagakerjaan berkesinambungan untuk memantau TPAK, tingkat pengangguran terbuka (TPT), dan upah pekerja formal/informal.",
                "tujuan": "Menghasilkan indikator ketenagakerjaan daerah dan struktur serapan lapangan usaha (KBLI/KBJI).",
                "metodologi": "Pencacahan sampel rumah tangga penduduk usia 15 tahun ke atas.",
                "cakupan": "Seluruh Kecamatan di Kabupaten/Kota"
            },
            {
                "kode": "SOS-SERUTI",
                "nama": "Survei Ekonomi Rumah Tangga Triwulanan (SERUTI)",
                "tim": "sosial",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.perencanaan,
                "target": 120, "realisasi": 0, "petugas": 8,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 9, 1), "tgl_selesai": date(2026, 9, 30),
                "deskripsi": "Survei pencatatan struktur pendapatan, tabungan, investasi, dan neraca keuangan rumah tangga secara kontinu.",
                "tujuan": "Menyediakan data neraca rumah tangga dan marginal propensity to consume kuartalan.",
                "metodologi": "Subsampel rumah tangga SUSENAS dengan buku catatan harian keuangan.",
                "cakupan": "Kecamatan Sampel Terpilih"
            },
            {
                "kode": "SOS-PODES",
                "nama": "Pendataan Potensi Desa (PODES)",
                "tim": "sosial",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.diarsipkan,
                "target": 167, "realisasi": 167, "petugas": 30,
                "platform": PlatformKegiatan.capi,
                "tgl_mulai": date(2024, 5, 1), "tgl_selesai": date(2024, 5, 31),
                "deskripsi": "Pendataan sensus seluruh desa/kelurahan untuk mengukur ketersediaan infrastruktur dasar, fasilitas publik, dan kerawanan bencana.",
                "tujuan": "Menghasilkan Indeks Kesulitan Geografis (IKG) dan klasifikasi status kemajuan desa untuk alokasi Dana Desa.",
                "metodologi": "Sensus lengkap wawancara kepada aparat desa dan geotagging kantor desa.",
                "cakupan": "100% Desa/Kelurahan di Kabupaten"
            },
            {
                "kode": "SOS-POLKAM",
                "nama": "Statistik Politik dan Keamanan (Polkam)",
                "tim": "sosial",
                "jenis": JenisKegiatan.lainnya,
                "status": StatusKegiatan.selesai,
                "target": 15, "realisasi": 15, "petugas": 4,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 4, 1), "tgl_selesai": date(2026, 4, 30),
                "deskripsi": "Pengumpulan data kriminalitas, penegakan hukum dari instansi kepolisian/pengadilan, dan penyusunan Indeks Demokrasi Indonesia (IDI).",
                "tujuan": "Menyediakan indikator Crime Rate, Crime Clearance Rate, dan kapasitas lembaga demokrasi daerah.",
                "metodologi": "Kompilasi laporan administrasi sekunder dan Focus Group Discussion (FGD) ahli.",
                "cakupan": "Polres, Pengadilan Negeri, Bakesbangpol, DPRD"
            },
            {
                "kode": "SOS-DESACANTIK",
                "nama": "Program Pembinaan Desa Cinta Statistik (Desa Cantik)",
                "tim": "sosial",
                "jenis": JenisKegiatan.lainnya,
                "status": StatusKegiatan.berjalan,
                "target": 3, "realisasi": 2, "petugas": 6,
                "platform": PlatformKegiatan.lainnya,
                "tgl_mulai": date(2026, 5, 1), "tgl_selesai": date(2026, 11, 30),
                "deskripsi": "Program pembinaan literasi dan standardisasi tata kelola data statistik sektoral pada aparatur pemerintah desa.",
                "tujuan": "Meningkatkan kapabilitas aparat desa dalam mengelola data monografi desa berbasis Satu Data Indonesia.",
                "metodologi": "Pendampingan teknis berkelanjutan dan penyusunan portal profil statistik desa.",
                "cakupan": "Desa Percontohan Terpilih"
            },

            # ── 2. NERACA WILAYAH & ANALISIS STATISTIK (NWAS) ──
            {
                "kode": "NWAS-SKLNPT",
                "nama": "Survei Khusus Lembaga Non-Profit (SKLNPT)",
                "tim": "nwas",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 25, "realisasi": 25, "petugas": 4,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 2, 1), "tgl_selesai": date(2026, 3, 15),
                "deskripsi": "Survei profil keuangan dan pengeluaran konsumsi lembaga keagamaan, ormas, yayasan sosial, dan LSM.",
                "tujuan": "Menghitung komponen Pengeluaran Konsumsi LNPRT (PK-LNPRT) dalam PDRB Pengeluaran.",
                "metodologi": "Wawancara pengurus lembaga nirlaba dan pencatatan laporan kas.",
                "cakupan": "Yayasan, Pengurus Tempat Ibadah, dan Ormas Daerah"
            },
            {
                "kode": "NWAS-SKTNP",
                "nama": "Survei Khusus Transaksi Neraca Produksi (SKTNP)",
                "tim": "nwas",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 30, "realisasi": 20, "petugas": 5,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 6, 1), "tgl_selesai": date(2026, 8, 31),
                "deskripsi": "Survei struktur biaya produksi dan rasio konsumsi antara untuk memperbarui koefisien teknis input-output.",
                "tujuan": "Memperbarui rasio Nilai Tambah Bruto (NTB) per kategori lapangan usaha dalam PDRB.",
                "metodologi": "Wawancara mendalam pembukuan keuangan unit usaha sektor prioritas.",
                "cakupan": "Sampel Usaha Sektor Jasa & Perdagangan"
            },
            {
                "kode": "NWAS-PT",
                "nama": "Survei Khusus Perguruan Tinggi",
                "tim": "nwas",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 5, "realisasi": 5, "petugas": 2,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 3, 1), "tgl_selesai": date(2026, 4, 15),
                "deskripsi": "Survei penerimaan SPP/UKT dan realisasi pengeluaran operasional perguruan tinggi negeri/swasta.",
                "tujuan": "Menghitung output lapangan usaha Jasa Pendidikan Tinggi dalam PDRB.",
                "metodologi": "Pendataan laporan keuangan institusi pendidikan tinggi.",
                "cakupan": "Universitas dan Politeknik di Kabupaten"
            },
            {
                "kode": "NWAS-SKNP",
                "nama": "Survei Khusus Neraca Pengeluaran (SKNP)",
                "tim": "nwas",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 20, "realisasi": 14, "petugas": 4,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 9, 30),
                "deskripsi": "Survei pengadaan barang modal fisik dan perubahan stok inventori barang dagangan.",
                "tujuan": "Estimasi laju pertumbuhan Pembentukan Modal Tetap Bruto (PMTB) dan stok barang.",
                "metodologi": "Wawancara distributor mesin, alat angkut niaga, dan kontraktor.",
                "cakupan": "Distributor Barang Modal & Toko Material"
            },

            # ── 3. PRODUKSI - INDUSTRI ──
            {
                "kode": "PROD-IMK-TW",
                "nama": "Survei Industri Mikro dan Kecil Triwulanan (IMK-TW)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 80, "realisasi": 60, "petugas": 10,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 8, 31),
                "deskripsi": "Survei panel kuartalan untuk mengukur pertumbuhan indeks produksi manufaktur skala mikro dan kecil.",
                "tujuan": "Menyediakan early indicator pertumbuhan industri pengolahan UMKM.",
                "metodologi": "Wawancara panel pengusaha industri kecil via CAPI FASIH.",
                "cakupan": "Sentra Industri Rumah Tangga & Kecil"
            },
            {
                "kode": "PROD-IMK-TH",
                "nama": "Survei Industri Mikro dan Kecil Sananan (IMK-Sananan)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.perencanaan,
                "target": 200, "realisasi": 0, "petugas": 16,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 9, 1), "tgl_selesai": date(2026, 11, 30),
                "deskripsi": "Survei tahunan mendalam mengenai struktur input-output, nilai tambah, dan profil digitalisasi industri mikro kecil.",
                "tujuan": "Menghitung Nilai Tambah Bruto dan produktivitas tenaga kerja IMK.",
                "metodologi": "Sampel acak terstratifikasi pengusaha industri manufaktur mikro kecil.",
                "cakupan": "Seluruh Wilayah Kabupaten"
            },
            {
                "kode": "PROD-IBS-TW",
                "nama": "Survei Industri Besar dan Sedang Triwulanan (IBS-TW)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 12, "realisasi": 12, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 8, 20),
                "deskripsi": "Survei panel kuartalan pada pabrik manufaktur 20 tenaga kerja ke atas untuk mengukur indeks produksi fisik.",
                "tujuan": "Mengetahui utilisasi kapasitas pabrik dan laju produksi manufaktur menengah-besar.",
                "metodologi": "Wawancara manajemen pabrik / pengisian kuesioner mandiri FASIH.",
                "cakupan": "Pabrik Industri Pengolahan Sedang & Besar"
            },
            {
                "kode": "PROD-IBS-TH",
                "nama": "Survei Industri Besar dan Sedang Sananan (IBS-Sananan)",
                "tim": "produksi",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.perencanaan,
                "target": 12, "realisasi": 0, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 10, 31),
                "deskripsi": "Pendataan lengkap tahunan struktur keuangan, bahan baku, energi, upah, dan ekspor pabrik manufaktur.",
                "tujuan": "Menyusun neraca input-output industri pengolahan resmi skala besar.",
                "metodologi": "Sensus lengkap seluruh pabrik manufaktur berbadan hukum.",
                "cakupan": "100% Pabrik IBS di Kabupaten"
            },

            # ── 4. PRODUKSI - KEHUTANAN, PETERNAKAN, PERIKANAN ──
            {
                "kode": "PROD-SITASI",
                "nama": "Survei Perikanan Terintegrasi (SITASI)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 45, "realisasi": 32, "petugas": 6,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 6, 1), "tgl_selesai": date(2026, 8, 31),
                "deskripsi": "Survei terintegrasi volume produksi, armada kapal, sarana budidaya, dan nilai ekonomi usaha perikanan.",
                "tujuan": "Menyediakan data volume dan nilai produksi perikanan tangkap laut dan budidaya.",
                "metodologi": "Wawancara pengurus kelompok pembudidaya ikan dan pemilik kapal tangkap.",
                "cakupan": "Kecamatan Pesisir dan Sentra Tambak/KJA"
            },
            {
                "kode": "PROD-LPTB",
                "nama": "Laporan Perusahaan Ternak Besar (LPTB)",
                "tim": "produksi",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.selesai,
                "target": 6, "realisasi": 6, "petugas": 2,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 4, 1), "tgl_selesai": date(2026, 5, 31),
                "deskripsi": "Pendataan populasi ternak, kelahiran, kematian, dan produksi susu/daging pada perusahaan peternakan komersial.",
                "tujuan": "Memantau neraca pasokan daging sapi dan susu segar skala korporasi.",
                "metodologi": "Pendataan lengkap register recording farm peternakan berbadan hukum.",
                "cakupan": "Perusahaan Peternakan Sapi Potong/Perah/Babi"
            },
            {
                "kode": "PROD-LTP",
                "nama": "Laporan Ternak Potong (LTP Triwulanan & Sananan)",
                "tim": "produksi",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.berjalan,
                "target": 4, "realisasi": 4, "petugas": 2,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 7, 15),
                "deskripsi": "Pencatatan jumlah pemotongan hewan ternak dan produksi daging karkas di Rumah Potong Hewan (RPH/TPH).",
                "tujuan": "Mengetahui volume daging riil yang masuk ke pasar konsumsi.",
                "metodologi": "Rekapitulasi buku register pemotongan ternak RPH pemerintah dan swasta.",
                "cakupan": "Seluruh RPH dan TPH Resmi di Kabupaten"
            },
            {
                "kode": "PROD-PPTPI",
                "nama": "Pendataan Tempat Pelelangan Ikan (PP-TPI)",
                "tim": "produksi",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.berjalan,
                "target": 3, "realisasi": 3, "petugas": 2,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 10),
                "deskripsi": "Pencatatan bulanan volume transaksi lelang, jenis komoditas ikan, dan harga lelang tingkat produsen di TPI.",
                "tujuan": "Memantau arus pendaratan ikan dan harga produsen ikan segar.",
                "metodologi": "Rekapitulasi nota lelang UPTD TPI dan koperasi nelayan.",
                "cakupan": "Pangkalan Pendaratan Ikan (PPI) & TPI Aktif"
            },
            {
                "kode": "PROD-PIT",
                "nama": "Pendataan Penangkapan Ikan Terukur (PIT)",
                "tim": "produksi",
                "jenis": JenisKegiatan.lainnya,
                "status": StatusKegiatan.selesai,
                "target": 8, "realisasi": 8, "petugas": 3,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 5, 1), "tgl_selesai": date(2026, 6, 30),
                "deskripsi": "Pendataan realisasi kuota tangkapan armada kapal berizin berdasarkan Wilayah Pengelolaan Perikanan (WPP).",
                "tujuan": "Mendukung tata kelola penangkapan ikan terukur dan PNBP perikanan.",
                "metodologi": "Verifikasi log book elektronik penangkapan kapal perikanan.",
                "cakupan": "Pelabuhan Pangkalan Pendaratan Kapal Tangkap"
            },
            {
                "kode": "PROD-SIUTAN",
                "nama": "Survei Perusahaan Kehutanan (SIUTAN)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 4, "realisasi": 4, "petugas": 2,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 4, 1), "tgl_selesai": date(2026, 5, 31),
                "deskripsi": "Survei perusahaan konsesi hutan untuk mencatat volume tebangan kayu bulat dan hasil hutan bukan kayu (HHBK).",
                "tujuan": "Menghitung produksi kayu bulat dan luas areal reboisasi hutan.",
                "metodologi": "Pendataan kuesioner kepada pemegang izin PBPH/Perhutani.",
                "cakupan": "Perusahaan Pemegang Konsesi Kehutanan"
            },
            {
                "kode": "PROD-SKP-PETANI",
                "nama": "Survei Kesejahteraan Petani Peternakan (SKP)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.perencanaan,
                "target": 50, "realisasi": 0, "petugas": 6,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 10, 1), "tgl_selesai": date(2026, 10, 31),
                "deskripsi": "Survei kelayakan ekonomi, biaya input pakan, dan tingkat pendapatan bersih rumah tangga peternak rakyat.",
                "tujuan": "Menghitung Nilai Tukar Usaha Peternakan (NTUP) dan margin keuntungan ternak.",
                "metodologi": "Wawancara sampel rumah tangga peternak sapi/kambing/unggas.",
                "cakupan": "Sentra Peternakan Rakyat"
            },

            # ── 5. PRODUKSI - TANAMAN PANGAN ──
            {
                "kode": "PROD-UBINAN",
                "nama": "Survei Ubinan Tanaman Pangan (Padi dan Palawija)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 64, "realisasi": 48, "petugas": 12,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 5, 1), "tgl_selesai": date(2026, 8, 31),
                "deskripsi": "Pengukuran riil produktivitas hasil panen di petak sawah 2,5m x 2,5m menggunakan timbangan digital saat panen.",
                "tujuan": "Menghasilkan angka produktivitas (Ku/Ha) resmi padi dan palawija sebagai pengali luas panen.",
                "metodologi": "Pengukuran objektif pemotongan petak ubinan di lahan panen terpilih.",
                "cakupan": "Petak Sawah Sampel di Seluruh Sentra Padi"
            },
            {
                "kode": "PROD-KSA-PADI",
                "nama": "Kerangka Sampel Area Padi dan Jagung (KSA)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 112, "realisasi": 88, "petugas": 14,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 24), "tgl_selesai": date(2026, 8, 31),
                "deskripsi": "Pengamatan berbasis foto geolokasi pada titik subsegmen sawah untuk menghitung luas panen dan potensi panen padi/jagung.",
                "tujuan": "Menghasilkan estimasi luas panen padi bulanan dan proyeksi 3 bulan ke depan secara objektif.",
                "metodologi": "Observasi spasial langsung titik koordinat GPS menggunakan aplikasi Android KSA Mobile.",
                "cakupan": "Seluruh Titik Segmen KSA Sawah Kabupaten"
            },

            # ── 6. PRODUKSI - HORTIKULTURA & PERKEBUNAN ──
            {
                "kode": "PROD-KOMSTRAT",
                "nama": "Survei Indeks Komoditas Strategis Hortikultura",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 20, "realisasi": 20, "petugas": 4,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 15),
                "deskripsi": "Pemantauan luas tanam, panen, dan produksi komoditas pemicu inflasi pangan (cabai merah, cabai rawit, bawang merah).",
                "tujuan": "Early warning ketersediaan pasokan volatile foods untuk aksi Tim Pengendalian Inflasi Daerah (TPID).",
                "metodologi": "Wawancara berkala kelompok tani klaster hortikultura.",
                "cakupan": "Sentra Klaster Cabai dan Bawang Merah"
            },
            {
                "kode": "PROD-PERKEBUNAN",
                "nama": "Survei Perusahaan Perkebunan (SKB Sananan/TW)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 8, "realisasi": 8, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 8, 31),
                "deskripsi": "Survei pada perusahaan perkebunan besar untuk mencatat luas areal HGU, volume panen TBS/CPO, kelapa, dan karet.",
                "tujuan": "Menghitung produksi CPO, kelapa, karet dan produktivitas tanaman perkebunan besar.",
                "metodologi": "Pendataan lengkap perusahaan perkebunan berbadan hukum.",
                "cakupan": "Perusahaan Perkebunan Besar Swasta dan Negara"
            },
            {
                "kode": "PROD-SKGB",
                "nama": "Survei Khusus Gabah dan Beras (SKGB)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 15, "realisasi": 15, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 10),
                "deskripsi": "Pencatatan harga transaksi jual-beli gabah dan beras di tingkat penggilingan beserta uji kadar air dan kadar hampa.",
                "tujuan": "Memantau disparitas harga gabah petani vs pintu penggilingan dan kepatuhan HPP.",
                "metodologi": "Pengukuran kadar air langsung di RMU (Rice Milling Unit) sampel.",
                "cakupan": "Penggilingan Padi Aktif di Kabupaten"
            },

            # ── 7. PRODUKSI - SDM, MINERAL & KONSTRUKSI ──
            {
                "kode": "PROD-SKTR",
                "nama": "Survei Perusahaan Konstruksi Triwulanan (SKTR)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 18, "realisasi": 12, "petugas": 4,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 8, 25),
                "deskripsi": "Survei kuartalan kontraktor untuk memantau indeks kegiatan proyek fisik, nilai pekerjaan, dan upah tukang.",
                "tujuan": "Leading indicator pertumbuhan investasi fisik dan serapan belanja modal infrastruktur.",
                "metodologi": "Wawancara kontraktor kualifikasi menengah dan besar.",
                "cakupan": "Kontraktor Anggota Asosiasi (GAPENSI/AKI)"
            },
            {
                "kode": "PROD-SKTH",
                "nama": "Survei Perusahaan Konstruksi Sananan (SKTH)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.perencanaan,
                "target": 40, "realisasi": 0, "petugas": 6,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 9, 1), "tgl_selesai": date(2026, 11, 30),
                "deskripsi": "Survei tahunan mendalam neraca keuangan, nilai pekerjaan fisik, dan konsumsi material semen/baja kontraktor.",
                "tujuan": "Menghitung Nilai Tambah Bruto sektor konstruksi dan struktur biaya modal fisik.",
                "metodologi": "Pendataan laporan keuangan perusahaan jasa konstruksi.",
                "cakupan": "Badan Usaha Jasa Konstruksi Berizin"
            },
            {
                "kode": "PROD-CAPTIVE",
                "nama": "Survei Pembangkit Listrik Non-PLN (Captive Power)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 10, "realisasi": 10, "petugas": 2,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 4, 1), "tgl_selesai": date(2026, 5, 31),
                "deskripsi": "Survei kapasitas generator genset dan volume listrik yang dibangkitkan mandiri oleh industri/hotel/pabrik.",
                "tujuan": "Menghitung total daya listrik non-PLN dan konsumsi bahan bakar pembangkit.",
                "metodologi": "Wawancara kepala teknisi mesin genset di atas 100 kVA.",
                "cakupan": "Pabrik, Hotel Bintang, dan Rumah Sakit"
            },
            {
                "kode": "PROD-PENGGALIAN",
                "nama": "Survei Usaha Penggalian Bahan Konstruksi (Galian C)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 14, "realisasi": 14, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 5, 1), "tgl_selesai": date(2026, 6, 30),
                "deskripsi": "Survei volume produksi, harga kuari, dan tenaga kerja penambangan pasir, batu kali, tanah urug, dan krikil.",
                "tujuan": "Menghitung nilai output pertambangan galian C dan potensi pajak MBLB.",
                "metodologi": "Wawancara pemilik izin kuari tambang pasir/batu.",
                "cakupan": "Titik Tambang Kuari Galian C Kabupaten"
            },
            {
                "kode": "PROD-MINERBA",
                "nama": "Survei Perusahaan Pertambangan Non Migas",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 4, "realisasi": 4, "petugas": 2,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 8, 31),
                "deskripsi": "Survei korporasi tambang mineral dan batubara untuk mencatat volume ekstraksi ore, pemurnian smelter, dan royalti.",
                "tujuan": "Input krusial PDRB Kategori B Pertambangan dan evaluasi hilirisasi.",
                "metodologi": "Pendataan laporan keuangan dan produksi perusahaan pemegang IUP/KK.",
                "cakupan": "Perusahaan Tambang Mineral Logam & Batubara"
            },
            {
                "kode": "PROD-UDPE",
                "nama": "Updating Direktori Perusahaan Energi (UDPE)",
                "tim": "produksi",
                "jenis": JenisKegiatan.updating,
                "status": StatusKegiatan.selesai,
                "target": 25, "realisasi": 25, "petugas": 3,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 3, 1), "tgl_selesai": date(2026, 4, 30),
                "deskripsi": "Pemutakhiran basis data nama, alamat, dan izin badan usaha sektor energi, SPBU, SPBE, tambang, dan kelistrikan.",
                "tujuan": "Memelihara kerangka sampel induk sektor pertambangan dan energi.",
                "metodologi": "Ground check keberadaan fisik fasilitas energi.",
                "cakupan": "SPBU, Pembangkit Listrik, dan Kantor Tambang"
            },

            # ── 8. PRODUKSI LAINNYA ──
            {
                "kode": "PROD-SBR",
                "nama": "Direktori Perusahaan Terintegrasi (Statistical Business Register / SBR)",
                "tim": "produksi",
                "jenis": JenisKegiatan.updating,
                "status": StatusKegiatan.berjalan,
                "target": 500, "realisasi": 380, "petugas": 15,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 1, 1), "tgl_selesai": date(2026, 12, 31),
                "deskripsi": "Pemutakhiran satu basis data tunggal (Single Source of Truth) seluruh profil unit usaha dan perusahaan.",
                "tujuan": "Membangun Master Sampling Frame seluruh survei ekonomi dan Sensus Ekonomi.",
                "metodologi": "Verifikasi lapangan terintegrasi OSS dan data sensus.",
                "cakupan": "Seluruh Unit Usaha Formal & Non-Formal"
            },
            {
                "kode": "PROD-DIR-TANI",
                "nama": "Direktori Usaha Pertanian Lainnya (UTL & UPB)",
                "tim": "produksi",
                "jenis": JenisKegiatan.updating,
                "status": StatusKegiatan.selesai,
                "target": 60, "realisasi": 60, "petugas": 6,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 4, 1), "tgl_selesai": date(2026, 5, 31),
                "deskripsi": "Pemutakhiran direktori kelompok tani modern, korporasi pertanian berbadan hukum (UPB), dan smart farming.",
                "tujuan": "Kerangka sampel survei pertanian pasca Sensus Pertanian.",
                "metodologi": "Verifikasi lapangan kelembagaan kelompok tani dan farm.",
                "cakupan": "Badan Usaha Pertanian & Kelompok Tani Aktif"
            },
            {
                "kode": "PROD-VN-HORTI",
                "nama": "Survei Varian dan Neraca Hortikultura (VN Horti)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 30, "realisasi": 22, "petugas": 4,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 9, 30),
                "deskripsi": "Survei jumlah pohon menghasilkan dan produksi buah-buahan tahunan (durian, mangga, pisang) dan tanaman obat.",
                "tujuan": "Menyediakan data produksi buah tropis dan tanaman biofarmaka.",
                "metodologi": "Sampling kebun buah komersial dan rekapitulasi dinas.",
                "cakupan": "Sentra Kebun Buah-buahan Daerah"
            },
            {
                "kode": "PROD-VTIRTA",
                "nama": "Survei Perusahaan Air Bersih (V-TIRTA)",
                "tim": "produksi",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.berjalan,
                "target": 2, "realisasi": 2, "petugas": 2,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 8, 15),
                "deskripsi": "Pendataan volume produksi air perpipaan, pelanggan rumah tangga/industri, tarif air, dan kebocoran pipa PDAM.",
                "tujuan": "Menghitung indikator akses air minum perpipaan layak (SDGs Goal 6) dan output PDRB PDAM.",
                "metodologi": "Sensus lengkap seluruh unit PDAM di kabupaten.",
                "cakupan": "Kantor Pusat dan Cabang PDAM Kabupaten"
            },
            {
                "kode": "PROD-SP-PALAWIJA",
                "nama": "Survei Pertanian Tanaman Palawija (SP Palawija)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 15, "realisasi": 15, "petugas": 5,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 10),
                "deskripsi": "Kompilasi bulanan luas tanam, panen, dan puso komoditas kedelai, ubi kayu, ubi jalar, dan kacang tanah.",
                "tujuan": "Menghitung estimasi produksi palawija bersama produktivitas ubinan.",
                "metodologi": "Rekapitulasi laporan mantri tani tingkat kecamatan.",
                "cakupan": "Seluruh Kecamatan Penghasil Palawija"
            },
            {
                "kode": "PROD-SPH",
                "nama": "Survei Pertanian Tanaman Hortikultura (SPH)",
                "tim": "produksi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 15, "realisasi": 15, "petugas": 5,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 10),
                "deskripsi": "Kompilasi bulanan luas panen dan produksi 26+ komoditas sayuran semusim (tomat, kangkung, bayam, kubis).",
                "tujuan": "Menyediakan data volume produksi sayur mayur untuk neraca pangan gizi daerah.",
                "metodologi": "Kompilasi formulir SPH-SBS mantri tani kecamatan.",
                "cakupan": "Seluruh Kecamatan di Kabupaten"
            },

            # ── 9. STATISTIK DISTRIBUSI (2902) ──
            {
                "kode": "DIST-SIMOPEL",
                "nama": "Survei Industri Karoseri dan Modifikasi Otomotif (Simopel)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 5, "realisasi": 5, "petugas": 2,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 4, 1), "tgl_selesai": date(2026, 5, 31),
                "deskripsi": "Survei unit kendaraan niaga yang dikaroseri/dimodifikasi, biaya material plat baja, dan upah mekanik.",
                "tujuan": "Menghitung nilai tambah industri reparasi dan modifikasi transportasi.",
                "metodologi": "Wawancara pengusaha bengkel karoseri truk/bus.",
                "cakupan": "Bengkel Karoseri & Perakitan Kendaraan"
            },
            {
                "kode": "DIST-SIMULAN",
                "nama": "Survei Angkutan Laut dan Pelabuhan (Simulan)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.berjalan,
                "target": 4, "realisasi": 4, "petugas": 2,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 10),
                "deskripsi": "Pencatatan bulanan kunjungan kapal laut, arus penumpang naik/turun, dan volume bongkar muat peti kemas.",
                "tujuan": "Memantau kelancaran logistik maritim antarpulau dan kinerja Tol Laut.",
                "metodologi": "Rekapitulasi warta kapal KSOP, PT Pelindo, dan PT ASDP.",
                "cakupan": "Pelabuhan Laut & Dermaga Penyeberangan"
            },
            {
                "kode": "DIST-VPEG",
                "nama": "Survei Perusahaan Ekspedisi dan Pergudangan (VPEG)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 12, "realisasi": 12, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 5, 1), "tgl_selesai": date(2026, 6, 30),
                "deskripsi": "Survei kapasitas ruang simpan cold storage, omset jasa kurir kilat, dan volume pengiriman paket e-commerce.",
                "tujuan": "Menghitung nilai output sektor pos, kurir, dan pergudangan.",
                "metodologi": "Wawancara kantor agen ekspedisi dan pengelola gudang.",
                "cakupan": "Kantor Ekspedisi Kurir & Gudang Logistik"
            },
            {
                "kode": "DIST-SE2026",
                "nama": "Sensus Ekonomi 2026 (SE2026)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.sensus,
                "status": StatusKegiatan.berjalan,
                "target": 1250, "realisasi": 1124, "petugas": 168,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 8, 31),
                "deskripsi": "Sensus nasional sepuluh tahunan seluruh unit usaha non-pertanian untuk memotret populasi bisnis, omset, dan digitalisasi usaha.",
                "tujuan": "Menghasilkan profil lengkap perekonomian non-pertanian dan kerangka sampel induk 10 tahun ke depan.",
                "metodologi": "Sensus lengkap door-to-door seluruh bangunan tempat usaha via CAPI FASIH SE Mobile.",
                "cakupan": "100% Blok Sensus Seluruh Kabupaten/Kota"
            },

            # ── 10. STATISTIK DISTRIBUSI (2903) ──
            {
                "kode": "DIST-HD",
                "nama": "Survei Harga Produsen Perdesaan (HD)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 35, "realisasi": 35, "petugas": 6,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 10), "tgl_selesai": date(2026, 8, 20),
                "deskripsi": "Pencatatan harga riil yang diterima petani saat menjual hasil panen di desa untuk penyusunan Indeks Diterima Petani (It).",
                "tujuan": "Komponen pembilang rumus Nilai Tukar Petani (NTP = It / Ib * 100).",
                "metodologi": "Wawancara transaksi jual beli petani di desa sampel.",
                "cakupan": "Desa Sampel Perdesaan Terpilih"
            },
            {
                "kode": "DIST-HKD",
                "nama": "Survei Harga Konsumen Perdesaan (HKD)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 40, "realisasi": 40, "petugas": 6,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 10), "tgl_selesai": date(2026, 8, 20),
                "deskripsi": "Survei harga eceran barang konsumsi dan biaya sarana produksi pertanian di warung/kios saprotan pasar desa.",
                "tujuan": "Membentuk Indeks Harga Dibayar Petani (Ib) dan mengukur laju inflasi perdesaan.",
                "metodologi": "Pencatatan harga eceran panel warung desa via CAPI FASIH HKD.",
                "cakupan": "Warung & Kios Saprotan Desa Sampel"
            },
            {
                "kode": "DIST-SHPB",
                "nama": "Survei Harga Perdagangan Besar (SHPB)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 15, "realisasi": 15, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 15),
                "deskripsi": "Pencatatan harga transaksi grosir partai besar di tingkat distributor dan importir untuk menyusun Indeks Harga Perdagangan Besar (IHPB).",
                "tujuan": "Indikator peringatan dini (early warning) tekanan inflasi grosir hulu.",
                "metodologi": "Wawancara bagian penjualan distributor utama partai besar.",
                "cakupan": "Distributor Utama & Agen Grosir Pangan/Industri"
            },
            {
                "kode": "DIST-SH-PRODUSEN",
                "nama": "Survei Harga Produsen Manufaktur & Jasa (IHP)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 12, "realisasi": 12, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 15),
                "deskripsi": "Pencatatan harga jual komoditas langsung di pintu pabrik (ex-factory price) untuk Indeks Harga Produsen (IHP).",
                "tujuan": "Deflator utama untuk menghitung PDRB Atas Dasar Harga Konstan (ADHK).",
                "metodologi": "Pencatatan harga faktur bersih dari diskon dan PPN di pabrik.",
                "cakupan": "Pabrik Industri & Kantor Penyedia Jasa"
            },
            {
                "kode": "DIST-SHKK",
                "nama": "Survei Harga Kemahalan Konstruksi (SHKK / IKK)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 25, "realisasi": 25, "petugas": 4,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 7, 1), "tgl_selesai": date(2026, 8, 15),
                "deskripsi": "Survei harga 100+ material bangunan, sewa alat berat, dan standar upah tukang untuk menghitung Indeks Kemahalan Konstruksi (IKK).",
                "tujuan": "Variabel wajib formula pengalokasian Dana Alokasi Umum (DAU APBN) ke Pemerintah Daerah.",
                "metodologi": "Wawancara toko bangunan besar dan rental alat berat via CAPI FASIH SHKK.",
                "cakupan": "Toko Material & Distributor Semen/Baja Kabupaten"
            },
            {
                "kode": "DIST-SPDT-SBH",
                "nama": "Survei Penyempurnaan Diagram Timbang (Survei Biaya Hidup / SBH)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.diarsipkan,
                "target": 240, "realisasi": 240, "petugas": 18,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2022, 1, 1), "tgl_selesai": date(2022, 12, 31),
                "deskripsi": "Survei pengeluaran rumah tangga harian selama 1 tahun untuk memperbarui paket komoditas dan diagram timbang bobot IHK.",
                "tujuan": "Memperbarui tahun dasar penghitungan laju inflasi resmi BPS.",
                "metodologi": "Pencatatan buku harian (diary book) pengeluaran keluarga sampel.",
                "cakupan": "Kota IHK Pantauan Inflasi"
            },

            # ── 11. STATISTIK DISTRIBUSI (2908) ──
            {
                "kode": "DIST-K3",
                "nama": "Survei Lembaga Keuangan Bukan Bank (K3)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 18, "realisasi": 18, "petugas": 3,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 4, 1), "tgl_selesai": date(2026, 5, 31),
                "deskripsi": "Survei neraca aset, penyaluran kredit mikro, simpanan anggota, dan laba SHU koperasi simpan pinjam dan pegadaian.",
                "tujuan": "Memetakan inklusi keuangan non-bank dan input PDRB Jasa Keuangan.",
                "metodologi": "Wawancara pengurus Koperasi Simpan Pinjam dan Pegadaian.",
                "cakupan": "KSP Aktif, Kantor Cabang Pegadaian, dan LKM"
            },
            {
                "kode": "DIST-BUMD",
                "nama": "Survei Badan Usaha Milik Daerah (BUMD)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.selesai,
                "target": 5, "realisasi": 5, "petugas": 2,
                "platform": PlatformKegiatan.kertas,
                "tgl_mulai": date(2026, 3, 1), "tgl_selesai": date(2026, 4, 30),
                "deskripsi": "Pendataan laporan keuangan audit, laba rugi, modal Pemda, dan kontribusi dividen BUMD ke Pendapatan Asli Daerah (PAD).",
                "tujuan": "Evaluasi kinerja BUMD dan kontribusi terhadap PAD pemerintah daerah.",
                "metodologi": "Pengumpulan laporan keuangan audited dari akuntan publik.",
                "cakupan": "Seluruh BUMD Aneka Usaha & PD Pasar Kabupaten"
            },
            {
                "kode": "DIST-VRES",
                "nama": "Survei Restoran, Rumah Makan, dan Kafe (VRES)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 22, "realisasi": 22, "petugas": 4,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 5, 1), "tgl_selesai": date(2026, 6, 30),
                "deskripsi": "Survei kapasitas tempat duduk, omset penjualan kuliner, biaya bahan baku, dan pemanfaatan platform pesan antar online.",
                "tujuan": "Menghitung nilai output industri kuliner dan potensi pajak restoran PB1.",
                "metodologi": "Wawancara manajer restoran dan kafe via CAPI FASIH VRES.",
                "cakupan": "Restoran, Rumah Makan, dan Kafe Terpilih"
            },
            {
                "kode": "DIST-VHTS",
                "nama": "Survei Akomodasi Hotel Bulanan (VHTS / TPK)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.berjalan,
                "target": 18, "realisasi": 18, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 8, 1), "tgl_selesai": date(2026, 8, 10),
                "deskripsi": "Pencatatan bulanan Tingkat Penghunian Kamar (TPK / Occupancy Rate), tamu domestik/mancanegara, dan lama menginap.",
                "tujuan": "Barometer utama kinerja industri pariwisata daerah bulanan.",
                "metodologi": "Rekapitulasi register buku tamu hotel bintang dan non-bintang.",
                "cakupan": "Hotel Bintang, Melati, dan Penginapan Komersial"
            },
            {
                "kode": "DIST-VHTL",
                "nama": "Survei Profil Akomodasi Sananan (VHTL)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.pendataan,
                "status": StatusKegiatan.perencanaan,
                "target": 18, "realisasi": 0, "petugas": 3,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 9, 1), "tgl_selesai": date(2026, 11, 30),
                "deskripsi": "Survei tahunan struktur pendapatan sewa kamar, MICE/ruang rapat, F&B, dan biaya operasional hotel.",
                "tujuan": "Menghitung Nilai Tambah Bruto sektor perhotelan untuk PDRB Sananan.",
                "metodologi": "Pendataan laporan keuangan tahunan hotel komersial.",
                "cakupan": "100% Hotel dan Wisma di Kabupaten"
            },
            {
                "kode": "DIST-VPBN-RT",
                "nama": "Survei Wisatawan Nusantara Rumah Tangga (VPBN-RT)",
                "tim": "distribusi",
                "jenis": JenisKegiatan.survei,
                "status": StatusKegiatan.selesai,
                "target": 60, "realisasi": 60, "petugas": 6,
                "platform": PlatformKegiatan.fasih,
                "tgl_mulai": date(2026, 4, 1), "tgl_selesai": date(2026, 5, 15),
                "deskripsi": "Survei frekuensi perjalanan wisata domestik keluarga, kota destinasi, dan pola alokasi belanja oleh-oleh/akomodasi.",
                "tujuan": "Mendukung target Gerakan Bangga Berwisata di Indonesia (BBWI) dan Neraca Satelit Pariwisata.",
                "metodologi": "Wawancara sampel rumah tangga mengenai riwayat perjalanan wisata 3 bulan terakhir.",
                "cakupan": "Rumah Tangga Sampel Kabupaten"
            },
        ]

        total_inserted = 0
        total_updated = 0

        for item in all_kegiatan:
            existing = db.query(KegiatanStatistik).filter(
                KegiatanStatistik.kode_kegiatan == item["kode"]
            ).first()

            tim_obj = tim_map[item["tim"]]
            tahun_obj = tahun_map[2026]

            if not existing:
                kg = KegiatanStatistik(
                    kode_kegiatan=item["kode"],
                    nama_kegiatan=item["nama"],
                    jenis=item["jenis"],
                    tim_id=tim_obj.id,
                    tahun_id=tahun_obj.id,
                    status=item["status"],
                    target_sampel=item["target"],
                    realisasi_akhir=item["realisasi"],
                    total_petugas=item["petugas"],
                    deskripsi=item["deskripsi"],
                    tujuan=item["tujuan"],
                    metodologi=item["metodologi"],
                    cakupan_wilayah=item["cakupan"],
                    platform=item["platform"],
                    tanggal_mulai=item["tgl_mulai"],
                    tanggal_selesai=item["tgl_selesai"],
                )
                db.add(kg)
                db.flush()

                # Tambahkan 3 fase standar
                fase1 = PeriodeKegiatan(
                    kegiatan_id=kg.id,
                    nama_fase="Persiapan & Pelatihan Petugas",
                    urutan=0,
                    tanggal_mulai=item["tgl_mulai"],
                    tanggal_selesai=item["tgl_selesai"],
                    status=StatusFase.selesai if item["status"] in [StatusKegiatan.berjalan, StatusKegiatan.selesai] else StatusFase.belum_mulai,
                )
                fase2 = PeriodeKegiatan(
                    kegiatan_id=kg.id,
                    nama_fase="Pencacahan Lapangan / Pengumpulan Data",
                    urutan=1,
                    tanggal_mulai=item["tgl_mulai"],
                    tanggal_selesai=item["tgl_selesai"],
                    status=StatusFase.berjalan if item["status"] == StatusKegiatan.berjalan else (StatusFase.selesai if item["status"] == StatusKegiatan.selesai else StatusFase.belum_mulai),
                )
                fase3 = PeriodeKegiatan(
                    kegiatan_id=kg.id,
                    nama_fase="Pengolahan & Validasi FASIH",
                    urutan=2,
                    tanggal_mulai=item["tgl_selesai"],
                    tanggal_selesai=item["tgl_selesai"],
                    status=StatusFase.selesai if item["status"] == StatusKegiatan.selesai else StatusFase.belum_mulai,
                )
                db.add_all([fase1, fase2, fase3])
                total_inserted += 1
            else:
                existing.nama_kegiatan = item["nama"]
                existing.deskripsi = item["deskripsi"]
                existing.tujuan = item["tujuan"]
                existing.metodologi = item["metodologi"]
                existing.target_sampel = item["target"]
                existing.realisasi_akhir = item["realisasi"]
                existing.total_petugas = item["petugas"]
                existing.status = item["status"]
                existing.platform = item["platform"]
                total_updated += 1

        db.commit()
        print(f"\n✅ [STATIVA SEED] Selesai!")
        print(f"   - {total_inserted} Kegiatan baru ditambahkan")
        print(f"   - {total_updated} Kegiatan diperbarui")
        print(f"   - Total {len(all_kegiatan)} Master Kegiatan Statistik BPS terdaftar di STATIVA.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error saat seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_master()

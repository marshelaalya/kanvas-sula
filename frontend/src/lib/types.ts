// Tipe data utama STATIVA — disesuaikan dengan schema API FastAPI

export type StatusKegiatan = "perencanaan" | "berjalan" | "selesai" | "ditangguhkan" | "diarsipkan";
export type JenisKegiatan = "survei" | "sensus" | "updating" | "pendataan" | "lainnya";
export type PlatformKegiatan = "fasih" | "capi" | "kertas" | "lainnya";
export type StatusFase = "belum_mulai" | "berjalan" | "selesai";
export type JabatanPetugas = "koseka" | "pml" | "ppl" | "pcl" | "koordinator" | "kepala" | "staf";
export type KategoriDokumen = "sk" | "pedoman" | "kuesioner" | "laporan" | "lainnya";

export interface Tim {
  id: string;
  kode: string;
  nama: string;
  kepala_tim?: string;
  warna?: string;
}

export interface Tahun {
  id: string;
  tahun: number;
  status: string;
}

export interface PetugasRingkas {
  id: string;
  nama: string;
  jabatan: JabatanPetugas;
  email?: string;
}

export interface Fase {
  id: string;
  kegiatan_id: string;
  nama_fase: string;
  urutan: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status: StatusFase;
  catatan?: string;
}

export interface Dokumen {
  id: string;
  kegiatan_id: string;
  nama_asli: string;
  kategori: KategoriDokumen;
  ukuran_bytes: number;
  mime_type?: string;
  deskripsi?: string;
  created_at: string;
}

export interface Penugasan {
  id: string;
  peran: JabatanPetugas;
  wilayah_penugasan?: string;
  target_sampel: number;
  realisasi: number;
  pegawai: PetugasRingkas;
}

export interface KegiatanRingkas {
  id: string;
  kode_kegiatan: string;
  nama_kegiatan: string;
  jenis: JenisKegiatan;
  status: StatusKegiatan;
  platform: PlatformKegiatan;
  target_sampel: number;
  realisasi_akhir: number;
  total_petugas: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  tim?: Tim;
  tahun_rel?: Tahun;
  updated_at: string;
}

export interface KegiatanDetail extends KegiatanRingkas {
  deskripsi?: string;
  tujuan?: string;
  metodologi?: string;
  cakupan_wilayah?: string;
  fasih_survey_id?: string;
  anggaran?: number;
  ketua_tim?: PetugasRingkas;
  fase: Fase[];
  penugasan: Penugasan[];
  dokumen: Dokumen[];
  created_at: string;
}

export interface PaginatedKegiatan {
  total: number;
  page: number;
  per_page: number;
  items: KegiatanRingkas[];
}

export interface DashboardStats {
  total_kegiatan: number;
  kegiatan_aktif: number;
  kegiatan_selesai: number;
  total_target_sampel: number;
  total_realisasi: number;
  persen_realisasi: number;
  total_petugas_aktif: number;
  per_tim: { kode: string; nama: string; warna: string; jumlah_kegiatan: number }[];
  kegiatan_berjalan: {
    id: string;
    kode_kegiatan: string;
    nama_kegiatan: string;
    target_sampel: number;
    realisasi_akhir: number;
    persen: number;
    tanggal_selesai?: string;
  }[];
}

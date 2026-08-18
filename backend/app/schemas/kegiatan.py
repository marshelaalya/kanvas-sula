from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.models import (
    JenisKegiatan, StatusKegiatan, PlatformKegiatan,
    StatusFase, JabatanPetugas, KategoriDokumen
)


# ─── Schemas: Fase / Periode ──────────────────────────────────────────────────

class FaseBase(BaseModel):
    nama_fase: str
    urutan: int = 0
    tanggal_mulai: Optional[date] = None
    tanggal_selesai: Optional[date] = None
    status: StatusFase = StatusFase.belum_mulai
    catatan: Optional[str] = None


class FaseCreate(FaseBase):
    pass


class FaseOut(FaseBase):
    id: UUID
    kegiatan_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Schemas: Tim ─────────────────────────────────────────────────────────────

class TimOut(BaseModel):
    id: UUID
    kode: str
    nama: str
    kepala_tim: Optional[str] = None
    warna: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Schemas: Tahun ───────────────────────────────────────────────────────────

class TahunOut(BaseModel):
    id: UUID
    tahun: int
    status: str

    model_config = {"from_attributes": True}


# ─── Schemas: Petugas (ringkas untuk relasi) ──────────────────────────────────

class PetugasRingkas(BaseModel):
    id: UUID
    nama: str
    jabatan: JabatanPetugas
    email: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Schemas: Dokumen ─────────────────────────────────────────────────────────

class DokumenOut(BaseModel):
    id: UUID
    kegiatan_id: UUID
    nama_asli: str
    kategori: KategoriDokumen
    ukuran_bytes: int
    mime_type: Optional[str] = None
    deskripsi: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Schemas: Penugasan ───────────────────────────────────────────────────────

class PenugasanOut(BaseModel):
    id: UUID
    peran: JabatanPetugas
    wilayah_penugasan: Optional[str] = None
    target_sampel: int
    realisasi: int
    pegawai: PetugasRingkas

    model_config = {"from_attributes": True}


# ─── Schemas: Kegiatan ────────────────────────────────────────────────────────

class KegiatanCreate(BaseModel):
    kode_kegiatan: str = Field(..., min_length=3, max_length=100)
    nama_kegiatan: str = Field(..., min_length=3, max_length=300)
    jenis: JenisKegiatan = JenisKegiatan.survei
    tim_id: UUID
    tahun_id: UUID
    status: StatusKegiatan = StatusKegiatan.perencanaan
    target_sampel: int = 0
    deskripsi: Optional[str] = None
    tujuan: Optional[str] = None
    metodologi: Optional[str] = None
    cakupan_wilayah: Optional[str] = None
    platform: PlatformKegiatan = PlatformKegiatan.fasih
    fasih_survey_id: Optional[str] = None
    tanggal_mulai: Optional[date] = None
    tanggal_selesai: Optional[date] = None
    anggaran: Optional[Decimal] = None
    ketua_tim_id: Optional[UUID] = None
    fase: List[FaseCreate] = []


class KegiatanUpdate(BaseModel):
    nama_kegiatan: Optional[str] = None
    jenis: Optional[JenisKegiatan] = None
    status: Optional[StatusKegiatan] = None
    target_sampel: Optional[int] = None
    realisasi_akhir: Optional[int] = None
    deskripsi: Optional[str] = None
    tujuan: Optional[str] = None
    metodologi: Optional[str] = None
    cakupan_wilayah: Optional[str] = None
    platform: Optional[PlatformKegiatan] = None
    tanggal_mulai: Optional[date] = None
    tanggal_selesai: Optional[date] = None
    anggaran: Optional[Decimal] = None
    ketua_tim_id: Optional[UUID] = None


class KegiatanRingkas(BaseModel):
    """Untuk list/grid kegiatan — data ringkas tanpa relasi berat."""
    id: UUID
    kode_kegiatan: str
    nama_kegiatan: str
    jenis: JenisKegiatan
    status: StatusKegiatan
    platform: PlatformKegiatan
    target_sampel: int
    realisasi_akhir: int
    total_petugas: int
    tanggal_mulai: Optional[date] = None
    tanggal_selesai: Optional[date] = None
    tim: Optional[TimOut] = None
    tahun_rel: Optional[TahunOut] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class KegiatanDetail(BaseModel):
    """Detail lengkap kegiatan dengan semua relasi."""
    id: UUID
    kode_kegiatan: str
    nama_kegiatan: str
    jenis: JenisKegiatan
    status: StatusKegiatan
    platform: PlatformKegiatan
    target_sampel: int
    realisasi_akhir: int
    total_petugas: int
    deskripsi: Optional[str] = None
    tujuan: Optional[str] = None
    metodologi: Optional[str] = None
    cakupan_wilayah: Optional[str] = None
    fasih_survey_id: Optional[str] = None
    tanggal_mulai: Optional[date] = None
    tanggal_selesai: Optional[date] = None
    anggaran: Optional[Decimal] = None
    tim: Optional[TimOut] = None
    tahun_rel: Optional[TahunOut] = None
    ketua_tim: Optional[PetugasRingkas] = None
    fase: List[FaseOut] = []
    penugasan: List[PenugasanOut] = []
    dokumen: List[DokumenOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Schemas: Pagination ──────────────────────────────────────────────────────

class PaginatedKegiatan(BaseModel):
    total: int
    page: int
    per_page: int
    items: List[KegiatanRingkas]

from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.models import JabatanPetugas
from app.schemas.kegiatan import KegiatanRingkas


class PegawaiCreate(BaseModel):
    nama: str
    nip: Optional[str] = None
    email: Optional[str] = None
    no_hp: Optional[str] = None
    jabatan: JabatanPetugas = JabatanPetugas.staf
    tim_default_id: Optional[UUID] = None
    is_mitra: bool = False
    catatan: Optional[str] = None


class PegawaiUpdate(BaseModel):
    nama: Optional[str] = None
    nip: Optional[str] = None
    email: Optional[str] = None
    no_hp: Optional[str] = None
    jabatan: Optional[JabatanPetugas] = None
    aktif: Optional[bool] = None
    catatan: Optional[str] = None


class PegawaiRingkas(BaseModel):
    id: UUID
    nama: str
    jabatan: JabatanPetugas
    email: Optional[str] = None
    no_hp: Optional[str] = None
    is_mitra: bool
    aktif: bool

    model_config = {"from_attributes": True}


class RiwayatSurveiPetugas(BaseModel):
    kegiatan_id: UUID
    kode_kegiatan: str
    nama_kegiatan: str
    tahun: int
    peran: JabatanPetugas
    wilayah_penugasan: Optional[str] = None
    target_sampel: int
    realisasi: int

    model_config = {"from_attributes": True}


class PegawaiDetail(BaseModel):
    id: UUID
    nama: str
    nip: Optional[str] = None
    email: Optional[str] = None
    no_hp: Optional[str] = None
    jabatan: JabatanPetugas
    is_mitra: bool
    aktif: bool
    catatan: Optional[str] = None
    riwayat_survei: List[RiwayatSurveiPetugas] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

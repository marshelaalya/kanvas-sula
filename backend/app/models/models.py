import uuid
from datetime import date, datetime
from sqlalchemy import (
    Column, String, Integer, Date, DateTime, Boolean,
    ForeignKey, Text, Enum as SAEnum, JSON, Numeric,
    func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


# ─── Enumerasi ───────────────────────────────────────────────────────────────

class StatusTahun(str, enum.Enum):
    aktif = "aktif"
    arsip = "arsip"


class JenisKegiatan(str, enum.Enum):
    survei = "survei"
    sensus = "sensus"
    updating = "updating"
    pendataan = "pendataan"
    lainnya = "lainnya"


class StatusKegiatan(str, enum.Enum):
    perencanaan = "perencanaan"
    berjalan = "berjalan"
    selesai = "selesai"
    ditangguhkan = "ditangguhkan"
    diarsipkan = "diarsipkan"


class PlatformKegiatan(str, enum.Enum):
    fasih = "fasih"
    capi = "capi"
    kertas = "kertas"
    lainnya = "lainnya"


class StatusFase(str, enum.Enum):
    belum_mulai = "belum_mulai"
    berjalan = "berjalan"
    selesai = "selesai"


class JabatanPetugas(str, enum.Enum):
    koseka = "koseka"
    pml = "pml"
    ppl = "ppl"
    pcl = "pcl"
    koordinator = "koordinator"
    kepala = "kepala"
    staf = "staf"


class KategoriDokumen(str, enum.Enum):
    sk = "sk"
    pedoman = "pedoman"
    kuesioner = "kuesioner"
    laporan = "laporan"
    lainnya = "lainnya"


# ─── Model: Tahun ─────────────────────────────────────────────────────────────

class Tahun(Base):
    __tablename__ = "tahun"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tahun = Column(Integer, unique=True, nullable=False)
    status = Column(SAEnum(StatusTahun), default=StatusTahun.aktif)
    catatan = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kegiatan = relationship("KegiatanStatistik", back_populates="tahun_rel")

    def __repr__(self):
        return f"<Tahun {self.tahun}>"


# ─── Model: Tim ──────────────────────────────────────────────────────────────

class Tim(Base):
    __tablename__ = "tim"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kode = Column(String(50), unique=True, nullable=False)
    nama = Column(String(200), nullable=False)
    kepala_tim = Column(String(200), nullable=True)
    deskripsi = Column(Text, nullable=True)
    warna = Column(String(20), default="#f97316")  # warna hex untuk UI
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kegiatan = relationship("KegiatanStatistik", back_populates="tim")

    def __repr__(self):
        return f"<Tim {self.kode}>"


# ─── Model: Kegiatan Statistik ────────────────────────────────────────────────

class KegiatanStatistik(Base):
    __tablename__ = "kegiatan_statistik"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kode_kegiatan = Column(String(100), unique=True, nullable=False)
    nama_kegiatan = Column(String(300), nullable=False)
    jenis = Column(SAEnum(JenisKegiatan), default=JenisKegiatan.survei)
    tim_id = Column(UUID(as_uuid=True), ForeignKey("tim.id"), nullable=False)
    tahun_id = Column(UUID(as_uuid=True), ForeignKey("tahun.id"), nullable=False)
    status = Column(SAEnum(StatusKegiatan), default=StatusKegiatan.perencanaan)

    target_sampel = Column(Integer, default=0)
    realisasi_akhir = Column(Integer, default=0)
    total_petugas = Column(Integer, default=0)

    deskripsi = Column(Text, nullable=True)
    tujuan = Column(Text, nullable=True)
    metodologi = Column(Text, nullable=True)
    cakupan_wilayah = Column(String(300), nullable=True)

    platform = Column(SAEnum(PlatformKegiatan), default=PlatformKegiatan.fasih)
    fasih_survey_id = Column(String(200), nullable=True)
    fasih_config = Column(JSON, nullable=True)

    ketua_tim_id = Column(UUID(as_uuid=True), ForeignKey("pegawai.id"), nullable=True)
    anggaran = Column(Numeric(15, 2), nullable=True)

    tanggal_mulai = Column(Date, nullable=True)
    tanggal_selesai = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    tim = relationship("Tim", back_populates="kegiatan")
    tahun_rel = relationship("Tahun", back_populates="kegiatan")
    ketua_tim = relationship("Pegawai", foreign_keys=[ketua_tim_id])
    fase = relationship("PeriodeKegiatan", back_populates="kegiatan", order_by="PeriodeKegiatan.tanggal_mulai")
    penugasan = relationship("PenugasanPetugas", back_populates="kegiatan")
    dokumen = relationship("Dokumen", back_populates="kegiatan", order_by="Dokumen.created_at.desc()")

    def __repr__(self):
        return f"<Kegiatan {self.kode_kegiatan}>"


# ─── Model: Periode / Fase Kegiatan ──────────────────────────────────────────

class PeriodeKegiatan(Base):
    __tablename__ = "periode_kegiatan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kegiatan_id = Column(UUID(as_uuid=True), ForeignKey("kegiatan_statistik.id", ondelete="CASCADE"), nullable=False)
    nama_fase = Column(String(200), nullable=False)
    urutan = Column(Integer, default=0)
    tanggal_mulai = Column(Date, nullable=True)
    tanggal_selesai = Column(Date, nullable=True)
    status = Column(SAEnum(StatusFase), default=StatusFase.belum_mulai)
    catatan = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kegiatan = relationship("KegiatanStatistik", back_populates="fase")


# ─── Model: Pegawai ───────────────────────────────────────────────────────────

class Pegawai(Base):
    __tablename__ = "pegawai"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nama = Column(String(200), nullable=False)
    nip = Column(String(50), nullable=True, unique=True)
    email = Column(String(200), nullable=True, unique=True)
    no_hp = Column(String(30), nullable=True)
    jabatan = Column(SAEnum(JabatanPetugas), default=JabatanPetugas.staf)
    tim_default_id = Column(UUID(as_uuid=True), ForeignKey("tim.id"), nullable=True)
    is_mitra = Column(Boolean, default=False)
    aktif = Column(Boolean, default=True)
    catatan = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tim_default = relationship("Tim")
    penugasan = relationship("PenugasanPetugas", back_populates="pegawai")

    def __repr__(self):
        return f"<Pegawai {self.nama}>"


# ─── Model: Penugasan Petugas ─────────────────────────────────────────────────

class PenugasanPetugas(Base):
    __tablename__ = "penugasan_petugas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kegiatan_id = Column(UUID(as_uuid=True), ForeignKey("kegiatan_statistik.id", ondelete="CASCADE"), nullable=False)
    pegawai_id = Column(UUID(as_uuid=True), ForeignKey("pegawai.id"), nullable=False)
    peran = Column(SAEnum(JabatanPetugas), default=JabatanPetugas.ppl)
    wilayah_penugasan = Column(String(300), nullable=True)
    target_sampel = Column(Integer, default=0)
    realisasi = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kegiatan = relationship("KegiatanStatistik", back_populates="penugasan")
    pegawai = relationship("Pegawai", back_populates="penugasan")


# ─── Model: Dokumen ───────────────────────────────────────────────────────────

class Dokumen(Base):
    __tablename__ = "dokumen"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kegiatan_id = Column(UUID(as_uuid=True), ForeignKey("kegiatan_statistik.id", ondelete="CASCADE"), nullable=False)
    nama_file = Column(String(500), nullable=False)
    nama_asli = Column(String(500), nullable=False)
    kategori = Column(SAEnum(KategoriDokumen), default=KategoriDokumen.lainnya)
    storage_path = Column(String(1000), nullable=False)
    ukuran_bytes = Column(Integer, default=0)
    mime_type = Column(String(200), nullable=True)
    deskripsi = Column(Text, nullable=True)
    uploaded_by_id = Column(UUID(as_uuid=True), ForeignKey("pegawai.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kegiatan = relationship("KegiatanStatistik", back_populates="dokumen")
    uploaded_by = relationship("Pegawai")

    def __repr__(self):
        return f"<Dokumen {self.nama_asli}>"

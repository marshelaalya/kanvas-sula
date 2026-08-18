from uuid import UUID
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Pegawai, PenugasanPetugas, KegiatanStatistik, Tahun
from app.schemas.petugas import (
    PegawaiCreate, PegawaiUpdate, PegawaiRingkas, PegawaiDetail,
    RiwayatSurveiPetugas
)

router = APIRouter(prefix="/petugas", tags=["Petugas"])


@router.get("", response_model=List[PegawaiRingkas])
def list_petugas(
    q: Optional[str] = None,
    aktif: Optional[bool] = None,
    is_mitra: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """Daftar semua petugas dengan filter opsional."""
    query = db.query(Pegawai)
    if q:
        query = query.filter(Pegawai.nama.ilike(f"%{q}%"))
    if aktif is not None:
        query = query.filter(Pegawai.aktif == aktif)
    if is_mitra is not None:
        query = query.filter(Pegawai.is_mitra == is_mitra)
    return query.order_by(Pegawai.nama).all()


@router.post("", response_model=PegawaiRingkas, status_code=201)
def create_petugas(payload: PegawaiCreate, db: Session = Depends(get_db)):
    """Tambah petugas baru."""
    if payload.email:
        existing = db.query(Pegawai).filter(Pegawai.email == payload.email).first()
        if existing:
            raise HTTPException(400, detail="Email sudah terdaftar.")
    petugas = Pegawai(**payload.model_dump())
    db.add(petugas)
    db.commit()
    db.refresh(petugas)
    return petugas


@router.get("/{petugas_id}", response_model=PegawaiDetail)
def get_petugas(petugas_id: UUID, db: Session = Depends(get_db)):
    """Detail petugas lengkap dengan riwayat survei."""
    petugas = db.query(Pegawai).filter(Pegawai.id == petugas_id).first()
    if not petugas:
        raise HTTPException(404, detail="Petugas tidak ditemukan.")

    # Ambil riwayat penugasan
    penugasan_list = (
        db.query(PenugasanPetugas)
        .options(joinedload(PenugasanPetugas.kegiatan).joinedload(KegiatanStatistik.tahun_rel))
        .filter(PenugasanPetugas.pegawai_id == petugas_id)
        .all()
    )

    riwayat = []
    for p in penugasan_list:
        kg = p.kegiatan
        riwayat.append(RiwayatSurveiPetugas(
            kegiatan_id=kg.id,
            kode_kegiatan=kg.kode_kegiatan,
            nama_kegiatan=kg.nama_kegiatan,
            tahun=kg.tahun_rel.tahun if kg.tahun_rel else 0,
            peran=p.peran,
            wilayah_penugasan=p.wilayah_penugasan,
            target_sampel=p.target_sampel,
            realisasi=p.realisasi,
        ))

    result = PegawaiDetail(
        id=petugas.id,
        nama=petugas.nama,
        nip=petugas.nip,
        email=petugas.email,
        no_hp=petugas.no_hp,
        jabatan=petugas.jabatan,
        is_mitra=petugas.is_mitra,
        aktif=petugas.aktif,
        catatan=petugas.catatan,
        riwayat_survei=riwayat,
        created_at=petugas.created_at,
        updated_at=petugas.updated_at,
    )
    return result


@router.put("/{petugas_id}", response_model=PegawaiRingkas)
def update_petugas(petugas_id: UUID, payload: PegawaiUpdate, db: Session = Depends(get_db)):
    """Update data petugas."""
    petugas = db.query(Pegawai).filter(Pegawai.id == petugas_id).first()
    if not petugas:
        raise HTTPException(404, detail="Petugas tidak ditemukan.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(petugas, field, value)
    db.commit()
    db.refresh(petugas)
    return petugas

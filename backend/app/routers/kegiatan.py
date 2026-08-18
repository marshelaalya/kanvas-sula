import uuid
import os
import shutil
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import (
    KegiatanStatistik, PeriodeKegiatan, Tim, Tahun, Pegawai, Dokumen, PenugasanPetugas,
    StatusKegiatan
)
from app.schemas.kegiatan import (
    KegiatanCreate, KegiatanUpdate, KegiatanRingkas, KegiatanDetail,
    PaginatedKegiatan, FaseCreate, FaseOut
)

router = APIRouter(prefix="/kegiatan", tags=["Kegiatan"])


@router.get("", response_model=PaginatedKegiatan)
def list_kegiatan(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    q: Optional[str] = Query(None, description="Cari nama atau kode kegiatan"),
    tim_id: Optional[UUID] = None,
    tahun: Optional[int] = None,
    status: Optional[str] = None,
    jenis: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Daftar semua kegiatan dengan filter dan pagination."""
    query = db.query(KegiatanStatistik).options(
        joinedload(KegiatanStatistik.tim),
        joinedload(KegiatanStatistik.tahun_rel),
    )

    if q:
        query = query.filter(
            or_(
                KegiatanStatistik.nama_kegiatan.ilike(f"%{q}%"),
                KegiatanStatistik.kode_kegiatan.ilike(f"%{q}%"),
            )
        )
    if tim_id:
        query = query.filter(KegiatanStatistik.tim_id == tim_id)
    if tahun:
        query = query.join(Tahun).filter(Tahun.tahun == tahun)
    if status:
        query = query.filter(KegiatanStatistik.status == status)
    if jenis:
        query = query.filter(KegiatanStatistik.jenis == jenis)

    total = query.count()
    items = (
        query
        .order_by(KegiatanStatistik.updated_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return PaginatedKegiatan(total=total, page=page, per_page=per_page, items=items)


@router.post("", response_model=KegiatanDetail, status_code=status.HTTP_201_CREATED)
def create_kegiatan(payload: KegiatanCreate, db: Session = Depends(get_db)):
    """Tambah kegiatan statistik baru beserta fase-fasenya."""
    # Cek duplikasi kode
    existing = db.query(KegiatanStatistik).filter(
        KegiatanStatistik.kode_kegiatan == payload.kode_kegiatan
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Kode kegiatan '{payload.kode_kegiatan}' sudah digunakan."
        )

    data = payload.model_dump(exclude={"fase"})
    kegiatan = KegiatanStatistik(**data)
    db.add(kegiatan)
    db.flush()

    # Tambahkan fase
    for i, fase_data in enumerate(payload.fase):
        fase = PeriodeKegiatan(
            kegiatan_id=kegiatan.id,
            urutan=i,
            **fase_data.model_dump()
        )
        db.add(fase)

    db.commit()
    db.refresh(kegiatan)
    return _load_detail(db, kegiatan.id)


@router.get("/{kegiatan_id}", response_model=KegiatanDetail)
def get_kegiatan(kegiatan_id: UUID, db: Session = Depends(get_db)):
    """Detail lengkap satu kegiatan."""
    return _load_detail(db, kegiatan_id)


@router.put("/{kegiatan_id}", response_model=KegiatanDetail)
def update_kegiatan(
    kegiatan_id: UUID, payload: KegiatanUpdate, db: Session = Depends(get_db)
):
    """Update data kegiatan."""
    kegiatan = _get_or_404(db, kegiatan_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(kegiatan, field, value)
    db.commit()
    return _load_detail(db, kegiatan_id)


@router.delete("/{kegiatan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kegiatan(kegiatan_id: UUID, db: Session = Depends(get_db)):
    """Hapus kegiatan (dan semua data terkait via cascade)."""
    kegiatan = _get_or_404(db, kegiatan_id)
    db.delete(kegiatan)
    db.commit()


@router.post("/{kegiatan_id}/fase", response_model=FaseOut, status_code=201)
def add_fase(kegiatan_id: UUID, payload: FaseCreate, db: Session = Depends(get_db)):
    """Tambah fase baru ke kegiatan yang sudah ada."""
    _get_or_404(db, kegiatan_id)
    fase = PeriodeKegiatan(kegiatan_id=kegiatan_id, **payload.model_dump())
    db.add(fase)
    db.commit()
    db.refresh(fase)
    return fase


# ─── Helper Functions ─────────────────────────────────────────────────────────

def _get_or_404(db: Session, kegiatan_id: UUID) -> KegiatanStatistik:
    obj = db.query(KegiatanStatistik).filter(KegiatanStatistik.id == kegiatan_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Kegiatan tidak ditemukan.")
    return obj


def _load_detail(db: Session, kegiatan_id: UUID) -> KegiatanStatistik:
    obj = (
        db.query(KegiatanStatistik)
        .options(
            joinedload(KegiatanStatistik.tim),
            joinedload(KegiatanStatistik.tahun_rel),
            joinedload(KegiatanStatistik.ketua_tim),
            joinedload(KegiatanStatistik.fase),
            joinedload(KegiatanStatistik.penugasan).joinedload(PenugasanPetugas.pegawai),
            joinedload(KegiatanStatistik.dokumen),
        )
        .filter(KegiatanStatistik.id == kegiatan_id)
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Kegiatan tidak ditemukan.")
    return obj

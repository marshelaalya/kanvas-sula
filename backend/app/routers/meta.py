from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Tim, Tahun, KegiatanStatistik, Pegawai, StatusKegiatan
from app.schemas.kegiatan import TimOut, TahunOut

router = APIRouter(tags=["Meta & Statistik"])


@router.get("/tim", response_model=List[TimOut])
def list_tim(db: Session = Depends(get_db)):
    """Daftar semua tim BPS."""
    return db.query(Tim).order_by(Tim.nama).all()


@router.get("/tahun", response_model=List[TahunOut])
def list_tahun(db: Session = Depends(get_db)):
    """Daftar semua tahun yang tersedia."""
    return db.query(Tahun).order_by(Tahun.tahun.desc()).all()


@router.get("/stats/dashboard")
def dashboard_stats(db: Session = Depends(get_db)):
    """Statistik agregat untuk Executive Dashboard."""
    total_kegiatan = db.query(func.count(KegiatanStatistik.id)).scalar()

    aktif = db.query(func.count(KegiatanStatistik.id)).filter(
        KegiatanStatistik.status == StatusKegiatan.berjalan
    ).scalar()

    selesai = db.query(func.count(KegiatanStatistik.id)).filter(
        KegiatanStatistik.status == StatusKegiatan.selesai
    ).scalar()

    total_target = db.query(func.sum(KegiatanStatistik.target_sampel)).scalar() or 0
    total_realisasi = db.query(func.sum(KegiatanStatistik.realisasi_akhir)).scalar() or 0

    persen_realisasi = round((total_realisasi / total_target * 100), 1) if total_target > 0 else 0.0

    total_petugas_aktif = db.query(func.count(Pegawai.id)).filter(Pegawai.aktif == True).scalar()

    # Statistik per tim
    per_tim = (
        db.query(
            Tim.kode,
            Tim.nama,
            Tim.warna,
            func.count(KegiatanStatistik.id).label("jumlah_kegiatan"),
        )
        .outerjoin(KegiatanStatistik, KegiatanStatistik.tim_id == Tim.id)
        .group_by(Tim.id)
        .all()
    )

    # Kegiatan sedang berjalan (untuk card grid)
    kegiatan_aktif = (
        db.query(KegiatanStatistik)
        .filter(KegiatanStatistik.status == StatusKegiatan.berjalan)
        .order_by(KegiatanStatistik.tanggal_selesai.asc())
        .limit(6)
        .all()
    )

    return {
        "total_kegiatan": total_kegiatan,
        "kegiatan_aktif": aktif,
        "kegiatan_selesai": selesai,
        "total_target_sampel": total_target,
        "total_realisasi": total_realisasi,
        "persen_realisasi": persen_realisasi,
        "total_petugas_aktif": total_petugas_aktif,
        "per_tim": [
            {"kode": r.kode, "nama": r.nama, "warna": r.warna, "jumlah_kegiatan": r.jumlah_kegiatan}
            for r in per_tim
        ],
        "kegiatan_berjalan": [
            {
                "id": str(k.id),
                "kode_kegiatan": k.kode_kegiatan,
                "nama_kegiatan": k.nama_kegiatan,
                "target_sampel": k.target_sampel,
                "realisasi_akhir": k.realisasi_akhir,
                "persen": round(k.realisasi_akhir / k.target_sampel * 100, 1) if k.target_sampel > 0 else 0,
                "tanggal_selesai": k.tanggal_selesai.isoformat() if k.tanggal_selesai else None,
            }
            for k in kegiatan_aktif
        ],
    }

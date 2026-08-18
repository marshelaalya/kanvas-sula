import os
import uuid
import shutil
from pathlib import Path
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.config import get_settings
from app.models.models import Dokumen, KegiatanStatistik, KategoriDokumen
from app.schemas.kegiatan import DokumenOut

router = APIRouter(prefix="/dokumen", tags=["Dokumen"])
settings = get_settings()

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/msword",
    "image/jpeg",
    "image/png",
    "text/plain",
    "text/csv",
}


@router.post("/upload/{kegiatan_id}", response_model=DokumenOut, status_code=201)
async def upload_dokumen(
    kegiatan_id: UUID,
    file: UploadFile = File(...),
    kategori: KategoriDokumen = Form(KategoriDokumen.lainnya),
    deskripsi: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Upload dokumen untuk kegiatan tertentu."""
    # Validasi kegiatan
    kegiatan = db.query(KegiatanStatistik).filter(KegiatanStatistik.id == kegiatan_id).first()
    if not kegiatan:
        raise HTTPException(404, detail="Kegiatan tidak ditemukan.")

    # Validasi ukuran file
    max_bytes = settings.max_file_size_mb * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(413, detail=f"Ukuran file melebihi batas maksimal {settings.max_file_size_mb} MB.")

    # Validasi MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(415, detail=f"Tipe file '{file.content_type}' tidak diizinkan.")

    # Simpan file dengan nama unik
    upload_dir = Path(settings.upload_dir) / str(kegiatan_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix
    safe_name = f"{uuid.uuid4()}{ext}"
    file_path = upload_dir / safe_name

    with open(file_path, "wb") as f:
        f.write(content)

    # Simpan metadata ke DB
    dokumen = Dokumen(
        kegiatan_id=kegiatan_id,
        nama_asli=file.filename,
        nama_file=safe_name,
        kategori=kategori,
        storage_path=str(file_path),
        ukuran_bytes=len(content),
        mime_type=file.content_type,
        deskripsi=deskripsi,
    )
    db.add(dokumen)
    db.commit()
    db.refresh(dokumen)
    return dokumen


@router.get("/{dokumen_id}/download")
def download_dokumen(dokumen_id: UUID, db: Session = Depends(get_db)):
    """Download / buka dokumen."""
    dok = db.query(Dokumen).filter(Dokumen.id == dokumen_id).first()
    if not dok:
        raise HTTPException(404, detail="Dokumen tidak ditemukan.")

    if not os.path.exists(dok.storage_path):
        raise HTTPException(404, detail="File tidak ditemukan di storage.")

    return FileResponse(
        path=dok.storage_path,
        media_type=dok.mime_type or "application/octet-stream",
        filename=dok.nama_asli,
    )


@router.delete("/{dokumen_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dokumen(dokumen_id: UUID, db: Session = Depends(get_db)):
    """Hapus dokumen dari DB dan storage."""
    dok = db.query(Dokumen).filter(Dokumen.id == dokumen_id).first()
    if not dok:
        raise HTTPException(404, detail="Dokumen tidak ditemukan.")

    # Hapus file dari disk
    if os.path.exists(dok.storage_path):
        os.remove(dok.storage_path)

    db.delete(dok)
    db.commit()

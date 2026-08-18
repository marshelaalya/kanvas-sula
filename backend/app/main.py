import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.database import engine, Base
from app.routers import kegiatan, petugas, dokumen, meta

settings = get_settings()

# Buat tabel jika belum ada (untuk development)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="STATIVA API",
    description="Sistem Monitoring Survei Terintegrasi dan Arsip Statistik — BPS",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(kegiatan.router, prefix="/api")
app.include_router(petugas.router, prefix="/api")
app.include_router(dokumen.router, prefix="/api")
app.include_router(meta.router, prefix="/api")


@app.get("/", tags=["Root"])
def root():
    return {
        "app": "STATIVA API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "ok"}

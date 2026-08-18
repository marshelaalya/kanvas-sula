# STATIVA — Sistem Monitoring Survei Terintegrasi dan Arsip Statistik
**BPS Kabupaten Kepulauan Sula**

---

## Prasyarat

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstall dan berjalan
- Git sudah terinstall

---

## Cara Menjalankan (Docker Compose)

### 1. Salin file konfigurasi environment

```bash
cp env.example .env
```

> Anda bisa mengubah isi `.env` jika diperlukan. Untuk development lokal, nilai default sudah cukup.

### 2. Jalankan semua layanan

```bash
docker compose up --build
```

Proses ini akan:
- Membangun image Docker untuk backend dan frontend
- Menjalankan PostgreSQL, FastAPI backend, dan Next.js frontend
- Menjalankan migrasi database otomatis
- Mengisi data awal (seed): Tim, Tahun, dan Kegiatan contoh

### 3. Akses aplikasi

| Layanan | URL |
|---|---|
| **Dashboard STATIVA** | http://localhost:3000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API Docs (ReDoc)**   | http://localhost:8000/redoc |

---

## Halaman yang Tersedia

| Halaman | URL | Deskripsi |
|---|---|---|
| Executive Dashboard | `/` | KPI, kegiatan aktif, distribusi per tim |
| Direktori Kegiatan | `/kegiatan` | Search, filter, grid/list view |
| Detail Kegiatan | `/kegiatan/{id}` | Tab: Ringkasan, Fase, Petugas, Dokumen |
| Tambah Kegiatan | `/admin/kegiatan/baru` | Form lengkap + manajemen fase |

---

## Menjalankan Ulang Seed Data

Jika ingin mengisi ulang data awal secara manual:

```bash
docker compose exec backend python seed.py
```

---

## Pengembangan Lokal (Tanpa Docker)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate  # atau venv\Scripts\activate di Windows
pip install -r requirements.txt
# Pastikan DATABASE_URL di .env mengarah ke PostgreSQL lokal
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
# Buat file .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

---

## Struktur Project

```
stativa/
├── backend/              # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── core/         # Konfigurasi & settings
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── routers/      # API route handlers
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── database.py   # Koneksi database
│   │   └── main.py       # FastAPI app entry point
│   └── seed.py           # Data awal
└── frontend/             # Next.js 15 + Tailwind CSS v4
    └── src/
        ├── app/          # Halaman (App Router)
        ├── components/   # Komponen reusable
        └── lib/          # API client & TypeScript types
```

---

## Roadmap MVP Berikutnya (Tahap 2)

- [ ] Autentikasi & manajemen pengguna (Login, RBAC per tim)
- [ ] Integrasi FASIH Scraper (Adapter Pattern, multi-survei)
- [ ] Halaman monitoring petugas real-time dari FASIH
- [ ] Notifikasi email/alert keterlambatan
- [ ] Scheduler otomatis (Celery + Redis)

// API client untuk STATIVA — wrapper di atas fetch

function getApiBase(): string {
  if (typeof window === "undefined") {
    // Server-side (misal Server Component di Next.js)
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  }
  // Client-side (browser)
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API Error ${res.status}`);
  }
  return res.json();
}

// ─── Kegiatan ─────────────────────────────────────────────────────────────────

import type {
  PaginatedKegiatan, KegiatanRingkas, KegiatanDetail,
  Tim, Tahun, DashboardStats, Dokumen
} from "./types";

export interface ListKegiatanParams {
  page?: number;
  per_page?: number;
  q?: string;
  tim_id?: string;
  tahun?: number;
  status?: string;
  jenis?: string;
}

export const kegiatanApi = {
  list: (params: ListKegiatanParams = {}): Promise<PaginatedKegiatan> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
    });
    return apiFetch(`/api/kegiatan?${qs}`);
  },

  get: (id: string): Promise<KegiatanDetail> =>
    apiFetch(`/api/kegiatan/${id}`),

  create: (data: Record<string, unknown>): Promise<KegiatanDetail> =>
    apiFetch("/api/kegiatan", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Record<string, unknown>): Promise<KegiatanDetail> =>
    apiFetch(`/api/kegiatan/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string): Promise<void> =>
    apiFetch(`/api/kegiatan/${id}`, { method: "DELETE" }),
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

export const metaApi = {
  tim: (): Promise<Tim[]> => apiFetch("/api/tim"),
  tahun: (): Promise<Tahun[]> => apiFetch("/api/tahun"),
  dashboardStats: (): Promise<DashboardStats> => apiFetch("/api/stats/dashboard"),
};

// ─── Dokumen ──────────────────────────────────────────────────────────────────

export const dokumenApi = {
  upload: async (
    kegiatanId: string,
    file: File,
    kategori: string,
    deskripsi?: string
  ): Promise<Dokumen> => {
    const base = getApiBase();
    const form = new FormData();
    form.append("file", file);
    form.append("kategori", kategori);
    if (deskripsi) form.append("deskripsi", deskripsi);
    const res = await fetch(`${base}/api/dokumen/upload/${kegiatanId}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Upload gagal");
    }
    return res.json();
  },

  downloadUrl: (dokumenId: string): string =>
    `${getApiBase()}/api/dokumen/${dokumenId}/download`,

  delete: (dokumenId: string): Promise<void> =>
    apiFetch(`/api/dokumen/${dokumenId}`, { method: "DELETE" }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

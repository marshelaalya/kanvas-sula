"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2, Save } from "lucide-react";
import Link from "next/link";
import type { Tim, Tahun } from "@/lib/types";
import { kegiatanApi, metaApi } from "@/lib/api";

const STATUS_OPTIONS = ["perencanaan", "berjalan", "selesai", "ditangguhkan", "diarsipkan"];
const JENIS_OPTIONS  = ["survei", "sensus", "updating", "pendataan", "lainnya"];
const PLATFORM_OPTIONS = ["fasih", "capi", "kertas", "lainnya"];
const FASE_STATUS_OPTIONS = ["belum_mulai", "berjalan", "selesai"];
const FASE_STATUS_LABELS: Record<string, string> = {
  belum_mulai: "Belum Dimulai", berjalan: "Berjalan", selesai: "Selesai",
};

type FaseInput = { nama_fase: string; tanggal_mulai: string; tanggal_selesai: string; status: string; urutan: number };

const DEFAULT_FASE: FaseInput = { nama_fase: "", tanggal_mulai: "", tanggal_selesai: "", status: "belum_mulai", urutan: 0 };

const InputField = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors";

export default function TambahKegiatanPage() {
  const router = useRouter();
  const [timList, setTimList] = useState<Tim[]>([]);
  const [tahunList, setTahunList] = useState<Tahun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fase, setFase] = useState<FaseInput[]>([]);

  const [form, setForm] = useState({
    kode_kegiatan: "",
    nama_kegiatan: "",
    jenis: "survei",
    tim_id: "",
    tahun_id: "",
    status: "perencanaan",
    platform: "fasih",
    target_sampel: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    deskripsi: "",
    tujuan: "",
    metodologi: "",
    cakupan_wilayah: "",
    fasih_survey_id: "",
  });

  useEffect(() => {
    metaApi.tim().then(setTimList).catch(() => {});
    metaApi.tahun().then(setTahunList).catch(() => {});
  }, []);

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addFase = () =>
    setFase((prev) => [...prev, { ...DEFAULT_FASE, urutan: prev.length }]);

  const updateFase = (idx: number, key: keyof FaseInput, value: string) =>
    setFase((prev) => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f));

  const removeFase = (idx: number) =>
    setFase((prev) => prev.filter((_, i) => i !== idx).map((f, i) => ({ ...f, urutan: i })));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tim_id || !form.tahun_id) {
      setError("Tim dan Tahun wajib dipilih.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        target_sampel: Number(form.target_sampel) || 0,
        tanggal_mulai: form.tanggal_mulai || null,
        tanggal_selesai: form.tanggal_selesai || null,
        fasih_survey_id: form.fasih_survey_id || null,
        fase: fase.map((f) => ({
          ...f,
          tanggal_mulai: f.tanggal_mulai || null,
          tanggal_selesai: f.tanggal_selesai || null,
        })),
      };

      const created = await kegiatanApi.create(payload);
      router.push(`/kegiatan/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kegiatan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/kegiatan" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kegiatan
        </Link>
        <h1 className="text-2xl font-bold text-white">Tambah Kegiatan Statistik Baru</h1>
        <p className="text-gray-500 text-sm mt-1">Isi informasi kegiatan untuk ditambahkan ke arsip STATIVA.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Identitas Kegiatan */}
        <SectionCard title="Identitas Kegiatan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Kode Kegiatan" required>
              <input
                type="text"
                placeholder="Contoh: SAKERNAS-AUG-2026"
                value={form.kode_kegiatan}
                onChange={(e) => setField("kode_kegiatan", e.target.value.toUpperCase())}
                required
                className={inputCls}
              />
            </InputField>
            <InputField label="Nama Kegiatan" required>
              <input
                type="text"
                placeholder="Nama lengkap kegiatan"
                value={form.nama_kegiatan}
                onChange={(e) => setField("nama_kegiatan", e.target.value)}
                required
                className={inputCls}
              />
            </InputField>
            <InputField label="Jenis Kegiatan" required>
              <select value={form.jenis} onChange={(e) => setField("jenis", e.target.value)} className={inputCls}>
                {JENIS_OPTIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </InputField>
            <InputField label="Tim Penanggung Jawab" required>
              <select value={form.tim_id} onChange={(e) => setField("tim_id", e.target.value)} required className={inputCls}>
                <option value="">— Pilih Tim —</option>
                {timList.map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
            </InputField>
            <InputField label="Tahun Pelaksanaan" required>
              <select value={form.tahun_id} onChange={(e) => setField("tahun_id", e.target.value)} required className={inputCls}>
                <option value="">— Pilih Tahun —</option>
                {tahunList.map((t) => <option key={t.id} value={t.id}>{t.tahun}</option>)}
              </select>
            </InputField>
            <InputField label="Status Awal">
              <select value={form.status} onChange={(e) => setField("status", e.target.value)} className={inputCls}>
                {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </InputField>
          </div>
        </SectionCard>

        {/* Section: Detail Teknis */}
        <SectionCard title="Detail Teknis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Platform">
              <select value={form.platform} onChange={(e) => setField("platform", e.target.value)} className={inputCls}>
                {PLATFORM_OPTIONS.map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
              </select>
            </InputField>
            <InputField label="Target Sampel">
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.target_sampel}
                onChange={(e) => setField("target_sampel", e.target.value)}
                className={inputCls}
              />
            </InputField>
            <InputField label="Tanggal Mulai">
              <input type="date" value={form.tanggal_mulai} onChange={(e) => setField("tanggal_mulai", e.target.value)} className={inputCls} />
            </InputField>
            <InputField label="Tanggal Selesai">
              <input type="date" value={form.tanggal_selesai} onChange={(e) => setField("tanggal_selesai", e.target.value)} className={inputCls} />
            </InputField>
            <InputField label="Cakupan Wilayah">
              <input
                type="text"
                placeholder="Contoh: Seluruh kecamatan Kab. Kepulauan Sula"
                value={form.cakupan_wilayah}
                onChange={(e) => setField("cakupan_wilayah", e.target.value)}
                className={inputCls}
              />
            </InputField>
            {form.platform === "fasih" && (
              <InputField label="FASIH Survey ID">
                <input
                  type="text"
                  placeholder="UUID survey FASIH (opsional)"
                  value={form.fasih_survey_id}
                  onChange={(e) => setField("fasih_survey_id", e.target.value)}
                  className={inputCls}
                />
              </InputField>
            )}
          </div>
        </SectionCard>

        {/* Section: Deskripsi */}
        <SectionCard title="Deskripsi & Metodologi">
          <div className="space-y-4">
            <InputField label="Deskripsi Kegiatan">
              <textarea
                rows={3}
                placeholder="Jelaskan secara singkat kegiatan ini..."
                value={form.deskripsi}
                onChange={(e) => setField("deskripsi", e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </InputField>
            <InputField label="Tujuan">
              <textarea
                rows={2}
                placeholder="Tujuan pelaksanaan kegiatan..."
                value={form.tujuan}
                onChange={(e) => setField("tujuan", e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </InputField>
            <InputField label="Metodologi">
              <textarea
                rows={2}
                placeholder="Metodologi yang digunakan..."
                value={form.metodologi}
                onChange={(e) => setField("metodologi", e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </InputField>
          </div>
        </SectionCard>

        {/* Section: Fase */}
        <SectionCard title="Fase / Timeline Pelaksanaan" action={
          <button type="button" onClick={addFase} className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Tambah Fase
          </button>
        }>
          {fase.length === 0 ? (
            <div
              onClick={addFase}
              className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-gray-600 transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Klik untuk menambah fase pertama</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fase.map((f, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-950 rounded-xl border border-gray-800">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Nama Fase</label>
                    <input
                      type="text"
                      value={f.nama_fase}
                      onChange={(e) => updateFase(idx, "nama_fase", e.target.value)}
                      placeholder="Contoh: Pencacahan Lapangan"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Mulai</label>
                    <input type="date" value={f.tanggal_mulai} onChange={(e) => updateFase(idx, "tanggal_mulai", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Selesai</label>
                    <input type="date" value={f.tanggal_selesai} onChange={(e) => updateFase(idx, "tanggal_selesai", e.target.value)} className={inputCls} />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Status</label>
                      <select value={f.status} onChange={(e) => updateFase(idx, "status", e.target.value)} className={inputCls}>
                        {FASE_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{FASE_STATUS_LABELS[o]}</option>)}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFase(idx)}
                      className="p-2 text-gray-600 hover:text-red-400 transition-colors mb-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end pb-8">
          <Link
            href="/kegiatan"
            className="px-5 py-2.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4" /> Simpan Kegiatan</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

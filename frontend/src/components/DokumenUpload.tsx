"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, File, X, CheckCircle2, Loader2, FileText, FileSpreadsheet, Image } from "lucide-react";
import type { Dokumen, KategoriDokumen } from "@/lib/types";
import { dokumenApi, formatBytes } from "@/lib/api";

const KATEGORI_OPTIONS: { value: KategoriDokumen; label: string }[] = [
  { value: "sk",         label: "Surat Keputusan (SK)" },
  { value: "pedoman",    label: "Buku Pedoman" },
  { value: "kuesioner",  label: "Kuesioner / Instrumen" },
  { value: "laporan",    label: "Laporan" },
  { value: "lainnya",    label: "Lainnya" },
];

function getFileIcon(mimeType?: string) {
  if (!mimeType) return <File className="w-4 h-4" />;
  if (mimeType.includes("pdf") || mimeType.includes("word")) return <FileText className="w-4 h-4" />;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return <FileSpreadsheet className="w-4 h-4" />;
  if (mimeType.includes("image")) return <Image className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

interface DokumenUploadProps {
  kegiatanId: string;
  existingDokumen: Dokumen[];
  onUploaded: (dok: Dokumen) => void;
  onDeleted: (dokumenId: string) => void;
}

export default function DokumenUpload({
  kegiatanId, existingDokumen, onUploaded, onDeleted
}: DokumenUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [kategori, setKategori] = useState<KategoriDokumen>("lainnya");
  const [deskripsi, setDeskripsi] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const dok = await dokumenApi.upload(kegiatanId, selectedFile, kategori, deskripsi || undefined);
      onUploaded(dok);
      setSelectedFile(null);
      setDeskripsi("");
      setKategori("lainnya");
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (dokId: string) => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      await dokumenApi.delete(dokId);
      onDeleted(dokId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isDragging
            ? "border-orange-500 bg-orange-500/5"
            : "border-gray-700 hover:border-gray-600"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        style={{ cursor: selectedFile ? "default" : "pointer" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png,.csv,.txt"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />

        {!selectedFile ? (
          <div>
            <div className="w-12 h-12 bg-gray-800 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">
              Seret & lepas file ke sini, atau{" "}
              <span className="text-orange-400 font-medium">pilih file</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">PDF, Word, Excel, Gambar, CSV — Maks. 20 MB</p>
          </div>
        ) : (
          <div className="text-left" onClick={(e) => e.stopPropagation()}>
            {/* File info */}
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg mb-4">
              <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400">
                {getFileIcon(selectedFile.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload form */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kategori Dokumen</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriDokumen)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  {KATEGORI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Deskripsi (opsional)</label>
                <input
                  type="text"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Contoh: SK Tim SAKERNAS Agustus 2026"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-red-400 mt-2">{uploadError}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-3 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Mengunggah...</>
              ) : (
                <><Upload className="w-4 h-4" /> Unggah Dokumen</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Existing documents */}
      {existingDokumen.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Dokumen Tersimpan ({existingDokumen.length})
          </p>
          <div className="space-y-2">
            {existingDokumen.map((dok) => (
              <div
                key={dok.id}
                className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-lg group"
              >
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                  {getFileIcon(dok.mime_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={dokumenApi.downloadUrl(dok.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white hover:text-orange-400 transition-colors font-medium truncate block"
                  >
                    {dok.nama_asli}
                  </a>
                  <p className="text-xs text-gray-500">
                    {dok.kategori.toUpperCase()} · {formatBytes(dok.ukuran_bytes)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(dok.id)}
                  className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
